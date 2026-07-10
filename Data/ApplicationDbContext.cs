using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using ApplyPannuBro.Models;

namespace ApplyPannuBro.Data
{
    public class ApplicationDbContext : DbContext
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, IHttpContextAccessor httpContextAccessor)
            : base(options)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<Job> Jobs => Set<Job>();
        public DbSet<Service> Services => Set<Service>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Banner> Banners => Set<Banner>();
        public DbSet<ContactMessage> ContactMessages => Set<ContactMessage>();
        public DbSet<Setting> Settings => Set<Setting>();
        public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
        public DbSet<UserActivityLog> UserActivityLogs => Set<UserActivityLog>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Set Key unique constraint for Settings
            modelBuilder.Entity<Setting>()
                .HasIndex(s => s.Key)
                .IsUnique();
        }

        public override int SaveChanges()
        {
            var auditEntries = OnBeforeSaveChanges();
            var result = base.SaveChanges();
            if (auditEntries.Count > 0)
            {
                OnAfterSaveChanges(auditEntries);
                base.SaveChanges();
            }
            return result;
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var auditEntries = OnBeforeSaveChanges();
            var result = await base.SaveChangesAsync(cancellationToken);
            if (auditEntries.Count > 0)
            {
                OnAfterSaveChanges(auditEntries);
                await base.SaveChangesAsync(cancellationToken);
            }
            return result;
        }

        private List<AuditEntry> OnBeforeSaveChanges()
        {
            ChangeTracker.DetectChanges();
            var auditEntries = new List<AuditEntry>();

            var httpContext = _httpContextAccessor.HttpContext;
            string username = httpContext?.User?.Identity?.Name ?? "Anonymous";
            string ipAddress = httpContext?.Connection?.RemoteIpAddress?.ToString() ?? "Unknown";

            foreach (var entry in ChangeTracker.Entries())
            {
                if (entry.Entity is AuditLog || entry.Entity is UserActivityLog || entry.State == EntityState.Detached || entry.State == EntityState.Unchanged)
                    continue;

                var auditEntry = new AuditEntry(entry)
                {
                    TableName = entry.Entity.GetType().Name,
                    ChangedBy = username,
                    IpAddress = ipAddress,
                    Action = entry.State.ToString()
                };

                auditEntries.Add(auditEntry);

                foreach (var property in entry.Properties)
                {
                    string propertyName = property.Metadata.Name;
                    if (property.Metadata.IsPrimaryKey())
                    {
                        auditEntry.KeyValues[propertyName] = property.CurrentValue ?? "";
                        if (entry.State == EntityState.Added)
                        {
                            auditEntry.TemporaryProperties.Add(property);
                        }
                        continue;
                    }

                    switch (entry.State)
                    {
                        case EntityState.Added:
                            auditEntry.NewValues[propertyName] = property.CurrentValue ?? "";
                            break;

                        case EntityState.Deleted:
                            auditEntry.OldValues[propertyName] = property.OriginalValue ?? "";
                            break;

                        case EntityState.Modified:
                            if (property.IsModified)
                            {
                                auditEntry.OldValues[propertyName] = property.OriginalValue ?? "";
                                auditEntry.NewValues[propertyName] = property.CurrentValue ?? "";
                            }
                            break;
                    }
                }
            }

            foreach (var auditEntry in auditEntries.Where(_ => !_.HasTemporaryProperties))
            {
                AuditLogs.Add(auditEntry.ToAuditLog());
            }

            return auditEntries.Where(_ => _.HasTemporaryProperties).ToList();
        }

        private void OnAfterSaveChanges(List<AuditEntry> auditEntries)
        {
            foreach (var auditEntry in auditEntries)
            {
                foreach (var prop in auditEntry.TemporaryProperties)
                {
                    if (prop.Metadata.IsPrimaryKey())
                    {
                        auditEntry.KeyValues[prop.Metadata.Name] = prop.CurrentValue ?? "";
                    }
                    else
                    {
                        auditEntry.NewValues[prop.Metadata.Name] = prop.CurrentValue ?? "";
                    }
                }
                AuditLogs.Add(auditEntry.ToAuditLog());
            }
        }
    }

    internal class AuditEntry
    {
        public AuditEntry(Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry entry)
        {
            Entry = entry;
        }

        public Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry Entry { get; }
        public string TableName { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string ChangedBy { get; set; } = string.Empty;
        public string IpAddress { get; set; } = string.Empty;
        public Dictionary<string, object> KeyValues { get; } = new();
        public Dictionary<string, object> OldValues { get; } = new();
        public Dictionary<string, object> NewValues { get; } = new();
        public List<Microsoft.EntityFrameworkCore.ChangeTracking.PropertyEntry> TemporaryProperties { get; } = new();

        public bool HasTemporaryProperties => TemporaryProperties.Any();

        public AuditLog ToAuditLog()
        {
            var audit = new AuditLog
            {
                EntityName = TableName,
                Action = Action,
                ChangedBy = ChangedBy,
                ChangedAt = DateTime.UtcNow,
                IpAddress = IpAddress,
                OldValues = OldValues.Count == 0 ? string.Empty : JsonSerializer.Serialize(OldValues),
                NewValues = NewValues.Count == 0 ? string.Empty : JsonSerializer.Serialize(NewValues)
            };

            if (KeyValues.Count > 0)
            {
                var pkVal = KeyValues.Values.FirstOrDefault();
                if (pkVal != null && int.TryParse(pkVal.ToString(), out int id))
                {
                    audit.EntityId = id;
                }
            }

            return audit;
        }
    }
}
