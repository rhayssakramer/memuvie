package cha_revelacao.dto.response;

import cha_revelacao.model.Evento;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EventoResponse {
    private Long id;
    private String titulo;
    private String descricao;
    private LocalDateTime dataEvento;
    private String local;
    private String nomeMae;
    private String nomePai;
    private Boolean revelado;
    private Evento.SexoBebe resultadoRevelacao;
    private Evento.StatusEvento status;
    private Boolean votacaoEncerrada;
    private LocalDateTime dataEncerramentoVotacao;
    private LocalDateTime criadoEm;
    private UsuarioResponse organizador;
    private Integer totalVotosMenino;
    private Integer totalVotosMenina;
    private Integer totalVotos;

    public UsuarioResponse getOrganizador() { return organizador; }
    public void setOrganizador(UsuarioResponse organizador) { this.organizador = organizador; }
    public Integer getTotalVotosMenino() { return totalVotosMenino; }
    public void setTotalVotosMenino(Integer totalVotosMenino) { this.totalVotosMenino = totalVotosMenino; }
    public Integer getTotalVotosMenina() { return totalVotosMenina; }
    public void setTotalVotosMenina(Integer totalVotosMenina) { this.totalVotosMenina = totalVotosMenina; }
    public Integer getTotalVotos() { return totalVotos; }
    public void setTotalVotos(Integer totalVotos) { this.totalVotos = totalVotos; }
}
