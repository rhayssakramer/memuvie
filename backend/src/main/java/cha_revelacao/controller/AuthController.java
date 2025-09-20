package cha_revelacao.controller;

import cha_revelacao.dto.request.LoginRequest;
import cha_revelacao.dto.request.UsuarioRequest;
import cha_revelacao.dto.response.JwtResponse;
import cha_revelacao.dto.response.UsuarioResponse;
import cha_revelacao.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UsuarioService usuarioService;

    public AuthController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/registrar")
    public ResponseEntity<UsuarioResponse> registrar(@Valid @RequestBody UsuarioRequest request) {
        UsuarioResponse response = usuarioService.criarUsuario(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginRequest request) {
        JwtResponse response = usuarioService.autenticar(request);
        return ResponseEntity.ok(response);
    }
}
