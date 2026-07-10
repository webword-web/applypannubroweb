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
    [Route("api/banners")]
    public class BannersApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<LiveUpdateHub> _hubContext;

        public BannersApiController(ApplicationDbContext context, IHubContext<LiveUpdateHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetBanners([FromQuery] string? type, [FromQuery] bool? isActive)
        {
            IQueryable<Banner> query = _context.Banners;

            if (!string.IsNullOrEmpty(type))
            {
                query = query.Where(b => b.Type == type);
            }

            if (isActive.HasValue)
            {
                query = query.Where(b => b.IsActive == isActive.Value);
            }

            var banners = await query.OrderBy(b => b.DisplayOrder).ToListAsync();
            return Ok(banners);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetBanner(int id)
        {
            var banner = await _context.Banners.FindAsync(id);
            if (banner == null)
                return NotFound();

            return Ok(banner);
        }

        [Authorize(Roles = "SuperAdmin,Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateBanner([FromBody] Banner banner)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            _context.Banners.Add(banner);
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("ReceiveUpdate", "Banners");

            return CreatedAtAction(nameof(GetBanner), new { id = banner.Id }, banner);
        }

        [Authorize(Roles = "SuperAdmin,Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBanner(int id, [FromBody] Banner bannerData)
        {
            if (id != bannerData.Id)
                return BadRequest();

            var dbBanner = await _context.Banners.FindAsync(id);
            if (dbBanner == null)
                return NotFound();

            dbBanner.Title = bannerData.Title;
            if (!string.IsNullOrEmpty(bannerData.ImageUrl)) dbBanner.ImageUrl = bannerData.ImageUrl;
            dbBanner.Type = bannerData.Type;
            dbBanner.LinkUrl = bannerData.LinkUrl;
            dbBanner.IsActive = bannerData.IsActive;
            dbBanner.DisplayOrder = bannerData.DisplayOrder;
            dbBanner.Content = bannerData.Content;

            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("ReceiveUpdate", "Banners");

            return NoContent();
        }

        [Authorize(Roles = "SuperAdmin,Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBanner(int id)
        {
            var banner = await _context.Banners.FindAsync(id);
            if (banner == null)
                return NotFound();

            _context.Banners.Remove(banner);
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("ReceiveUpdate", "Banners");

            return NoContent();
        }

        [Authorize(Roles = "SuperAdmin,Admin")]
        [HttpPatch("{id}/toggle-active")]
        public async Task<IActionResult> ToggleActive(int id)
        {
            var banner = await _context.Banners.FindAsync(id);
            if (banner == null)
                return NotFound();

            banner.IsActive = !banner.IsActive;
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("ReceiveUpdate", "Banners");

            return Ok(new { isActive = banner.IsActive });
        }
    }
}
