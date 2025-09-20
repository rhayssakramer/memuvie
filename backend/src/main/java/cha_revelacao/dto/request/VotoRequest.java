package cha_revelacao.dto.request;

import cha_revelacao.model.Evento;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class VotoRequest {

    @NotNull(message = "Evento é obrigatório")
    private Long eventoId;

    @NotNull(message = "Palpite é obrigatório")
    private Evento.SexoBebe palpite;

    @Size(max = 500, message = "Justificativa deve ter no máximo 500 caracteres")
    private String justificativa;

    public Long getEventoId() { return eventoId; }
    public void setEventoId(Long eventoId) { this.eventoId = eventoId; }

    public Evento.SexoBebe getPalpite() { return palpite; }
    public void setPalpite(Evento.SexoBebe palpite) { this.palpite = palpite; }

    public String getJustificativa() { return justificativa; }
    public void setJustificativa(String justificativa) { this.justificativa = justificativa; }
}
