namespace MemuVie.Evento.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MemuVie.Evento.Services;

[ApiController]
[Route("/api/media")]
public class MediaController : ControllerBase
{
    private readonly ILogger<MediaController> _logger;
    private readonly ICloudinaryService _cloudinaryService;

    public MediaController(ILogger<MediaController> logger, ICloudinaryService cloudinaryService)
    {
        _logger = logger;
        _cloudinaryService = cloudinaryService;
    }

    [HttpPost("upload-image")]
    [Authorize]
    [RequestSizeLimit(10_000_000)] // 10MB para imagens
    public async Task<ActionResult<string>> UploadImage(IFormFile file)
    {
        try
        {
            var imageUrl = await _cloudinaryService.UploadImageAsync(file);
            return Ok(new { url = imageUrl, secure_url = imageUrl });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning($"Validação falhou no upload de imagem: {ex.Message}");
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Erro ao fazer upload de imagem: {ex.Message}");
            return StatusCode(500, new { error = "Erro ao fazer upload do arquivo" });
        }
    }

    [HttpPost("upload-video")]
    [Authorize]
    [RequestSizeLimit(100_000_000)] // 100MB para vídeos
    public async Task<ActionResult<string>> UploadVideo(IFormFile file)
    {
        try
        {
            var videoUrl = await _cloudinaryService.UploadVideoAsync(file);
            return Ok(new { url = videoUrl, secure_url = videoUrl });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning($"Validação falhou no upload de vídeo: {ex.Message}");
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Erro ao fazer upload de vídeo: {ex.Message}");
            return StatusCode(500, new { error = "Erro ao fazer upload do arquivo" });
        }
    }
}
