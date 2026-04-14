namespace MemuVie.Evento.Services;

/// <summary>
/// Serviço para renderizar templates de email
/// </summary>
public interface IEmailTemplateService
{
    /// <summary>
    /// Renderiza o template de redefinição de senha
    /// </summary>
    Task<string> RenderPasswordResetTemplateAsync(string nome, string resetUrl, string validadeMinutos = "30");
}

/// <summary>
/// Implementação do serviço de template de email
/// </summary>
public class EmailTemplateService : IEmailTemplateService
{
    private readonly IWebHostEnvironment _hostEnvironment;
    private readonly ILogger<EmailTemplateService> _logger;

    public EmailTemplateService(IWebHostEnvironment hostEnvironment, ILogger<EmailTemplateService> logger)
    {
        _hostEnvironment = hostEnvironment;
        _logger = logger;
    }

    /// <summary>
    /// Renderiza o template de redefinição de senha com as variáveis fornecidas
    /// </summary>
    public async Task<string> RenderPasswordResetTemplateAsync(string nome, string resetUrl, string validadeMinutos = "30")
    {
        try
        {
            var templatePath = Path.Combine(
                _hostEnvironment.ContentRootPath,
                "src", "Templates", "redefinicao-senha.html"
            );

            if (!File.Exists(templatePath))
            {
                _logger.LogWarning("Template não encontrado em: {TemplatePath}", templatePath);
                return GenerateFallbackTemplate(nome, resetUrl, validadeMinutos);
            }

            var templateContent = await File.ReadAllTextAsync(templatePath);

            // Substituir placeholders
            var renderedContent = templateContent
                .Replace("{{Nome}}", SecurityHelper.HtmlEncode(nome))
                .Replace("{{ResetUrl}}", SecurityHelper.HtmlEncode(resetUrl))
                .Replace("{{Validade}}", SecurityHelper.HtmlEncode(validadeMinutos))
                .Replace("{{DataEnvio}}", DateTime.UtcNow.ToString("dd/MM/yyyy HH:mm"));

            return renderedContent;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao renderizar template de redefinição de senha");
            return GenerateFallbackTemplate(nome, resetUrl, validadeMinutos);
        }
    }

    /// <summary>
    /// Gera um template de fallback em caso de erro
    /// </summary>
    private static string GenerateFallbackTemplate(string nome, string resetUrl, string validadeMinutos)
    {
        return $@"<!DOCTYPE html>
<html lang=""pt-BR"">
<head>
    <meta charset=""UTF-8"" />
    <title>Redefinição de Senha</title>
    <style>
        body {{ font-family: Arial, sans-serif; color: #333; margin: 0; padding: 20px; }}
        .container {{ max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px; overflow: hidden; }}
        .header {{ background-color: #7030A0; color: white; padding: 20px; text-align: center; }}
        .logo {{ font-size: 40px; font-weight: bold; color: #FFD100; }}
        .content {{ padding: 20px; }}
        .btn {{ display: inline-block; background-color: #7030A0; color: white; padding: 12px 24px; border-radius: 20px; text-decoration: none; font-weight: bold; margin: 20px 0; }}
        .footer {{ text-align: center; font-size: 12px; color: #777; border-top: 1px solid #ddd; padding: 10px; margin-top: 20px; }}
    </style>
</head>
<body>
<div class=""container"">
    <div class=""header"">
        <div class=""logo"">memuvie</div>
    </div>
    <div class=""content"">
        <h2>Redefinição de Senha</h2>
        <p>Olá {SecurityHelper.HtmlEncode(nome)},</p>
        <p>Recebemos uma solicitação para redefinir sua senha de acesso ao memuvie.</p>
        <p style=""text-align: center;"">
            <a class=""btn"" href=""{SecurityHelper.HtmlEncode(resetUrl)}"">Redefinir minha senha</a>
        </p>
        <p>Link: <a href=""{SecurityHelper.HtmlEncode(resetUrl)}"">{SecurityHelper.HtmlEncode(resetUrl)}</a></p>
        <p>Este link expirará em {SecurityHelper.HtmlEncode(validadeMinutos)} minutos.</p>
        <p>Atenciosamente,<br/>Equipe memuvie</p>
    </div>
    <div class=""footer"">
        <p>Esta é uma mensagem automática. &copy; 2025 Memuvie.</p>
    </div>
</div>
</body>
</html>";
    }
}

/// <summary>
/// Funções auxiliares de segurança
/// </summary>
internal static class SecurityHelper
{
    /// <summary>
    /// Codifica texto para uso seguro em HTML
    /// </summary>
    public static string HtmlEncode(string text)
    {
        if (string.IsNullOrEmpty(text))
            return string.Empty;

        return System.Net.WebUtility.HtmlEncode(text);
    }
}