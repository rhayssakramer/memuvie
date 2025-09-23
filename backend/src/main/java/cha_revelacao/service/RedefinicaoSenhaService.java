package cha_revelacao.service;

import cha_revelacao.exception.BusinessException;
import cha_revelacao.model.TokenRedefinicaoSenha;
import cha_revelacao.model.Usuario;
import cha_revelacao.repository.TokenRedefinicaoSenhaRepository;
import cha_revelacao.repository.UsuarioRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Slf4j
public class RedefinicaoSenhaService {

    // Token expira em 30 minutos
    private static final int MINUTOS_EXPIRACAO = 30;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private TokenRedefinicaoSenhaRepository tokenRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    /**
     * Solicita a redefinição de senha para um usuário com o email fornecido.
     * Cria um token único e envia um email com link para redefinição.
     * 
     * @param email O email do usuário
     */
    @Transactional(noRollbackFor = Exception.class)
    public void solicitarRedefinicaoSenha(String email) {
        try {
            log.info("Solicitação de redefinição de senha para email: {}", email);
            
            if (email == null || email.trim().isEmpty()) {
                log.warn("Tentativa de solicitar redefinição com email vazio");
                return;
            }
            
            // Busca o usuário pelo email
            java.util.Optional<Usuario> usuarioOpt = usuarioRepository.findByEmailAndAtivo(email);
            
            // Se o email não existe, não fazemos nada, mas retornamos normalmente
            // Isso é por segurança, para não revelar quais emails estão cadastrados
            if (usuarioOpt.isEmpty()) {
                log.info("Email não encontrado no sistema: {}", email);
                return;
            }
            
            Usuario usuario = usuarioOpt.get();
                
            try {
                try {
                    // Cria token com segurança - este método já salva no banco
                    String token = criarTokenComSeguranca(usuario);
                    
                    // Tenta enviar o email com o link de redefinição
                    emailService.enviarEmailRedefinicaoSenha(usuario, token);
                    log.info("Email de redefinição enviado para: {}", usuario.getEmail());
                    log.info("Token de redefinição criado para o usuário: {}", usuario.getEmail());
                } catch (Exception emailError) {
                    // Se houver erro no envio do email, apenas registra o log
                    // mas não interrompe o processo
                    log.error("Erro ao enviar email de redefinição: {}", emailError.getMessage());
                    log.error("Token gerado (para testes): {}", emailError.getMessage());
                }
            } catch (Exception dbError) {
                log.error("Erro ao processar token de redefinição no banco de dados: {}", dbError.getMessage());
                log.error("Detalhes do erro:", dbError);
            }
        } catch (Exception e) {
            // Log detalhado e apenas retorna sem lançar exceção
            log.error("Erro ao processar solicitação de redefinição: {}", e.getMessage());
            log.error("Stack trace completo:", e);
        }
    }
    
    /**
     * Valida se um token existe e não está expirado.
     * 
     * @param token O token a ser validado
     * @return true se o token for válido, false caso contrário
     */
    public boolean validarToken(String token) {
        log.info("Validando token de redefinição: {}", token);
        
        // Verificação de entrada
        if (token == null || token.trim().isEmpty()) {
            log.warn("Token nulo ou vazio recebido para validação");
            return false;
        }
        
        try {
            // Busca o token no banco de dados
            return tokenRepository.findByToken(token)
                .map(tokenEntity -> {
                    try {
                        // Verifica se o token expirou
                        boolean valido = !tokenEntity.isExpirado();
                        
                        log.info("Token encontrado para o usuário: {}. Token válido: {}", 
                            tokenEntity.getUsuario().getEmail(), valido);
                        
                        if (!valido) {
                            log.info("Token expirado. Data expiração: {}, Data atual: {}", 
                                tokenEntity.getDataExpiracao(), LocalDateTime.now());
                        }
                        
                        return valido;
                    } catch (Exception e) {
                        // Log de erro detalhado
                        log.error("Erro ao verificar validade do token: {}", e.getMessage(), e);
                        return false;
                    }
                })
                .orElseGet(() -> {
                    log.warn("Token não encontrado no banco de dados: {}", token);
                    return false;
                });
        } catch (Exception e) {
            // Log de erro detalhado da operação de banco de dados
            log.error("Erro ao processar validação de token: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao validar token", e);
        }
    }
    
    /**
     * Redefine a senha de um usuário usando o token fornecido.
     * 
     * @param token O token de redefinição
     * @param novaSenha A nova senha
     */
    @Transactional
    public void redefinirSenha(String token, String novaSenha) {
        log.info("Tentativa de redefinição de senha com token");
        
        if (token == null || token.trim().isEmpty()) {
            log.error("Token nulo ou vazio fornecido para redefinição");
            throw new BusinessException("Token inválido");
        }
        
        if (novaSenha == null || novaSenha.trim().isEmpty()) {
            log.error("Nova senha nula ou vazia fornecida");
            throw new BusinessException("Nova senha inválida");
        }
        
        TokenRedefinicaoSenha tokenEntity = tokenRepository.findByToken(token)
            .orElseThrow(() -> {
                log.error("Token de redefinição não encontrado: {}", token);
                return new BusinessException("Token inválido");
            });
        
        if (tokenEntity.isExpirado()) {
            log.warn("Token expirado para o usuário: {}", tokenEntity.getUsuario().getEmail());
            tokenRepository.delete(tokenEntity);
            throw new BusinessException("Token expirado. Solicite uma nova redefinição de senha.");
        }
        
        Usuario usuario = tokenEntity.getUsuario();
        
        // Verifica se o usuário está ativo
        if (!usuario.getAtivo()) {
            log.error("Tentativa de redefinir senha para usuário inativo: {}", usuario.getEmail());
            throw new BusinessException("Usuário inativo não pode redefinir senha");
        }
        
        // Garantindo que a nova senha seja corretamente codificada
        String senhaCodificada = passwordEncoder.encode(novaSenha);
        usuario.setSenha(senhaCodificada);
        
        try {
            // Salva a nova senha
            usuarioRepository.saveAndFlush(usuario); // Usando saveAndFlush para garantir que seja salvo imediatamente
            
            // Remove o token usado
            tokenRepository.delete(tokenEntity);
            tokenRepository.flush(); // Garante que o token seja removido imediatamente
            
            log.info("Senha redefinida com sucesso para o usuário: {}", usuario.getEmail());
        } catch (Exception e) {
            log.error("Erro ao salvar nova senha: {}", e.getMessage(), e);
            throw new BusinessException("Erro ao processar a redefinição de senha");
        }
    }
    
    /**
     * Método seguro para criar token de redefinição
     * Lida com a remoção de tokens existentes e garante transação consistente
     * 
     * @param usuario O usuário para quem criar o token
     * @return O token gerado
     */
    @Transactional
    private String criarTokenComSeguranca(Usuario usuario) {
        // Verifica tokens existentes usando JPQL nativo para garantir
        // que não haja problemas de cache ou consistência
        tokenRepository.deleteByUsuario(usuario);
        tokenRepository.flush(); // Força execução imediata da deleção
        
        // Cria um novo token único
        String token = UUID.randomUUID().toString();
        
        // Salva o token no banco de dados
        TokenRedefinicaoSenha tokenEntity = new TokenRedefinicaoSenha(
            token, 
            usuario, 
            LocalDateTime.now().plusMinutes(MINUTOS_EXPIRACAO)
        );
        
        // Salva e força sincronização
        tokenRepository.saveAndFlush(tokenEntity);
        
        return token;
    }
}