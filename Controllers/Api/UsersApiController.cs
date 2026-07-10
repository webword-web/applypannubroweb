using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApplyPannuBro.Data;
using ApplyPannuBro.Models;

namespace ApplyPannuBro.Controllers.Api
{
    [ApiController]
    [Route("api/users")]
    [Authorize(Roles = "SuperAdmin")]
    public class UsersApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersApiController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new { u.Id, u.Username, u.Role, u.IsBlocked, u.CreatedAt, u.LastLogin })
                .ToListAsync();
            return Ok(users);
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
        {
            if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
                return BadRequest(new { message = "Username and password are required." });

            var exists = await _context.Users.AnyAsync(u => u.Username == request.Username);
            if (exists)
                return BadRequest(new { message = "Username already exists." });

            var user = new User
            {
                Username = request.Username,
                Role = request.Role,
                CreatedAt = DateTime.UtcNow,
                IsBlocked = false
            };

            var hasher = new PasswordHasher<User>();
            user.PasswordHash = hasher.HashPassword(user, request.Password);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { id = user.Id, username = user.Username, role = user.Role });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequest request)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();

            var currentUsername = User.Identity?.Name;
            if (user.Username == currentUsername)
                return BadRequest(new { message = "You cannot modify your own role or blocked status." });

            user.Role = request.Role;
            user.IsBlocked = request.IsBlocked;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("{id}/reset-password")]
        public async Task<IActionResult> ResetPassword(int id, [FromBody] ResetPasswordRequest request)
        {
            if (string.IsNullOrEmpty(request.NewPassword))
                return BadRequest(new { message = "New password is required." });

            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();

            var hasher = new PasswordHasher<User>();
            user.PasswordHash = hasher.HashPassword(user, request.NewPassword);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Password reset successfully." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();

            var currentUsername = User.Identity?.Name;
            if (user.Username == currentUsername)
                return BadRequest(new { message = "You cannot delete your own account." });

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("activity-logs")]
        public async Task<IActionResult> GetActivityLogs([FromQuery] int limit = 100)
        {
            var logs = await _context.UserActivityLogs
                .OrderByDescending(l => l.Timestamp)
                .Take(limit)
                .ToListAsync();
            return Ok(logs);
        }

        [HttpGet("audit-logs")]
        public async Task<IActionResult> GetAuditLogs([FromQuery] int limit = 100)
        {
            var logs = await _context.AuditLogs
                .OrderByDescending(l => l.ChangedAt)
                .Take(limit)
                .ToListAsync();
            return Ok(logs);
        }
    }

    public class CreateUserRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public UserRole Role { get; set; } = UserRole.Staff;
    }

    public class UpdateUserRequest
    {
        public UserRole Role { get; set; }
        public bool IsBlocked { get; set; }
    }

    public class ResetPasswordRequest
    {
        public string NewPassword { get; set; } = string.Empty;
    }
}
