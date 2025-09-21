package cha_revelacao.controller;

import cha_revelacao.model.TokenRedefinicaoSenha;
import cha_revelacao.model.Usuario;
import cha_revelacao.repository.TokenRedefinicaoSenhaRepository;
import cha_revelacao.repository.UsuarioRepository;
import cha_revelacao.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Controlador apenas para ambiente de desenvolvimento/testes.
 * Permite gerar tokens de teste para redefinição de senha.
 */
@RestController
@RequestMapping("/dev-tools")
@Profile("dev") // Este controlador só está disponível em perfil de desenvolvimento
public class DevToolsController {
    
    private static final Logger log = LoggerFactory.getLogger(DevToolsController.class);

    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private TokenRedefinicaoSenhaRepository tokenRepository;
    
    @Autowired
    private EmailService emailService;
    
    /**
     * Endpoint para gerar um token de redefinição de senha para testes.
     * Em produção, este endpoint não estará disponível.
     * 
     * @param email o email do usuário
     * @return um token válido para redefinição de senha
     */
    @GetMapping("/gerar-token-redefinicao/{email}")
    public ResponseEntity<?> gerarTokenRedefinicao(@PathVariable String email) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmailAndAtivo(email);
        
        if (usuarioOpt.isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Usuário não encontrado");
            return ResponseEntity.badRequest().body(response);
        }
        
        Usuario usuario = usuarioOpt.get();
        
        // Remove tokens antigos
        tokenRepository.deleteByUsuario(usuario);
        
        // Gera um novo token
        String token = UUID.randomUUID().toString();
        TokenRedefinicaoSenha tokenEntity = new TokenRedefinicaoSenha(
            token,
            usuario,
            LocalDateTime.now().plusHours(1) // Validade de 1 hora para testes
        );
        
        tokenRepository.save(tokenEntity);
        
        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("url", "http://localhost:4200/redefinir-senha?token=" + token);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Endpoint para teste de envio de email
     * @param destinatario email de destino
     * @return resposta da API
     */
    @GetMapping("/teste-email/{destinatario}")
    public ResponseEntity<String> testeEmail(@PathVariable String destinatario) {
        try {
            log.info("Tentando enviar email de teste para: {}", destinatario);
            
            String assunto = "Teste de Email - Memuvie";
            String conteudo = "<h1>Teste de Email</h1>" +
                    "<p>Este é um email de teste enviado pela aplicação Memuvie.</p>" +
                    "<p>Se você está recebendo este email, a configuração de envio está funcionando corretamente.</p>" +
                    "<p>Data e hora do teste: " + java.time.LocalDateTime.now() + "</p>";
            
            emailService.enviarEmailSimples(destinatario, assunto, conteudo);
            
            return ResponseEntity.ok("Email de teste enviado com sucesso para: " + destinatario);
        } catch (Exception e) {
            log.error("Erro ao enviar email de teste: {}", e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Erro ao enviar email: " + e.getMessage());
        }
    }
}