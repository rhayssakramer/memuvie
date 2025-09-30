package cha_revelacao.dto.request;

import cha_revelacao.model.Evento;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EventoRequest {

    @NotBlank(message = "Título é obrigatório")
    @Size(max = 200, message = "Título deve ter no máximo 200 caracteres")
    private String titulo;

    @Size(max = 1000, message = "Descrição deve ter no máximo 1000 caracteres")
    private String descricao;

    @NotNull(message = "Data do evento é obrigatória")
    private LocalDateTime dataEvento;

    @Size(max = 500, message = "Local deve ter no máximo 500 caracteres")
    private String local;

    @NotBlank(message = "Nome da mãe é obrigatório")
    @Size(max = 100, message = "Nome da mãe deve ter no máximo 100 caracteres")
    private String nomeMae;

    @NotBlank(message = "Nome do pai é obrigatório")
    @Size(max = 100, message = "Nome do pai deve ter no máximo 100 caracteres")
    private String nomePai;

    private LocalDateTime dataEncerramentoVotacao;
    
    @Size(max = 1000, message = "URL da foto de capa deve ter no máximo 1000 caracteres")
    private String fotoCapa;
    
    @Size(max = 1000, message = "URL do vídeo de destaque deve ter no máximo 1000 caracteres")
    private String videoDestaque;
    
    private String corTema;
    
    private Evento.TipoEvento tipoEvento;

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public LocalDateTime getDataEvento() { return dataEvento; }
    public void setDataEvento(LocalDateTime dataEvento) { this.dataEvento = dataEvento; }
    public String getLocal() { return local; }
    public void setLocal(String local) { this.local = local; }
    public String getNomeMae() { return nomeMae; }
    public void setNomeMae(String nomeMae) { this.nomeMae = nomeMae; }
    public String getNomePai() { return nomePai; }
    public void setNomePai(String nomePai) { this.nomePai = nomePai; }
    public LocalDateTime getDataEncerramentoVotacao() { return dataEncerramentoVotacao; }
    public void setDataEncerramentoVotacao(LocalDateTime dataEncerramentoVotacao) { this.dataEncerramentoVotacao = dataEncerramentoVotacao; }
    public String getFotoCapa() { return fotoCapa; }
    public void setFotoCapa(String fotoCapa) { this.fotoCapa = fotoCapa; }
    public String getVideoDestaque() { return videoDestaque; }
    public void setVideoDestaque(String videoDestaque) { this.videoDestaque = videoDestaque; }
    public String getCorTema() { return corTema; }
    public void setCorTema(String corTema) { this.corTema = corTema; }
    public Evento.TipoEvento getTipoEvento() { return tipoEvento; }
    public void setTipoEvento(Evento.TipoEvento tipoEvento) { this.tipoEvento = tipoEvento; }
}
