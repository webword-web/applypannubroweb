using System;

namespace ApplyPannuBro.Models
{
    public class AuditLog
    {
        public int Id { get; set; }
        public string EntityName { get; set; } = string.Empty;
        public int EntityId { get; set; }
        public string Action { get; set; } = string.Empty;
        public string ChangedBy { get; set; } = string.Empty;
        public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
        public string OldValues { get; set; } = string.Empty;
        public string NewValues { get; set; } = string.Empty;
        public string IpAddress { get; set; } = string.Empty;
    }
}
