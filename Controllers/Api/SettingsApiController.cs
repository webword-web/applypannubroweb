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
    [Route("api/settings")]
    public class SettingsApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<LiveUpdateHub> _hubContext;

        public SettingsApiController(ApplicationDbContext context, IHubContext<LiveUpdateHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        [HttpGet("public")]
        public async Task<IActionResult> GetPublicSettings()
        {
            var settings = await _context.Settings
                .Where(s => s.Category != "SMTP")
                .ToDictionaryAsync(s => s.Key, s => s.Value);

            return Ok(settings);
        }

        [Authorize(Roles = "SuperAdmin,Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAllSettings()
        {
            var settings = await _context.Settings.ToListAsync();
            return Ok(settings);
        }

        [Authorize(Roles = "SuperAdmin,Admin")]
        [HttpPost("save-multiple")]
        public async Task<IActionResult> SaveMultipleSettings([FromBody] Dictionary<string, string> settingsData)
        {
            if (settingsData == null || !settingsData.Any())
                return BadRequest();

            var isSuperAdmin = User.IsInRole("SuperAdmin");

            foreach (var kvp in settingsData)
            {
                var dbSetting = await _context.Settings.FirstOrDefaultAsync(s => s.Key == kvp.Key);
                if (dbSetting != null)
                {
                    if (dbSetting.Category == "SMTP" && !isSuperAdmin)
                    {
                        continue;
                    }
                    dbSetting.Value = kvp.Value ?? "";
                }
                else
                {
                    string category = "General";
                    if (kvp.Key.StartsWith("Smtp")) category = "SMTP";
                    else if (kvp.Key.Contains("SEO") || kvp.Key.Contains("Meta")) category = "SEO";
                    else if (kvp.Key.Contains("Social") || kvp.Key.Contains("Url")) category = "Social";

                    if (category == "SMTP" && !isSuperAdmin)
                    {
                        continue;
                    }

                    _context.Settings.Add(new Setting
                    {
                        Key = kvp.Key,
                        Value = kvp.Value ?? "",
                        Category = category
                    });
                }
            }

            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("ReceiveUpdate", "Settings");

            return Ok(new { message = "Settings updated successfully." });
        }
    }
}
