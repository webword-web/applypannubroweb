using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApplyPannuBro.Data;
using ApplyPannuBro.Models;
using ApplyPannuBro.Services;

namespace ApplyPannuBro.Controllers.Api
{
    [ApiController]
    [Route("api/contacts")]
    public class ContactsApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;

        public ContactsApiController(ApplicationDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateMessage([FromBody] ContactMessage msg)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            msg.CreatedAt = DateTime.UtcNow;
            msg.IsCompleted = false;

            _context.ContactMessages.Add(msg);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Message submitted successfully." });
        }

        [Authorize(Roles = "SuperAdmin,Admin,Staff")]
        [HttpGet]
        public async Task<IActionResult> GetMessages([FromQuery] bool? isCompleted)
        {
            IQueryable<ContactMessage> query = _context.ContactMessages;

            if (isCompleted.HasValue)
            {
                query = query.Where(m => m.IsCompleted == isCompleted.Value);
            }

            var messages = await query.OrderByDescending(m => m.CreatedAt).ToListAsync();
            return Ok(messages);
        }

        [Authorize(Roles = "SuperAdmin,Admin,Staff")]
        [HttpPost("{id}/reply")]
        public async Task<IActionResult> ReplyMessage(int id, [FromBody] ContactReplyRequest request)
        {
            if (string.IsNullOrEmpty(request.ReplyMessage))
                return BadRequest(new { message = "Reply message is required." });

            var msg = await _context.ContactMessages.FindAsync(id);
            if (msg == null)
                return NotFound();

            var currentUsername = User.Identity?.Name ?? "Admin";

            var emailSubject = $"Reply to your message: {msg.Subject}";
            var emailBody = $@"
                <h3>Hello {msg.Name},</h3>
                <p>Thank you for contacting Apply Pannu Bro. Here is our response to your inquiry:</p>
                <blockquote style='background:#f3f4f6;padding:15px;border-left:5px solid #2563eb;'>
                    {request.ReplyMessage.Replace("\n", "<br/>")}
                </blockquote>
                <p>Best Regards,<br/><strong>Apply Pannu Bro Team</strong></p>";

            try
            {
                await _emailService.SendEmailAsync(msg.Email, emailSubject, emailBody);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ContactsApi] Email send failed: {ex.Message}");
            }

            msg.ReplyMessage = request.ReplyMessage;
            msg.RepliedBy = currentUsername;
            msg.RepliedAt = DateTime.UtcNow;
            msg.IsCompleted = true;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Reply sent and message marked as completed successfully." });
        }

        [Authorize(Roles = "SuperAdmin,Admin,Staff")]
        [HttpPatch("{id}/complete")]
        public async Task<IActionResult> ToggleComplete(int id)
        {
            var msg = await _context.ContactMessages.FindAsync(id);
            if (msg == null)
                return NotFound();

            msg.IsCompleted = !msg.IsCompleted;
            if (msg.IsCompleted)
            {
                msg.RepliedBy = User.Identity?.Name ?? "Admin";
                msg.RepliedAt = DateTime.UtcNow;
            }
            else
            {
                msg.RepliedBy = null;
                msg.RepliedAt = null;
            }

            await _context.SaveChangesAsync();

            return Ok(new { isCompleted = msg.IsCompleted });
        }

        [Authorize(Roles = "SuperAdmin,Admin,Staff")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMessage(int id)
        {
            var msg = await _context.ContactMessages.FindAsync(id);
            if (msg == null)
                return NotFound();

            _context.ContactMessages.Remove(msg);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    public class ContactReplyRequest
    {
        public string ReplyMessage { get; set; } = string.Empty;
    }
}
