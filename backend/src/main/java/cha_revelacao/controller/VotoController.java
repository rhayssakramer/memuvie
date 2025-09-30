package cha_revelacao.controller;

import cha_revelacao.dto.request.VotoRequest;
import cha_revelacao.dto.response.VotoResponse;
import cha_revelacao.service.VotoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/votos")
public class VotoController {

    private final VotoService votoService;

    public VotoController(VotoService votoService) {
        this.votoService = votoService;
    }

    @PostMapping
    public ResponseEntity<VotoResponse> votar(@Valid @RequestBody VotoRequest request,
                                            Authentication authentication) {
        VotoResponse response = votoService.votar(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<VotoResponse>> listarVotosDoUsuario(Authentication authentication) {
        return ResponseEntity.ok(votoService.listarVotosDoUsuario(authentication.getName()));
    }

    @GetMapping("/evento/{eventoId}")
    public ResponseEntity<List<VotoResponse>> listarVotosPorEvento(@PathVariable Long eventoId) {
        return ResponseEntity.ok(votoService.listarVotosPorEvento(eventoId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VotoResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(votoService.buscarPorId(id));
    }

    @GetMapping("/evento/{eventoId}/meu-voto")
    public ResponseEntity<VotoResponse> buscarVotoDoUsuarioNoEvento(@PathVariable Long eventoId,
                                                                   Authentication authentication) {
        return ResponseEntity.ok(votoService.buscarVotoDoUsuarioNoEvento(eventoId, authentication.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VotoResponse> atualizar(@PathVariable Long id,
                                                @Valid @RequestBody VotoRequest request,
                                                Authentication authentication) {
        return ResponseEntity.ok(votoService.atualizarVoto(id, request, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id, Authentication authentication) {
        votoService.deletarVoto(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
