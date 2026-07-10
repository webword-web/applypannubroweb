using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using ApplyPannuBro.Data;
using ApplyPannuBro.Hubs;
using ApplyPannuBro.Models;

namespace ApplyPannuBro.Controllers.Api
{
    [ApiController]
    [Route("api/services")]
    public class ServicesApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<LiveUpdateHub> _hubContext;

        public ServicesApiController(ApplicationDbContext context, IHubContext<LiveUpdateHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetServices(
            [FromQuery] string? search,
            [FromQuery] string? category,
            [FromQuery] bool? isEnabled,
            [FromQuery] string? status,
            [FromQuery] bool adminMode = false)
        {
            IQueryable<Service> query = _context.Services;

            if (!adminMode)
            {
                query = query.Where(s => s.IsEnabled);
            }
            else
            {
                if (!User.Identity?.IsAuthenticated ?? true)
                    return Unauthorized();
            }

            if (!string.IsNullOrEmpty(search))
            {
                var lowerSearch = search.ToLower();
                query = query.Where(s => s.Title.ToLower().Contains(lowerSearch) || s.Description.ToLower().Contains(lowerSearch));
            }

            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(s => s.Category == category);
            }

            if (isEnabled.HasValue)
            {
                query = query.Where(s => s.IsEnabled == isEnabled.Value);
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(s => s.Status == status);
            }

            var services = await query.OrderBy(s => s.DisplayOrder).ThenBy(s => s.Title).ToListAsync();
            return Ok(services);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetService(int id)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null)
                return NotFound();

            return Ok(service);
        }

        [Authorize(Roles = "SuperAdmin,Admin,Staff")]
        [HttpPost]
        public async Task<IActionResult> CreateService([FromBody] Service service)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            _context.Services.Add(service);
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("ReceiveUpdate", "Services");

            return CreatedAtAction(nameof(GetService), new { id = service.Id }, service);
        }

        [Authorize(Roles = "SuperAdmin,Admin,Staff")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateService(int id, [FromBody] Service serviceData)
        {
            if (id != serviceData.Id)
                return BadRequest();

            var dbService = await _context.Services.FindAsync(id);
            if (dbService == null)
                return NotFound();

            dbService.Title = serviceData.Title;
            dbService.Description = serviceData.Description;
            dbService.Price = serviceData.Price;
            dbService.Icon = serviceData.Icon;
            if (!string.IsNullOrEmpty(serviceData.ImageUrl)) dbService.ImageUrl = serviceData.ImageUrl;
            dbService.DisplayOrder = serviceData.DisplayOrder;
            dbService.IsEnabled = serviceData.IsEnabled;
            dbService.Status = serviceData.Status;
            dbService.Category = serviceData.Category;

            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("ReceiveUpdate", "Services");

            return NoContent();
        }

        [Authorize(Roles = "SuperAdmin,Admin,Staff")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteService(int id)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null)
                return NotFound();

            _context.Services.Remove(service);
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("ReceiveUpdate", "Services");

            return NoContent();
        }

        [Authorize(Roles = "SuperAdmin,Admin,Staff")]
        [HttpPatch("{id}/toggle-enabled")]
        public async Task<IActionResult> ToggleEnabled(int id)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null)
                return NotFound();

            service.IsEnabled = !service.IsEnabled;
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("ReceiveUpdate", "Services");

            return Ok(new { isEnabled = service.IsEnabled });
        }

        [Authorize(Roles = "SuperAdmin,Admin,Staff")]
        [HttpPost("reorder")]
        public async Task<IActionResult> ReorderServices([FromBody] List<ServiceOrderModel> orderData)
        {
            if (orderData == null || !orderData.Any())
                return BadRequest();

            foreach (var item in orderData)
            {
                var service = await _context.Services.FindAsync(item.ServiceId);
                if (service != null)
                {
                    service.DisplayOrder = item.DisplayOrder;
                }
            }

            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("ReceiveUpdate", "Services");

            return Ok();
        }
    }

    public class ServiceOrderModel
    {
        public int ServiceId { get; set; }
        public int DisplayOrder { get; set; }
    }
}
