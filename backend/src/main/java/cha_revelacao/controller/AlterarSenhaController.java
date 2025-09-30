package cha_revelacao.controller;

import cha_revelacao.dto.request.AlterarSenhaRequest;
import cha_revelacao.dto.response.ApiResponse;
import cha_revelacao.exception.BusinessException;
import cha_revelacao.model.Usuario;
import cha_revelacao.repository.UsuarioRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuario")
@RequiredArgsConstructor
@Slf4j
public class AlterarSenhaController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/alterar-senha")
    public ResponseEntity<?> alterarSenha(@Valid @RequestBody AlterarSenhaRequest request, 
                                        Authentication authentication) {
        try {
            String email = authentication.getName();
            Usuario usuario = usuarioRepository.findByEmailAndAtivo(email)
                .orElseThrow(() -> new BusinessException("Usuário não encontrado"));
            
            // Verificar se a senha atual está correta
            if (!passwordEncoder.matches(request.getSenhaAtual(), usuario.getSenha())) {
                log.warn("Tentativa de alteração de senha com senha atual incorreta para usuário: {}", email);
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Senha atual incorreta"));
            }
            
            // Verificar se a nova senha não é igual à senha atual
            if (passwordEncoder.matches(request.getNovaSenha(), usuario.getSenha())) {
                return ResponseEntity.badRequest().body(
                    new ApiResponse(false, "A nova senha não pode ser igual à senha atual")
                );
            }
            
            // Atualizar senha
            usuario.setSenha(passwordEncoder.encode(request.getNovaSenha()));
            usuarioRepository.save(usuario);
            
            log.info("Senha alterada com sucesso para usuário: {}", email);
            return ResponseEntity.ok(new ApiResponse(true, "Senha alterada com sucesso"));
        } catch (BusinessException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            log.error("Erro ao alterar senha: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(
                new ApiResponse(false, "Erro ao alterar senha: " + e.getMessage())
            );
        }
    }
}