using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApplyPannuBro.Data;

namespace ApplyPannuBro.Controllers.Api
{
    [ApiController]
    [Route("api/dashboard")]
    [Authorize(Roles = "SuperAdmin,Admin,Staff")]
    public class DashboardApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DashboardApiController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var today = DateTime.UtcNow.Date;

            var totalUsers = await _context.Users.CountAsync();
            var totalJobs = await _context.Jobs.CountAsync();
            var activeJobs = await _context.Jobs.CountAsync(j => j.IsActive && j.LastDate >= today);
            var expiredJobs = await _context.Jobs.CountAsync(j => j.LastDate < today);
            var totalServices = await _context.Services.CountAsync();
            var totalCategories = await _context.Categories.CountAsync();

            var visitorSetting = await _context.Settings.FirstOrDefaultAsync(s => s.Key == "VisitorCount");
            int visitorCount = 0;
            if (visitorSetting != null && int.TryParse(visitorSetting.Value, out int count))
            {
                visitorCount = count;
            }

            var recentActivities = await _context.UserActivityLogs
                .OrderByDescending(l => l.Timestamp)
                .Take(10)
                .Select(l => new { l.Username, l.Action, l.Details, l.Timestamp, l.IpAddress })
                .ToListAsync();

            var latestUsers = await _context.Users
                .OrderByDescending(u => u.CreatedAt)
                .Take(5)
                .Select(u => new { u.Username, u.Role, u.CreatedAt })
                .ToListAsync();

            return Ok(new
            {
                totalUsers,
                totalJobs,
                activeJobs,
                expiredJobs,
                totalServices,
                totalCategories,
                visitorCount,
                recentActivities,
                latestUsers
            });
        }
    }
}
