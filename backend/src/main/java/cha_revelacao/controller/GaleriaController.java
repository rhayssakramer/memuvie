package cha_revelacao.controller;

import cha_revelacao.dto.request.GaleriaPostRequest;
import cha_revelacao.dto.response.GaleriaPostResponse;
import cha_revelacao.service.GaleriaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/galeria")
public class GaleriaController {

    private final GaleriaService galeriaService;

    public GaleriaController(GaleriaService galeriaService) {
        this.galeriaService = galeriaService;
    }

    @PostMapping
    public ResponseEntity<GaleriaPostResponse> criarPost(
            @Valid @RequestBody GaleriaPostRequest request,
            Authentication authentication) {
        GaleriaPostResponse response = galeriaService.criarPost(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/evento/{eventoId}")
    public ResponseEntity<List<GaleriaPostResponse>> listarPostsDoEvento(@PathVariable Long eventoId) {
        return ResponseEntity.ok(galeriaService.listarPostsDoEvento(eventoId));
    }

    @GetMapping("/meus-posts")
    public ResponseEntity<List<GaleriaPostResponse>> listarPostsDoUsuario(Authentication authentication) {
        return ResponseEntity.ok(galeriaService.listarPostsDoUsuario(authentication.getName()));
    }

    @GetMapping
    public ResponseEntity<List<GaleriaPostResponse>> listarTodosPosts() {
        return ResponseEntity.ok(galeriaService.listarTodosPosts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GaleriaPostResponse> buscarPostPorId(@PathVariable Long id) {
        return ResponseEntity.ok(galeriaService.buscarPostPorId(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarPost(@PathVariable Long id, Authentication authentication) {
        galeriaService.deletarPost(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}