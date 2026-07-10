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
    [Route("api/categories")]
    public class CategoriesApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<LiveUpdateHub> _hubContext;

        public CategoriesApiController(ApplicationDbContext context, IHubContext<LiveUpdateHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _context.Categories.OrderBy(c => c.DisplayOrder).ToListAsync();
            return Ok(categories);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return NotFound();

            return Ok(category);
        }

        [Authorize(Roles = "SuperAdmin,Admin,Staff")]
        [HttpPost]
        public async Task<IActionResult> CreateCategory([FromBody] Category category)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("ReceiveUpdate", "Categories");

            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
        }

        [Authorize(Roles = "SuperAdmin,Admin,Staff")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] Category categoryData)
        {
            if (id != categoryData.Id)
                return BadRequest();

            var dbCategory = await _context.Categories.FindAsync(id);
            if (dbCategory == null)
                return NotFound();

            dbCategory.Name = categoryData.Name;
            dbCategory.Icon = categoryData.Icon;
            dbCategory.Color = categoryData.Color;
            dbCategory.DisplayOrder = categoryData.DisplayOrder;

            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("ReceiveUpdate", "Categories");

            return NoContent();
        }

        [Authorize(Roles = "SuperAdmin,Admin,Staff")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return NotFound();

            var isUsed = await _context.Jobs.AnyAsync(j => j.CategoryId == id);
            if (isUsed)
                return BadRequest(new { message = "Category cannot be deleted because it is assigned to one or more jobs." });

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("ReceiveUpdate", "Categories");

            return NoContent();
        }
    }
}
