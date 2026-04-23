namespace MemuVie.Evento.Config;

/// <summary>
/// Configurações de email para envio de notificações
/// </summary>
public class MailSettings
{
    public string Host { get; set; } = "smtp.gmail.com";
    public int Port { get; set; } = 587;
    public string Username { get; set; } = "";
    public string Password { get; set; } = "";
    public bool EnableSSL { get; set; } = true;
    public bool UseStartTls { get; set; } = true;
    public string From { get; set; } = "";
    public string DisplayName { get; set; } = "Memuvie";
    public MailTimeoutSettings Timeouts { get; set; } = new();
    public SmtpSettingsDetails SmtpSettings { get; set; } = new();
    public Dictionary<string, MailProvider> Providers { get; set; } = new();
}

/// <summary>
/// Configurações de timeout para SMTP
/// </summary>
public class MailTimeoutSettings
{
    public int ConnectionTimeoutMs { get; set; } = 10000;
    public int TimeoutMs { get; set; } = 10000;
    public int WriteTimeoutMs { get; set; } = 10000;
}

/// <summary>
/// Configurações detalhadas de SMTP
/// </summary>
public class SmtpSettingsDetails
{
    public bool Auth { get; set; } = true;
    public string SslTrust { get; set; } = "*";
}

/// <summary>
/// Configuração de provedor de email específico
/// </summary>
public class MailProvider
{
    public string Host { get; set; } = "";
    public int Port { get; set; } = 587;
    public bool RequiresAuth { get; set; } = true;
    public bool UseStartTls { get; set; } = true;
}

/// <summary>
/// Configurações da aplicação
/// </summary>
public class AppSettings
{
    public string ApplicationName { get; set; } = "memuvie";
    public string FrontendUrl { get; set; } = "http://localhost:4200";
    public PasswordResetSettings PasswordReset { get; set; } = new();
}

/// <summary>
/// Configurações de redefinição de senha
/// </summary>
public class PasswordResetSettings
{
    public int TokenValidityMinutes { get; set; } = 30;
    public string Link { get; set; } = "/redefinir-senha";
}