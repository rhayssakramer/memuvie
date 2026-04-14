using Microsoft.Extensions.Options;
using MemuVie.Evento.Config;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace MemuVie.Evento.Services;

/// <summary>
/// Interface para serviço de envio de email
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Envia email de redefinição de senha
    /// </summary>
    Task<bool> SendPasswordResetEmailAsync(string email, string nome, string resetToken, string baseUrl);

    /// <summary>
    /// Envia email genérico
    /// </summary>
    Task<bool> SendEmailAsync(string to, string subject, string htmlContent, string displayName = "");
}

/// <summary>
/// Serviço de envio de email usando MailKit (suporte completo a STARTTLS)
/// </summary>
public class EmailService : IEmailService
{
    private readonly MailSettings _mailSettings;
    private readonly AppSettings _appSettings;
    private readonly IEmailTemplateService _templateService;
    private readonly ILogger<EmailService> _logger;

    public EmailService(
        IOptions<MailSettings> mailSettings,
        IOptions<AppSettings> appSettings,
        IEmailTemplateService templateService,
        ILogger<EmailService> logger)
    {
        _mailSettings = mailSettings.Value;
        _appSettings = appSettings.Value;
        _templateService = templateService;
        _logger = logger;
    }

    /// <summary>
    /// Envia email de redefinição de senha
    /// </summary>
    public async Task<bool> SendPasswordResetEmailAsync(string email, string nome, string resetToken, string baseUrl)
    {
        try
        {
            // Construir URL de redefinição
            var resetUrl = $"{baseUrl.TrimEnd('/')}{_appSettings.PasswordReset.Link}?token={Uri.EscapeDataString(resetToken)}";

            // Renderizar template
            var htmlContent = await _templateService.RenderPasswordResetTemplateAsync(
                nome,
                resetUrl,
                _appSettings.PasswordReset.TokenValidityMinutes.ToString()
            );

            // Enviar email
            return await SendEmailAsync(
                email,
                "Redefinição de Senha - Memuvie",
                htmlContent,
                _mailSettings.DisplayName
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao enviar email de redefinição de senha para {Email}", email);
            return false;
        }
    }

    /// <summary>
    /// Envia email genérico via SMTP com suporte a STARTTLS
    /// </summary>
    public async Task<bool> SendEmailAsync(string to, string subject, string htmlContent, string displayName = "")
    {
        try
        {
            // Validar configurações
            if (string.IsNullOrEmpty(_mailSettings.Host) || _mailSettings.Port <= 0)
            {
                _logger.LogError("Configurações de SMTP não estão configuradas corretamente");
                return false;
            }

            // Criar mensagem
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_mailSettings.DisplayName, _mailSettings.From));
            message.To.Add(new MailboxAddress("", to));
            message.Subject = subject;

            // Corpo HTML
            var bodyBuilder = new BodyBuilder { HtmlBody = htmlContent };
            message.Body = bodyBuilder.ToMessageBody();

            // Conectar e enviar com MailKit
            using (var client = new SmtpClient())
            {
                // Conectar com suporte a STARTTLS na porta 587
                await client.ConnectAsync(_mailSettings.Host, _mailSettings.Port, SecureSocketOptions.StartTls);

                // Autenticar se credenciais fornecidas
                if (!string.IsNullOrEmpty(_mailSettings.Username) && !string.IsNullOrEmpty(_mailSettings.Password))
                {
                    await client.AuthenticateAsync(_mailSettings.Username, _mailSettings.Password);
                }

                // Enviar
                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                _logger.LogInformation("✅ Email enviado com sucesso para {To}", to);
                return true;
            }
        }
        catch (MailKit.Security.SaslException ex)
        {
            _logger.LogError(ex, "❌ Erro de autenticação SMTP ao enviar email para {To}: {ErrorMessage}", to, ex.Message);
            return false;
        }
        catch (MailKit.Net.Smtp.SmtpCommandException ex)
        {
            _logger.LogError(ex, "❌ Erro SMTP ao enviar email para {To}: {ErrorMessage}", to, ex.Message);
            return false;
        }
        catch (MailKit.Net.Smtp.SmtpProtocolException ex)
        {
            _logger.LogError(ex, "❌ Erro de protocolo SMTP ao enviar email para {To}: {ErrorMessage}", to, ex.Message);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Erro inesperado ao enviar email para {To} | Tipo: {ExceptionType} | Mensagem: {ErrorMessage}", to, ex.GetType().Name, ex.Message);
            return false;
        }
    }
}
