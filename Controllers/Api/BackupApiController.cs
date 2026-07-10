using System;
using System.IO;
using System.Text;
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
    [Route("api/backups")]
    public class BackupApiController : ControllerBase
    {
        private readonly IBackupService _backupService;
        private readonly ApplicationDbContext _context;

        public BackupApiController(IBackupService backupService, ApplicationDbContext context)
        {
            _backupService = backupService;
            _context = context;
        }

        [Authorize(Roles = "SuperAdmin")]
        [HttpPost("backup")]
        public async Task<IActionResult> CreateBackup()
        {
            try
            {
                var fileName = await _backupService.BackupDatabaseAsync();
                
                _context.UserActivityLogs.Add(new UserActivityLog
                {
                    Username = User.Identity?.Name ?? "Admin",
                    Action = "Database Backup",
                    Details = $"Created database backup file {fileName}",
                    IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown"
                });
                await _context.SaveChangesAsync();

                return Ok(new { message = "Backup created successfully.", file = fileName });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Backup failed: " + ex.Message });
            }
        }

        [Authorize(Roles = "SuperAdmin")]
        [HttpGet]
        public IActionResult GetBackups()
        {
            var files = _backupService.GetBackupFiles();
            return Ok(files);
        }

        [Authorize(Roles = "SuperAdmin")]
        [HttpPost("restore")]
        public async Task<IActionResult> RestoreBackup([FromBody] RestoreRequest request)
        {
            if (string.IsNullOrEmpty(request.FileName))
                return BadRequest(new { message = "File name is required." });

            try
            {
                await _backupService.RestoreDatabaseAsync(request.FileName);
                
                _context.UserActivityLogs.Add(new UserActivityLog
                {
                    Username = User.Identity?.Name ?? "Admin",
                    Action = "Database Restore",
                    Details = $"Restored database from file {request.FileName}",
                    IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown"
                });
                await _context.SaveChangesAsync();

                return Ok(new { message = "Database restored successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Restore failed: " + ex.Message });
            }
        }

        [Authorize(Roles = "SuperAdmin,Admin")]
        [HttpGet("export/{type}")]
        public async Task<IActionResult> ExportData(string type)
        {
            string csvContent = string.Empty;
            string fileName = string.Empty;

            switch (type.ToLower())
            {
                case "jobs":
                    var jobs = await _context.Jobs.ToListAsync();
                    csvContent = _backupService.ExportToCsv(jobs);
                    fileName = $"Export_Jobs_{DateTime.Now:yyyyMMdd}.csv";
                    break;
                
                case "services":
                    var services = await _context.Services.ToListAsync();
                    csvContent = _backupService.ExportToCsv(services);
                    fileName = $"Export_Services_{DateTime.Now:yyyyMMdd}.csv";
                    break;
                
                case "users":
                    var users = await _context.Users
                        .Select(u => new { u.Id, u.Username, u.Role, u.IsBlocked, u.CreatedAt, u.LastLogin })
                        .ToListAsync();
                    csvContent = _backupService.ExportToCsv(users);
                    fileName = $"Export_Users_{DateTime.Now:yyyyMMdd}.csv";
                    break;
                
                case "settings":
                    var settings = await _context.Settings.ToListAsync();
                    csvContent = _backupService.ExportToCsv(settings);
                    fileName = $"Export_Settings_{DateTime.Now:yyyyMMdd}.csv";
                    break;
                
                case "contacts":
                    var contacts = await _context.ContactMessages.ToListAsync();
                    csvContent = _backupService.ExportToCsv(contacts);
                    fileName = $"Export_ContactMessages_{DateTime.Now:yyyyMMdd}.csv";
                    break;

                default:
                    return BadRequest(new { message = "Invalid export type. Supported: jobs, services, users, settings, contacts." });
            }

            var bytes = Encoding.UTF8.GetBytes(csvContent);
            return File(bytes, "text/csv", fileName);
        }
    }

    public class RestoreRequest
    {
        public string FileName { get; set; } = string.Empty;
    }
}
