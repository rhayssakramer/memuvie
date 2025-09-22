package cha_revelacao.service;

import cha_revelacao.config.EmailConfig;
import cha_revelacao.exception.BusinessException;
import cha_revelacao.model.Usuario;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender defaultMailSender;
    
    @Autowired
    private EmailConfig emailConfig;
    
    @Autowired
    private SpringTemplateEngine templateEngine;
    
    @Value("${spring.mail.username}")
    private String defaultRemetente;
    
    @Value("${app.frontend.url}")
    private String frontendUrl;
    
    /**
     * Envia um email HTML para redefinição de senha
     * 
     * @param usuario o usuário que solicitou a redefinição de senha
     * @param token o token gerado para redefinição
     */
    public void enviarEmailRedefinicaoSenha(Usuario usuario, String token) {
        try {
            // Log o token para testes (apenas em ambiente de desenvolvimento)
            log.info("Token de redefinição gerado para {} (para desenvolvimento): {}", usuario.getEmail(), token);
            log.info("URL de redefinição: {}/redefinir-senha?token={}", frontendUrl, token);
            
            // Determina o provedor de email com base no domínio do email do usuário
            JavaMailSender mailSender = emailConfig.getMailSenderForEmail(usuario.getEmail());
            String remetente = emailConfig.getSenderEmailForProvider(usuario.getEmail());
            
            // Log para diagnóstico
            log.info("Enviando email através do provedor: {} com remetente: {}", 
                    emailConfig.detectEmailProvider(usuario.getEmail()), remetente);
            
            // Tentar enviar o email real
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name());
            
            // Prepara o contexto para o template
            Context context = new Context();
            Map<String, Object> model = new HashMap<>();
            model.put("nome", usuario.getNome());
            model.put("resetUrl", frontendUrl + "/redefinir-senha?token=" + token);
            model.put("validade", "30 minutos");
            context.setVariables(model);
            
            // Processa o template HTML
            String html = templateEngine.process("email/redefinicao-senha", context);
            
            // Configura o email
            helper.setTo(usuario.getEmail());
            helper.setSubject("Redefinição de Senha - Memuvie");
            helper.setText(html, true);
            helper.setFrom(remetente);
            
            try {
                // Envia o email
                log.info("Tentando enviar email para: {} com remetente: {}", usuario.getEmail(), remetente);
                mailSender.send(message);
                log.info("Email de redefinição de senha enviado com sucesso para: {}", usuario.getEmail());
            } catch (Exception emailError) {
                log.error("Erro ao enviar email. Usando fallback para o endpoint de desenvolvedor: /dev-tools/gerar-token-redefinicao/{}", usuario.getEmail());
                log.error("Erro detalhado: {}", emailError.getMessage());
                emailError.printStackTrace(); // Imprime stack trace completo para diagnóstico
                
                // Se falhar com o provedor específico, tenta com o provedor padrão
                if (!emailConfig.isDefaultProvider(usuario.getEmail())) {
                    log.info("Tentando enviar com o provedor padrão como fallback...");
                    enviarComProvedorPadrao(usuario.getEmail(), "Redefinição de Senha - Memuvie", html);
                }
            }
        } catch (Exception e) {
            log.error("Erro ao enviar email de redefinição de senha para {}: {}", 
                    usuario.getEmail(), e.getMessage());
            
            // Log detalhado da exceção
            e.printStackTrace();
            
            // Em vez de lançar exceção que causaria erro 500, apenas logamos o erro
        }
    }
    
    /**
     * Envia um email com o provedor padrão (método de fallback)
     */
    private void enviarComProvedorPadrao(String destinatario, String assunto, String conteudo) {
        try {
            JavaMailSender mailSender = defaultMailSender;
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name());
            
            helper.setTo(destinatario);
            helper.setSubject(assunto);
            helper.setText(conteudo, true);  // true para conteúdo HTML
            helper.setFrom(defaultRemetente);
            
            mailSender.send(message);
            
            log.info("Email enviado com provedor padrão para: {}", destinatario);
        } catch (Exception e) {
            log.error("Erro ao enviar email com provedor padrão para {}: {}", 
                    destinatario, e.getMessage());
        }
    }
    
    /**
     * Envia um email simples com texto plano (para testes ou fallback)
     */
    public void enviarEmailSimples(String destinatario, String assunto, String conteudo) {
        try {
            // Determina o provedor de email com base no domínio do destinatário
            JavaMailSender mailSender = emailConfig.getMailSenderForEmail(destinatario);
            String remetente = emailConfig.getSenderEmailForProvider(destinatario);
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name());
            
            helper.setTo(destinatario);
            helper.setSubject(assunto);
            helper.setText(conteudo);
            helper.setFrom(remetente);
            
            mailSender.send(message);
            
            log.info("Email simples enviado para: {}", destinatario);
        } catch (Exception e) {
            log.error("Erro ao enviar email simples para {}: {}", 
                    destinatario, e.getMessage());
                    
            // Se falhar com o provedor específico, tenta com o provedor padrão
            if (!emailConfig.isDefaultProvider(destinatario)) {
                log.info("Tentando enviar com o provedor padrão como fallback...");
                enviarComProvedorPadrao(destinatario, assunto, conteudo);
            } else {
                throw new BusinessException("Erro ao enviar email. Por favor, tente novamente mais tarde.");
            }
        }
    }
}