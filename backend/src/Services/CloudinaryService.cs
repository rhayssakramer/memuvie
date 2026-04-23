namespace MemuVie.Evento.Services;

using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

/// <summary>
/// Serviço para gerenciar uploads de imagens e vídeos no Cloudinary
/// </summary>
public interface ICloudinaryService
{
    /// <summary>
    /// Faz upload de uma imagem para o Cloudinary
    /// </summary>
    Task<string> UploadImageAsync(IFormFile file);

    /// <summary>
    /// Faz upload de um vídeo para o Cloudinary
    /// </summary>
    Task<string> UploadVideoAsync(IFormFile file);

    /// <summary>
    /// Remove um arquivo do Cloudinary
    /// </summary>
    Task<bool> DeleteFileAsync(string publicId);
}

/// <summary>
/// Implementação do serviço Cloudinary
/// Requer variáveis de ambiente:
/// - CLOUDINARY_CLOUD_NAME: Nome da conta Cloudinary
/// - CLOUDINARY_API_KEY: Chave de API
/// - CLOUDINARY_API_SECRET: Segredo de API
/// </summary>
public class CloudinaryService : ICloudinaryService
{
    private readonly Cloudinary _cloudinary;
    private readonly ILogger<CloudinaryService> _logger;
    private const long MaxImageSize = 10 * 1024 * 1024; // 10MB para imagens
    private const long MaxVideoSize = 100 * 1024 * 1024; // 100MB para vídeos
    private static readonly string[] AllowedImageExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
    private static readonly string[] AllowedVideoExtensions = { ".mp4", ".webm", ".avi", ".mov", ".mkv" };

    public CloudinaryService(ILogger<CloudinaryService> logger, IConfiguration configuration)
    {
        _logger = logger;

        // Obter credenciais do Cloudinary das variáveis de ambiente
        var cloudName = Environment.GetEnvironmentVariable("CLOUDINARY_CLOUD_NAME") 
                        ?? configuration["Cloudinary:CloudName"];
        var apiKey = Environment.GetEnvironmentVariable("CLOUDINARY_API_KEY") 
                    ?? configuration["Cloudinary:ApiKey"];
        var apiSecret = Environment.GetEnvironmentVariable("CLOUDINARY_API_SECRET") 
                       ?? configuration["Cloudinary:ApiSecret"];

        // Validar credenciais
        if (string.IsNullOrEmpty(cloudName) || string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(apiSecret))
        {
            _logger.LogWarning("⚠️ Cloudinary não configurado. Uploads serão desabilitados.");
            _logger.LogWarning("Defina as variáveis: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET");
            throw new InvalidOperationException("Cloudinary credentials are not configured");
        }

        // Criar conta do Cloudinary
        var account = new Account(cloudName, apiKey, apiSecret);
        _cloudinary = new Cloudinary(account);

        _logger.LogInformation($"✅ Cloudinary inicializado para a conta: {cloudName}");
    }

    /// <summary>
    /// Faz upload de imagem para o Cloudinary
    /// </summary>
    public async Task<string> UploadImageAsync(IFormFile file)
    {
        try
        {
            // Validações básicas
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("Nenhum arquivo foi enviado");
            }

            if (file.Length > MaxImageSize)
            {
                throw new ArgumentException($"Arquivo muito grande. Máximo permitido: 10MB");
            }

            var fileExtension = Path.GetExtension(file.FileName).ToLower();
            if (!AllowedImageExtensions.Contains(fileExtension))
            {
                throw new ArgumentException($"Tipo de arquivo não permitido. Extensões aceitas: {string.Join(", ", AllowedImageExtensions)}");
            }

            // Upload para Cloudinary
            using (var stream = file.OpenReadStream())
            {
                var uploadParams = new ImageUploadParams()
                {
                    File = new FileDescription(file.FileName, stream),
                    Folder = "memuvie/images", // Organizar em pastas
                    Format = "webp", // Converter para webp para melhor compressão
                    Transformation = new Transformation()
                        .Width(2000) // Limitar largura máxima
                        .Height(2000) // Limitar altura máxima
                        .Crop("limit") // Manter proporções
                };

                var uploadResult = await _cloudinary.UploadAsync(uploadParams);

                if (uploadResult.Error != null)
                {
                    _logger.LogError($"❌ Erro ao fazer upload de imagem: {uploadResult.Error.Message}");
                    throw new Exception($"Erro ao fazer upload: {uploadResult.Error.Message}");
                }

                _logger.LogInformation($"✅ Imagem enviada com sucesso para Cloudinary: {uploadResult.SecureUrl}");
                return uploadResult.SecureUrl.ToString();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError($"❌ Erro ao fazer upload de imagem: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// Faz upload de vídeo para o Cloudinary
    /// </summary>
    public async Task<string> UploadVideoAsync(IFormFile file)
    {
        try
        {
            // Validações básicas
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("Nenhum arquivo foi enviado");
            }

            if (file.Length > MaxVideoSize)
            {
                throw new ArgumentException($"Arquivo muito grande. Máximo permitido: 100MB");
            }

            var fileExtension = Path.GetExtension(file.FileName).ToLower();
            if (!AllowedVideoExtensions.Contains(fileExtension))
            {
                throw new ArgumentException($"Tipo de arquivo não permitido. Extensões aceitas: {string.Join(", ", AllowedVideoExtensions)}");
            }

            // Upload para Cloudinary
            using (var stream = file.OpenReadStream())
            {
                var uploadParams = new VideoUploadParams()
                {
                    File = new FileDescription(file.FileName, stream),
                    Folder = "memuvie/videos", // Organizar em pastas
                    Transformation = new Transformation()
                        .Width(1920) // Limitar largura máxima
                        .Height(1080) // Limitar altura máxima
                        .Crop("limit") // Manter proporções
                        .FetchFormat("auto") // Formato automático baseado no navegador
                };

                var uploadResult = await _cloudinary.UploadAsync(uploadParams);

                if (uploadResult.Error != null)
                {
                    _logger.LogError($"❌ Erro ao fazer upload de vídeo: {uploadResult.Error.Message}");
                    throw new Exception($"Erro ao fazer upload: {uploadResult.Error.Message}");
                }

                _logger.LogInformation($"✅ Vídeo enviado com sucesso para Cloudinary: {uploadResult.SecureUrl}");
                return uploadResult.SecureUrl.ToString();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError($"❌ Erro ao fazer upload de vídeo: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// Remove um arquivo do Cloudinary
    /// </summary>
    public async Task<bool> DeleteFileAsync(string publicId)
    {
        try
        {
            if (string.IsNullOrEmpty(publicId))
            {
                _logger.LogWarning("PublicId não fornecido para deleção");
                return false;
            }

            var deleteParams = new DeletionParams(publicId);
            var result = await _cloudinary.DestroyAsync(deleteParams);

            if (result.Error != null)
            {
                _logger.LogError($"❌ Erro ao deletar arquivo do Cloudinary: {result.Error.Message}");
                return false;
            }

            _logger.LogInformation($"✅ Arquivo deletado do Cloudinary: {publicId}");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError($"❌ Erro ao deletar arquivo: {ex.Message}");
            return false;
        }
    }
}
