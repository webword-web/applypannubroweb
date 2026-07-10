using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats.Webp;

namespace ApplyPannuBro.Services
{
    public interface IFileService
    {
        Task<string> SaveImageAsync(IFormFile file, string subFolder);
        Task<string> SavePdfAsync(IFormFile file, string subFolder);
        bool DeleteFile(string fileUrl);
        List<string> ListFiles(string subFolder);
    }

    public class FileService : IFileService
    {
        private readonly string _webRootPath;
        private readonly long _maxSizeBytes;
        private readonly string[] _allowedImageExts;
        private readonly string[] _allowedPdfExts;

        public FileService(IWebHostEnvironment env, IConfiguration config)
        {
            _webRootPath = env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var uploadSettings = config.GetSection("UploadSettings");
            _maxSizeBytes = uploadSettings.GetValue<long>("MaxFileSizeBytes");
            _allowedImageExts = uploadSettings.GetSection("AllowedImageExtensions").Get<string[]>() ?? new[] { ".jpg", ".jpeg", ".png", ".webp" };
            _allowedPdfExts = uploadSettings.GetSection("AllowedPdfExtensions").Get<string[]>() ?? new[] { ".pdf" };
        }

        public async Task<string> SaveImageAsync(IFormFile file, string subFolder)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is empty");

            if (file.Length > _maxSizeBytes)
                throw new InvalidOperationException($"File exceeds maximum allowed size of {_maxSizeBytes / (1024 * 1024)}MB");

            var ext = Path.GetExtension(file.FileName).ToLower();
            if (!_allowedImageExts.Contains(ext))
                throw new InvalidOperationException("Invalid image extension");

            var uploadDir = Path.Combine(_webRootPath, "uploads", subFolder);
            if (!Directory.Exists(uploadDir))
                Directory.CreateDirectory(uploadDir);

            var fileName = $"{Guid.NewGuid()}.webp";
            var filePath = Path.Combine(uploadDir, fileName);

            using (var stream = file.OpenReadStream())
            {
                using (var image = await Image.LoadAsync(stream))
                {
                    if (image.Width > 1200 || image.Height > 1200)
                    {
                        image.Mutate(x => x.Resize(new ResizeOptions
                        {
                            Size = new Size(1200, 1200),
                            Mode = ResizeMode.Max
                        }));
                    }
                    
                    await image.SaveAsync(filePath, new WebpEncoder { Quality = 75 });
                }
            }

            return $"/uploads/{subFolder}/{fileName}";
        }

        public async Task<string> SavePdfAsync(IFormFile file, string subFolder)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is empty");

            if (file.Length > _maxSizeBytes)
                throw new InvalidOperationException($"File exceeds maximum allowed size of {_maxSizeBytes / (1024 * 1024)}MB");

            var ext = Path.GetExtension(file.FileName).ToLower();
            if (!_allowedPdfExts.Contains(ext))
                throw new InvalidOperationException("Invalid PDF extension");

            var uploadDir = Path.Combine(_webRootPath, "uploads", subFolder);
            if (!Directory.Exists(uploadDir))
                Directory.CreateDirectory(uploadDir);

            var fileName = $"{Guid.NewGuid()}{ext}";
            var filePath = Path.Combine(uploadDir, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return $"/uploads/{subFolder}/{fileName}";
        }

        public bool DeleteFile(string fileUrl)
        {
            if (string.IsNullOrEmpty(fileUrl)) return false;
            
            var relPath = fileUrl.TrimStart('/');
            var fullPath = Path.Combine(_webRootPath, relPath.Replace('/', Path.DirectorySeparatorChar));

            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
                return true;
            }
            return false;
        }

        public List<string> ListFiles(string subFolder)
        {
            var uploadDir = Path.Combine(_webRootPath, "uploads", subFolder);
            if (!Directory.Exists(uploadDir))
                return new List<string>();

            return Directory.GetFiles(uploadDir)
                .Select(f => $"/uploads/{subFolder}/{Path.GetFileName(f)}")
                .ToList();
        }
    }
}
