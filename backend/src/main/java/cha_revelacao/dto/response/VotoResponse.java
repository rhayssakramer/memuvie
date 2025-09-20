package cha_revelacao.dto.response;

import cha_revelacao.model.Evento;
import java.time.LocalDateTime;

public class VotoResponse {
    private Long id;
    private Evento.SexoBebe palpite;
    private String justificativa;
    private LocalDateTime criadoEm;
    private UsuarioResponse convidado;
    private EventoSummaryResponse evento;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Evento.SexoBebe getPalpite() { return palpite; }
    public void setPalpite(Evento.SexoBebe palpite) { this.palpite = palpite; }
    public String getJustificativa() { return justificativa; }
    public void setJustificativa(String justificativa) { this.justificativa = justificativa; }
    public LocalDateTime getCriadoEm() { return criadoEm; }
    public void setCriadoEm(LocalDateTime criadoEm) { this.criadoEm = criadoEm; }
    public UsuarioResponse getConvidado() { return convidado; }
    public void setConvidado(UsuarioResponse convidado) { this.convidado = convidado; }
    public void assignConvidado(UsuarioResponse convidado) { this.convidado = convidado; }
    public EventoSummaryResponse getEvento() { return evento; }
    public void setEvento(EventoSummaryResponse evento) { this.evento = evento; }
    public void assignEvento(EventoSummaryResponse evento) { this.evento = evento; }
}
