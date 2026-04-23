using Microsoft.Extensions.Options;
using MemuVie.Evento.Config;

namespace MemuVie.Evento.Services;

/// <summary>
/// Serviço de email mock para desenvolvimento - apenas faz log sem enviar
/// </summary>
public class MockEmailService : IEmailService
{
    private readonly IEmailTemplateService _templateService;
    private readonly ILogger<MockEmailService> _logger;

    public MockEmailService(
        IEmailTemplateService templateService,
        ILogger<MockEmailService> logger)
    {
        _templateService = templateService;
        _logger = logger;
    }

    /// <summary>
    /// Simula envio de email de redefinição de senha
    /// </summary>
    public async Task<bool> SendPasswordResetEmailAsync(string email, string nome, string resetToken, string baseUrl)
    {
        try
        {
            var resetUrl = $"{baseUrl.TrimEnd('/')}/redefinir-senha?token={Uri.EscapeDataString(resetToken)}";

            // Renderizar template
            var htmlContent = await _templateService.RenderPasswordResetTemplateAsync(
                nome,
                resetUrl,
                "30"
            );

            _logger.LogInformation("🧪 [MOCK] Email de redefinição de senha para {Email}", email);
            _logger.LogInformation("🧪 [MOCK] URL de reset: {ResetUrl}", resetUrl);
            _logger.LogInformation("🧪 [MOCK] Token: {Token}", resetToken);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "🧪 [MOCK] Erro ao processar email de redefinição para {Email}", email);
            return false;
        }
    }

    /// <summary>
    /// Simula envio de email genérico
    /// </summary>
    public async Task<bool> SendEmailAsync(string to, string subject, string htmlContent, string displayName = "")
    {
        await Task.Delay(100); // Simular delay
        _logger.LogInformation("🧪 [MOCK] Email enviado para: {To} | Assunto: {Subject}", to, subject);
        return true;
    }
}
