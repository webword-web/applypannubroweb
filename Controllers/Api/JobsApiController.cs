using System;
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
    [Route("api/jobs")]
    public class JobsApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<LiveUpdateHub> _hubContext;

        public JobsApiController(ApplicationDbContext context, IHubContext<LiveUpdateHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetJobs(
            [FromQuery] string? search,
            [FromQuery] int? categoryId,
            [FromQuery] bool? isActive,
            [FromQuery] bool? isFeatured,
            [FromQuery] string? sortBy,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] bool adminMode = false)
        {
            IQueryable<Job> query = _context.Jobs.Include(j => j.Category);

            if (!adminMode)
            {
                query = query.Where(j => j.IsActive);
            }
            else
            {
                if (!User.Identity?.IsAuthenticated ?? true)
                    return Unauthorized();
            }

            if (!string.IsNullOrEmpty(search))
            {
                var lowerSearch = search.ToLower();
                query = query.Where(j => j.Organization.ToLower().Contains(lowerSearch) || 
                                         j.Eligibility.ToLower().Contains(lowerSearch) ||
                                         j.Skills.ToLower().Contains(lowerSearch) ||
                                         j.Location.ToLower().Contains(lowerSearch) ||
                                         j.JobType.ToLower().Contains(lowerSearch));
            }

            if (categoryId.HasValue)
            {
                query = query.Where(j => j.CategoryId == categoryId.Value);
            }

            if (isActive.HasValue)
            {
                query = query.Where(j => j.IsActive == isActive.Value);
            }

            if (isFeatured.HasValue)
            {
                query = query.Where(j => j.IsFeatured == isFeatured.Value);
            }

            query = sortBy switch
            {
                "date" => query.OrderBy(j => j.LastDate),
                "date_desc" => query.OrderByDescending(j => j.LastDate),
                "vacancy" => query.OrderBy(j => j.Vacancy),
                "vacancy_desc" => query.OrderByDescending(j => j.Vacancy),
                "created" => query.OrderBy(j => j.CreatedAt),
                "created_desc" or _ => query.OrderByDescending(j => j.CreatedAt),
            };

            var totalCount = await query.CountAsync();
            var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

            return Ok(new
            {
                totalCount,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize),
                items
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetJob(int id)
        {
            var job = await _context.Jobs.Include(j => j.Category).FirstOrDefaultAsync(j => j.Id == id);
            if (job == null)
                return NotFound();

            return Ok(job);
        }

        [Authorize(Roles = "SuperAdmin,Admin,Staff")]
        [HttpPost]
        public async Task<IActionResult> CreateJob([FromBody] Job job)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            job.CreatedAt = DateTime.UtcNow;
            job.UpdatedAt = DateTime.UtcNow;

            _context.Jobs.Add(job);
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("ReceiveUpdate", "Jobs");

            return CreatedAtAction(nameof(GetJob), new { id = job.Id }, job);
        }

        [Authorize(Roles = "SuperAdmin,Admin,Staff")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateJob(int id, [FromBody] Job jobData)
        {
            if (id != jobData.Id)
                return BadRequest();

            var dbJob = await _context.Jobs.FindAsync(id);
            if (dbJob == null)
                return NotFound();

            dbJob.Organization = jobData.Organization;
            dbJob.OrgShort = jobData.OrgShort;
            dbJob.Vacancy = jobData.Vacancy;
            dbJob.Eligibility = jobData.Eligibility;
            dbJob.LastDate = jobData.LastDate;
            dbJob.ApplyLink = jobData.ApplyLink;
            dbJob.CategoryId = jobData.CategoryId;
            dbJob.Badge = jobData.Badge;
            if (!string.IsNullOrEmpty(jobData.LogoUrl)) dbJob.LogoUrl = jobData.LogoUrl;
            if (!string.IsNullOrEmpty(jobData.PdfUrl)) dbJob.PdfUrl = jobData.PdfUrl;
            dbJob.Salary = jobData.Salary;
            dbJob.Qualification = jobData.Qualification;
            dbJob.Experience = jobData.Experience;
            dbJob.JobType = jobData.JobType;
            dbJob.Location = jobData.Location;
            dbJob.Skills = jobData.Skills;
            dbJob.Description = jobData.Description;
            dbJob.IsActive = jobData.IsActive;
            dbJob.IsFeatured = jobData.IsFeatured;
            dbJob.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("ReceiveUpdate", "Jobs");

            return NoContent();
        }

        [Authorize(Roles = "SuperAdmin,Admin,Staff")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteJob(int id)
        {
            var job = await _context.Jobs.FindAsync(id);
            if (job == null)
                return NotFound();

            _context.Jobs.Remove(job);
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("ReceiveUpdate", "Jobs");

            return NoContent();
        }

        [Authorize(Roles = "SuperAdmin,Admin,Staff")]
        [HttpPatch("{id}/toggle-active")]
        public async Task<IActionResult> ToggleActive(int id)
        {
            var job = await _context.Jobs.FindAsync(id);
            if (job == null)
                return NotFound();

            job.IsActive = !job.IsActive;
            job.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("ReceiveUpdate", "Jobs");

            return Ok(new { isActive = job.IsActive });
        }

        [Authorize(Roles = "SuperAdmin,Admin,Staff")]
        [HttpPatch("{id}/toggle-featured")]
        public async Task<IActionResult> ToggleFeatured(int id)
        {
            var job = await _context.Jobs.FindAsync(id);
            if (job == null)
                return NotFound();

            job.IsFeatured = !job.IsFeatured;
            job.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("ReceiveUpdate", "Jobs");

            return Ok(new { isFeatured = job.IsFeatured });
        }
    }
}
