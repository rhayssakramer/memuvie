package cha_revelacao.controller;

import cha_revelacao.dto.request.EventoRequest;
import cha_revelacao.dto.response.EventoResponse;
import cha_revelacao.model.Evento;
import cha_revelacao.service.EventoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/eventos")
public class EventoController {

    private final EventoService eventoService;

    public EventoController(EventoService eventoService) {
        this.eventoService = eventoService;
    }

    @PostMapping
    public ResponseEntity<EventoResponse> criar(@Valid @RequestBody EventoRequest request,
                                               Authentication authentication) {
        EventoResponse response = eventoService.criarEvento(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<EventoResponse>> listarTodos() {
        return ResponseEntity.ok(eventoService.listarTodos());
    }

    @GetMapping("/ativos")
    public ResponseEntity<List<EventoResponse>> listarEventosAtivos() {
        return ResponseEntity.ok(eventoService.listarEventosAtivos());
    }

    @GetMapping("/votacao-aberta")
    public ResponseEntity<List<EventoResponse>> listarEventosComVotacaoAberta() {
        return ResponseEntity.ok(eventoService.listarEventosComVotacaoAberta());
    }

    @GetMapping("/meus-eventos")
    public ResponseEntity<List<EventoResponse>> listarEventosDoUsuario(Authentication authentication) {
        return ResponseEntity.ok(eventoService.listarEventosDoUsuario(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventoResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(eventoService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventoResponse> atualizar(@PathVariable Long id,
                                                  @Valid @RequestBody EventoRequest request,
                                                  Authentication authentication) {
        return ResponseEntity.ok(eventoService.atualizarEvento(id, request, authentication.getName()));
    }

    @PutMapping("/{id}/revelar")
    public ResponseEntity<EventoResponse> revelarResultado(@PathVariable Long id,
                                                        @RequestParam Evento.SexoBebe resultado,
                                                        Authentication authentication) {
        return ResponseEntity.ok(eventoService.revelarResultado(id, resultado, authentication.getName()));
    }

    @PutMapping("/{id}/encerrar-votacao")
    public ResponseEntity<EventoResponse> encerrarVotacao(@PathVariable Long id,
                                                       Authentication authentication) {
        return ResponseEntity.ok(eventoService.encerrarVotacao(id, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id, Authentication authentication) {
        eventoService.deletarEvento(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
