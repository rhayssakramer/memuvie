package cha_revelacao.controller;

import cha_revelacao.dto.request.EsqueciSenhaRequest;
import cha_revelacao.dto.request.RedefinirSenhaRequest;
import cha_revelacao.service.RedefinicaoSenhaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class RedefinicaoSenhaController {

    @Autowired
    private RedefinicaoSenhaService redefinicaoSenhaService;
    
    /**
     * Endpoint para solicitar redefinição de senha.
     * Recebe o email e envia um link de redefinição se o email existir.
     */
    @PostMapping("/esqueci-senha")
    public ResponseEntity<Map<String, String>> solicitarRedefinicaoSenha(
            @Valid @RequestBody EsqueciSenhaRequest request) {
        try {
            redefinicaoSenhaService.solicitarRedefinicaoSenha(request.getEmail());
            
            Map<String, String> response = new HashMap<>();
            response.put("mensagem", "Se o email estiver cadastrado em nosso sistema, " +
                    "você receberá um link para redefinir sua senha em instantes.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Logs para depuração
            e.printStackTrace();
            
            // Resposta para o frontend
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("mensagem", "Estamos com problemas técnicos. Por favor, tente novamente mais tarde.");
            
            return ResponseEntity.ok(errorResponse);
        }
    }
    
    /**
     * Endpoint para verificar se um token é válido.
     * Usado pelo frontend antes de mostrar o formulário de nova senha.
     */
    @GetMapping("/verificar-token")
    public ResponseEntity<?> validarToken(@RequestParam String token) {
        try {
            boolean valido = redefinicaoSenhaService.validarToken(token);
            
            Map<String, Boolean> response = new HashMap<>();
            response.put("valido", valido);
            
            if (!valido) {
                return ResponseEntity.badRequest().body(response);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Erro ao validar token: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * Endpoint para redefinir a senha usando um token válido.
     */
    @PostMapping("/redefinir-senha")
    public ResponseEntity<Map<String, String>> redefinirSenha(
            @Valid @RequestBody RedefinirSenhaRequest request) {
        
        redefinicaoSenhaService.redefinirSenha(request.getToken(), request.getNovaSenha());
        
        Map<String, String> response = new HashMap<>();
        response.put("mensagem", "Senha redefinida com sucesso");
        
        return ResponseEntity.ok(response);
    }
}