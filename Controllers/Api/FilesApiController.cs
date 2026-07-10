using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ApplyPannuBro.Services;

namespace ApplyPannuBro.Controllers.Api
{
    [ApiController]
    [Route("api/files")]
    [Authorize(Roles = "SuperAdmin,Admin,Staff")]
    public class FilesApiController : ControllerBase
    {
        private readonly IFileService _fileService;

        public FilesApiController(IFileService fileService)
        {
            _fileService = fileService;
        }

        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadImage([FromForm] IFormFile file, [FromForm] string folder = "general")
        {
            try
            {
                var fileUrl = await _fileService.SaveImageAsync(file, folder);
                return Ok(new { url = fileUrl });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("upload-pdf")]
        public async Task<IActionResult> UploadPdf([FromForm] IFormFile file, [FromForm] string folder = "pdfs")
        {
            try
            {
                var fileUrl = await _fileService.SavePdfAsync(file, folder);
                return Ok(new { url = fileUrl });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete]
        public IActionResult DeleteFile([FromQuery] string url)
        {
            if (string.IsNullOrEmpty(url))
                return BadRequest(new { message = "File url is required." });

            var success = _fileService.DeleteFile(url);
            if (success)
                return Ok(new { message = "File deleted successfully." });

            return NotFound(new { message = "File not found or could not be deleted." });
        }

        [HttpGet]
        public IActionResult GetFiles([FromQuery] string folder = "general")
        {
            var files = _fileService.ListFiles(folder);
            return Ok(files);
        }
    }
}
