using System;

namespace ApplyPannuBro.Models
{
    public class Job
    {
        public int Id { get; set; }
        public string Organization { get; set; } = string.Empty;
        public string OrgShort { get; set; } = string.Empty;
        public int Vacancy { get; set; }
        public string Eligibility { get; set; } = string.Empty;
        
        public DateTime LastDate { get; set; }
        public string ApplyLink { get; set; } = string.Empty;
        
        public int CategoryId { get; set; }
        public Category? Category { get; set; }
        
        public string Badge { get; set; } = string.Empty;
        public string LogoUrl { get; set; } = string.Empty;
        public string PdfUrl { get; set; } = string.Empty;
        
        public string Salary { get; set; } = string.Empty;
        public string Qualification { get; set; } = string.Empty;
        public string Experience { get; set; } = string.Empty;
        public string JobType { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Skills { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public bool IsFeatured { get; set; } = false;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
