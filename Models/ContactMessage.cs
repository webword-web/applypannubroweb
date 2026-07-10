using System;

namespace ApplyPannuBro.Models
{
    public class ContactMessage
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public bool IsCompleted { get; set; } = false;
        public string ReplyMessage { get; set; } = string.Empty;
        public string? RepliedBy { get; set; }
        public DateTime? RepliedAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
