package cha_revelacao.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

/**
 * Configuração para suportar múltiplos provedores de e-mail
 */
@Configuration
public class EmailConfig {
    
    // Mapa que armazena instâncias de JavaMailSender para cada domínio de email
    private final Map<String, JavaMailSender> mailSenderCache = new HashMap<>();
    private static final Logger log = LoggerFactory.getLogger(EmailConfig.class);
    
    // Configurações padrão
    @Value("${spring.mail.host}")
    private String defaultHost;
    
    @Value("${spring.mail.port}")
    private int defaultPort;
    
    @Value("${spring.mail.username}")
    private String defaultUsername;
    
    @Value("${spring.mail.password}")
    private String defaultPassword;
    
    @Value("${spring.mail.properties.mail.smtp.auth}")
    private String defaultAuth;
    
    @Value("${spring.mail.properties.mail.smtp.starttls.enable}")
    private String defaultStartTls;
    
    // Gmail
    @Value("${mail.provider.gmail.host:smtp.gmail.com}")
    private String gmailHost;
    
    @Value("${mail.provider.gmail.port:587}")
    private int gmailPort;
    
    @Value("${mail.provider.gmail.auth:true}")
    private boolean gmailAuth;
    
    @Value("${mail.provider.gmail.starttls:true}")
    private boolean gmailStartTls;
    
    // Outlook
    @Value("${mail.provider.outlook.host:smtp.office365.com}")
    private String outlookHost;
    
    @Value("${mail.provider.outlook.port:587}")
    private int outlookPort;
    
    @Value("${mail.provider.outlook.auth:true}")
    private boolean outlookAuth;
    
    @Value("${mail.provider.outlook.starttls:true}")
    private boolean outlookStartTls;
    
    // iCloud
    @Value("${mail.provider.icloud.host:smtp.mail.me.com}")
    private String icloudHost;
    
    @Value("${mail.provider.icloud.port:587}")
    private int icloudPort;
    
    @Value("${mail.provider.icloud.auth:true}")
    private boolean icloudAuth;
    
    @Value("${mail.provider.icloud.starttls:true}")
    private boolean icloudStartTls;
    
    // Hotmail (mesmo que Outlook, mas mantido para compatibilidade)
    @Value("${mail.provider.hotmail.host:smtp.office365.com}")
    private String hotmailHost;
    
    @Value("${mail.provider.hotmail.port:587}")
    private int hotmailPort;
    
    @Value("${mail.provider.hotmail.auth:true}")
    private boolean hotmailAuth;
    
    @Value("${mail.provider.hotmail.starttls:true}")
    private boolean hotmailStartTls;

    /**
     * Bean padrão para o JavaMailSender que será usado por padrão
     */
    @Bean
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(defaultHost);
        mailSender.setPort(defaultPort);
        mailSender.setUsername(defaultUsername);
        mailSender.setPassword(defaultPassword);

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", defaultAuth);
        props.put("mail.smtp.starttls.enable", defaultStartTls);
        props.put("mail.debug", "false");
        props.put("mail.smtp.ssl.trust", "*");

