using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApplyPannuBro.Data;
using ApplyPannuBro.Models;

namespace ApplyPannuBro.Controllers.Api
{
    [ApiController]
    [Route("api/auth")]
    public class AuthApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AuthApiController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
                return BadRequest(new { message = "Username and password are required." });

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
            if (user == null || user.IsBlocked)
                return Unauthorized(new { message = "Invalid username or account is blocked." });

            var hasher = new PasswordHasher<User>();
            var verificationResult = hasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
            if (verificationResult == PasswordVerificationResult.Failed)
                return Unauthorized(new { message = "Invalid password." });

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim("UserId", user.Id.ToString())
            };

            var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var authProperties = new AuthenticationProperties
            {
                IsPersistent = request.RememberMe,
                ExpiresUtc = DateTimeOffset.UtcNow.AddDays(7)
            };

            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(claimsIdentity), authProperties);

            user.LastLogin = DateTime.UtcNow;
            _context.UserActivityLogs.Add(new UserActivityLog
            {
                UserId = user.Id,
                Username = user.Username,
                Action = "Login Success",
                Details = $"User logged in with role {user.Role}",
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown"
            });
            await _context.SaveChangesAsync();

            return Ok(new { username = user.Username, role = user.Role.ToString() });
        }

        [HttpPost("logout")]
        [HttpGet("logout")]
        public async Task<IActionResult> Logout()
        {
            var username = User.Identity?.Name ?? "Anonymous";
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

            _context.UserActivityLogs.Add(new UserActivityLog
            {
                Username = username,
                Action = "Logout",
                Details = "User logged out",
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown"
            });
            await _context.SaveChangesAsync();

            return Ok(new { message = "Logged out successfully" });
        }

        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var username = User.Identity?.Name;
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
            if (user == null)
                return Unauthorized();

            var hasher = new PasswordHasher<User>();
            var verificationResult = hasher.VerifyHashedPassword(user, user.PasswordHash, request.CurrentPassword);
            if (verificationResult == PasswordVerificationResult.Failed)
                return BadRequest(new { message = "Incorrect current password." });

            user.PasswordHash = hasher.HashPassword(user, request.NewPassword);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Password changed successfully" });
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            var username = User.Identity?.Name;
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
            if (user == null)
                return Unauthorized();

            return Ok(new
            {
                username = user.Username,
                role = user.Role.ToString(),
                isBlocked = user.IsBlocked,
                createdAt = user.CreatedAt,
                lastLogin = user.LastLogin
            });
        }
    }

    public class LoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public bool RememberMe { get; set; }
    }

    public class ChangePasswordRequest
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}
