using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Identity;
using ApplyPannuBro.Models;

namespace ApplyPannuBro.Data
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context)
        {
            context.Database.EnsureCreated();

            // Seed User
            if (!context.Users.Any())
            {
                var hasher = new PasswordHasher<User>();
                var adminUser = new User
                {
                    Username = "admin",
                    Role = UserRole.SuperAdmin,
                    CreatedAt = DateTime.UtcNow,
                    IsBlocked = false
                };
                adminUser.PasswordHash = hasher.HashPassword(adminUser, "apb@2025");
                context.Users.Add(adminUser);
                context.SaveChanges();
            }

            // Seed Categories
            if (!context.Categories.Any())
            {
                context.Categories.AddRange(
                    new Category { Name = "Railway", Icon = "fa-solid fa-train", Color = "#2563eb", DisplayOrder = 1 },
                    new Category { Name = "Bank", Icon = "fa-solid fa-building-columns", Color = "#10b981", DisplayOrder = 2 },
                    new Category { Name = "PSU", Icon = "fa-solid fa-industry", Color = "#f59e0b", DisplayOrder = 3 },
                    new Category { Name = "Central Govt", Icon = "fa-solid fa-landmark", Color = "#8b5cf6", DisplayOrder = 4 },
                    new Category { Name = "Defence", Icon = "fa-solid fa-shield-halved", Color = "#ef4444", DisplayOrder = 5 },
                    new Category { Name = "Research", Icon = "fa-solid fa-microscope", Color = "#ec4899", DisplayOrder = 6 },
                    new Category { Name = "State Govt", Icon = "fa-solid fa-map-location-dot", Color = "#6366f1", DisplayOrder = 7 }
                );
                context.SaveChanges();
            }

            // Seed Settings
            if (!context.Settings.Any())
            {
                var settings = new List<Setting>
                {
                    new Setting { Key = "WebsiteName", Value = "APPLY PANNU BRO", Category = "General" },
                    new Setting { Key = "LogoUrl", Value = "/logo/logo.png", Category = "General" },
                    new Setting { Key = "FaviconUrl", Value = "/logo/favicon.ico", Category = "General" },
                    new Setting { Key = "WhatsappNumber", Value = "918525041700", Category = "Contacts" },
                    new Setting { Key = "DisplayPhone", Value = "8525041700", Category = "Contacts" },
                    new Setting { Key = "Email", Value = "applypannubro@gmail.com", Category = "Contacts" },
                    new Setting { Key = "WorkingHours", Value = "24x7 Support Available", Category = "Contacts" },
                    new Setting { Key = "InstagramUrl", Value = "https://www.instagram.com/applypannubro?igsh=MXg4M3Z2eHZqcTFlZQ==", Category = "Social" },
                    new Setting { Key = "FacebookUrl", Value = "https://www.facebook.com/applypannubro", Category = "Social" },
                    new Setting { Key = "HeroTitle", Value = "APPLY PANNU BRO", Category = "Hero" },
                    new Setting { Key = "HeroSubtitle", Value = "One Stop Solution For All Your Needs", Category = "Hero" },
                    new Setting { Key = "SearchPlaceholder", Value = "Search services (e.g. PAN, Aadhaar)...", Category = "Hero" },
                    new Setting { Key = "ServicesButtonText", Value = "அனைத்து சேவைகள்", Category = "Hero" },
                    new Setting { Key = "WhatsappButtonText", Value = "WhatsApp Now", Category = "Hero" },
                    new Setting { Key = "CallButtonText", Value = "Call Now", Category = "Hero" },
                    new Setting { Key = "JobUpdatesButtonText", Value = "📢 Government & Private Job Updates", Category = "Hero" },
                    new Setting { Key = "FooterDescription", Value = "உங்கள் அனைத்து ஆன்லைன் அரசு மற்றும் தனியார் சேவைகளுக்கும் ஒரே தீர்வு.", Category = "Footer" },
                    new Setting { Key = "CopyrightYear", Value = "2026", Category = "Footer" },
                    new Setting { Key = "SEOMetaDescription", Value = "Apply Pannu Bro offers seamless online government, education, business, and booking services with 100% customer satisfaction.", Category = "SEO" },
                    new Setting { Key = "GoogleAnalyticsId", Value = "", Category = "Analytics" }
                };
                context.Settings.AddRange(settings);
                context.SaveChanges();
            }

            // Seed Services
            if (!context.Services.Any())
            {
                context.Services.AddRange(
                    new Service { Title = "PAN Card Apply", Description = "புதிய பேன் கார்டு விண்ணப்பிக்க மற்றும் திருத்தங்கள் செய்ய", Price = "₹200", Icon = "fa-solid fa-id-card", Category = "Government", IsEnabled = true, Status = "available", DisplayOrder = 1 },
                    new Service { Title = "Aadhaar Card Update", Description = "ஆதார் கார்டில் பெயர், பிறந்த தேதி, முகவரி, கைபேசி எண் மாற்றம் செய்ய", Price = "₹100", Icon = "fa-solid fa-fingerprint", Category = "Government", IsEnabled = true, Status = "available", DisplayOrder = 2 },
                    new Service { Title = "TNPSC Exam Apply", Description = "தமிழ்நாடு அரசு தேர்வுகளுக்கு விண்ணப்பிக்க", Price = "₹150", Icon = "fa-solid fa-graduation-cap", Category = "Education", IsEnabled = true, Status = "available", DisplayOrder = 3 },
                    new Service { Title = "Passport Apply", Description = "புதிய பாஸ்போர்ட் விண்ணப்பிக்க", Price = "₹1500", Icon = "fa-solid fa-passport", Category = "Government", IsEnabled = true, Status = "available", DisplayOrder = 4 }
                );
                context.SaveChanges();
            }
        }
    }
}