        return mailSender;
    }
    
    /**
     * Obtém o JavaMailSender configurado para o provedor de email específico
     * @param email Email do usuário
     * @return JavaMailSender configurado para o provedor
     */
    public JavaMailSender getMailSenderForEmail(String email) {
        String provider = detectEmailProvider(email);
        
        // Verifica se já temos um mail sender criado para este domínio
        if (mailSenderCache.containsKey(provider)) {
            return mailSenderCache.get(provider);
        }
        
        // Se não existe, cria um novo
        JavaMailSender mailSender = createMailSender(email, null);
        mailSenderCache.put(provider, mailSender);
        return mailSender;
    }
    
    /**
     * Verifica se o email usa o provedor padrão
     * @param email Email do usuário
     * @return true se for o provedor padrão
     */
    public boolean isDefaultProvider(String email) {
        return "unknown".equals(detectEmailProvider(email));
    }
    
    /**
     * Retorna o email do remetente apropriado para o provedor
     * @param email Email do usuário (destinatário)
     * @return Email do remetente a ser usado
     */
    public String getSenderEmailForProvider(String email) {
        // Por padrão usamos o email padrão configurado na aplicação
        // Em uma implementação real, você poderia ter emails diferentes por provedor
        return defaultUsername;
    }
    
    /**
     * Cria um JavaMailSender configurado com base no provedor do email
     * @param email Email do usuário
     * @param password Senha para autenticação SMTP (opcional, se não fornecida, usa a senha padrão)
     * @return JavaMailSender configurado para o provedor específico
     */
    public JavaMailSender createMailSender(String email, String password) {
        String provider = detectEmailProvider(email);
        log.info("Detectado provedor de email: {} para {}", provider, email);
        
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        
        // Se password não for fornecido, usa a senha padrão da aplicação
        String mailPassword = (password != null && !password.isEmpty()) ? password : defaultPassword;
        
        // Configura o sender com base no provedor
        switch (provider) {
            case "gmail":
                configureGmailSender(mailSender, email, mailPassword);
                break;
            case "outlook":
            case "hotmail":
            case "live":
                configureOutlookSender(mailSender, email, mailPassword);
                break;
            case "icloud":
                configureICloudSender(mailSender, email, mailPassword);
                break;
            default:
                configureDefaultSender(mailSender, email, mailPassword);
                break;
        }
        
        return mailSender;
    }
    
    /**
     * Detecta o provedor com base no domínio do email
     * @param email Email para analisar
     * @return String com o nome do provedor (gmail, outlook, hotmail, icloud, etc)
     */
    public String detectEmailProvider(String email) {
        if (email == null || email.isEmpty() || !email.contains("@")) {
            return "unknown";
        }
        
        String domain = email.substring(email.indexOf('@') + 1).toLowerCase();
        
        if (domain.contains("gmail")) {
            return "gmail";
        } else if (domain.contains("outlook") || domain.contains("office365") || domain.contains("live")) {
            return "outlook";
        } else if (domain.contains("hotmail")) {
            return "hotmail";
        } else if (domain.contains("icloud") || domain.contains("me.com") || domain.contains("mac.com")) {
            return "icloud";
        } else {
            return "unknown";
        }
    }
    
    private void configureGmailSender(JavaMailSenderImpl mailSender, String email, String password) {
        mailSender.setHost(gmailHost);
        mailSender.setPort(gmailPort);
        mailSender.setUsername(defaultUsername); // Usa o email configurado nas propriedades (não o email do destinatário)
        mailSender.setPassword(defaultPassword);
        
        log.debug("Configurando sender Gmail com username: {}", defaultUsername);
        
        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", String.valueOf(gmailAuth));
        props.put("mail.smtp.starttls.enable", String.valueOf(gmailStartTls));
        props.put("mail.debug", "true"); // Ativa debug para diagnóstico
        props.put("mail.smtp.ssl.trust", "*");
    }
    
    private void configureOutlookSender(JavaMailSenderImpl mailSender, String email, String password) {
        mailSender.setHost(outlookHost);
        mailSender.setPort(outlookPort);
        mailSender.setUsername(defaultUsername); // Usa o email configurado nas propriedades
        mailSender.setPassword(defaultPassword);
        
        log.debug("Configurando sender Outlook com username: {}", defaultUsername);
        
        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", String.valueOf(outlookAuth));
        props.put("mail.smtp.starttls.enable", String.valueOf(outlookStartTls));
        props.put("mail.debug", "true"); // Ativa debug para diagnóstico
        props.put("mail.smtp.ssl.trust", "*");
    }
    
    private void configureICloudSender(JavaMailSenderImpl mailSender, String email, String password) {
        mailSender.setHost(icloudHost);
        mailSender.setPort(icloudPort);
        mailSender.setUsername(defaultUsername); // Usa o email configurado nas propriedades
        mailSender.setPassword(defaultPassword);
        
        log.debug("Configurando sender iCloud com username: {}", defaultUsername);
        
        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", String.valueOf(icloudAuth));
        props.put("mail.smtp.starttls.enable", String.valueOf(icloudStartTls));
        props.put("mail.debug", "true"); // Ativa debug para diagnóstico
        props.put("mail.smtp.ssl.trust", "*");
    }
    
    private void configureDefaultSender(JavaMailSenderImpl mailSender, String email, String password) {
        mailSender.setHost(defaultHost);
        mailSender.setPort(defaultPort);
        mailSender.setUsername(defaultUsername); // Usa o email configurado nas propriedades
        mailSender.setPassword(defaultPassword);
        
        log.debug("Configurando sender padrão com username: {}", defaultUsername);
        
        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", defaultAuth);
        props.put("mail.smtp.starttls.enable", defaultStartTls);
        props.put("mail.debug", "true"); // Ativa debug para diagnóstico
        props.put("mail.smtp.ssl.trust", "*");
    }
}