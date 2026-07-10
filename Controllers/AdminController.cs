using Microsoft.AspNetCore.Mvc;

namespace ApplyPannuBro.Controllers
{
    public class AdminController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
