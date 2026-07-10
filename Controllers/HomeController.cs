using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApplyPannuBro.Data;
using ApplyPannuBro.Models;

namespace ApplyPannuBro.Controllers
{
    public class HomeController : Controller
    {
        private readonly ApplicationDbContext _context;

        public HomeController(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            try
            {
                var visitorSetting = await _context.Settings.FirstOrDefaultAsync(s => s.Key == "VisitorCount");
                if (visitorSetting == null)
                {
                    _context.Settings.Add(new Setting { Key = "VisitorCount", Value = "1", Category = "General" });
                }
                else
                {
                    if (int.TryParse(visitorSetting.Value, out int count))
                    {
                        visitorSetting.Value = (count + 1).ToString();
                    }
                    else
                    {
                        visitorSetting.Value = "1";
                    }
                }
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[HomeController] Failed to increment visitor count: {ex.Message}");
            }

            return View();
        }

        public IActionResult Services() => View();
        public IActionResult JobUpdates() => View();
        public IActionResult About() => View();
        public IActionResult Contact() => View();
        public IActionResult Faq() => View();
        public IActionResult Terms() => View();
        public IActionResult PrivacyPolicy() => View();
        public IActionResult RefundPolicy() => View();
    }
}
