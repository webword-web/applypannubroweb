using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Data.SqlClient;
using ApplyPannuBro.Data;

namespace ApplyPannuBro.Services
{
    public interface IBackupService
    {
        Task<string> BackupDatabaseAsync();
        Task RestoreDatabaseAsync(string backupFileName);
        List<string> GetBackupFiles();
        string ExportToCsv<T>(IEnumerable<T> data);
    }

    public class BackupService : IBackupService
    {
        private readonly ApplicationDbContext _context;
        private readonly string _backupFolder;
        private readonly string _connectionString;

        public BackupService(ApplicationDbContext context, IConfiguration config, IWebHostEnvironment env)
        {
            _context = context;
            _connectionString = context.Database.GetConnectionString() ?? "";
            
            var webRoot = env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            _backupFolder = Path.Combine(webRoot, "backups");
            if (!Directory.Exists(_backupFolder))
                Directory.CreateDirectory(_backupFolder);
        }

        public async Task<string> BackupDatabaseAsync()
        {
            var fileName = $"Backup_{DateTime.Now:yyyyMMdd_HHmmss}.bak";
            var filePath = Path.Combine(_backupFolder, fileName);

            var builder = new SqlConnectionStringBuilder(_connectionString);
            var dbName = builder.InitialCatalog;

            if (string.IsNullOrEmpty(dbName))
                throw new InvalidOperationException("Could not extract database name from connection string.");

            var sql = $"BACKUP DATABASE [{dbName}] TO DISK = @path WITH FORMAT, MEDIANAME = 'DbBackups', NAME = 'Full Backup of {dbName}';";
            
            var param = new SqlParameter("@path", filePath);
            
            _context.Database.SetCommandTimeout(300);
            await _context.Database.ExecuteSqlRawAsync(sql, param);

            return fileName;
        }

        public async Task RestoreDatabaseAsync(string backupFileName)
        {
            var filePath = Path.Combine(_backupFolder, backupFileName);
            if (!File.Exists(filePath))
                throw new FileNotFoundException("Backup file not found", filePath);

            var builder = new SqlConnectionStringBuilder(_connectionString);
            var dbName = builder.InitialCatalog;

            if (string.IsNullOrEmpty(dbName))
                throw new InvalidOperationException("Could not extract database name from connection string.");

            var sql = $@"
                USE [master];
                ALTER DATABASE [{dbName}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
                RESTORE DATABASE [{dbName}] FROM DISK = @path WITH REPLACE;
                ALTER DATABASE [{dbName}] SET MULTI_USER;";

            var param = new SqlParameter("@path", filePath);

            var masterConnBuilder = new SqlConnectionStringBuilder(_connectionString)
            {
                InitialCatalog = "master"
            };

            using (var conn = new SqlConnection(masterConnBuilder.ConnectionString))
            {
                await conn.OpenAsync();
                using (var cmd = new SqlCommand(sql, conn))
                {
                    cmd.Parameters.Add(param);
                    cmd.CommandTimeout = 300;
                    await cmd.ExecuteNonQueryAsync();
                }
            }
        }

        public List<string> GetBackupFiles()
        {
            if (!Directory.Exists(_backupFolder)) return new List<string>();
            return Directory.GetFiles(_backupFolder, "*.bak")
                .Select(Path.GetFileName)
                .OrderByDescending(f => f)
                .ToList()!;
        }

        public string ExportToCsv<T>(IEnumerable<T> data)
        {
            if (data == null || !data.Any())
                return string.Empty;

            var sb = new StringBuilder();
            var properties = typeof(T).GetProperties();

            sb.AppendLine(string.Join(",", properties.Select(p => $"\"{p.Name}\"")));

            foreach (var item in data)
            {
                var row = properties.Select(p =>
                {
                    var val = p.GetValue(item);
                    if (val == null) return "\"\"";
                    
                    var str = val.ToString() ?? "";
                    str = str.Replace("\"", "\"\"");
                    
                    if (val is DateTime dt)
                        str = dt.ToString("yyyy-MM-dd HH:mm:ss");

                    return $"\"{str}\"";
                });
                sb.AppendLine(string.Join(",", row));
            }

            return sb.ToString();
        }
    }
}
