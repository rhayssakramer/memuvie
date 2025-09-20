package cha_revelacao.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "eventos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Evento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 200)
    @Column(nullable = false)
    private String titulo;

    @Size(max = 1000)
    private String descricao;

    @NotNull
    @Column(name = "data_evento", nullable = false)
    private LocalDateTime dataEvento;

    @Size(max = 500)
    private String local;

    @NotBlank
    @Size(max = 100)
    @Column(name = "nome_mae", nullable = false)
    private String nomeMae;

    @NotBlank
    @Size(max = 100)
    @Column(name = "nome_pai", nullable = false)
    private String nomePai;

    @Column(name = "revelado")
    private Boolean revelado = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "resultado_revelacao")
    private SexoBebe resultadoRevelacao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusEvento status = StatusEvento.ATIVO;

    @Column(name = "votacao_encerrada")
    private Boolean votacaoEncerrada = false;

    @Column(name = "data_encerramento_votacao")
    private LocalDateTime dataEncerramentoVotacao;

    @CreationTimestamp
    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @OneToMany(mappedBy = "evento", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Voto> votos;

    public enum SexoBebe {
        MENINO, MENINA
    }

    public enum StatusEvento {
        ATIVO, CANCELADO, FINALIZADO
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
    public Boolean getRevelado() { return revelado; }
    public void setRevelado(Boolean revelado) { this.revelado = revelado; }
    public SexoBebe getResultadoRevelacao() { return resultadoRevelacao; }
    public void setResultadoRevelacao(SexoBebe resultadoRevelacao) { this.resultadoRevelacao = resultadoRevelacao; }
    public StatusEvento getStatus() { return status; }
    public void setStatus(StatusEvento status) { this.status = status; }
    public Boolean getVotacaoEncerrada() { return votacaoEncerrada; }
    public void setVotacaoEncerrada(Boolean votacaoEncerrada) { this.votacaoEncerrada = votacaoEncerrada; }
    public LocalDateTime getDataEncerramentoVotacao() { return dataEncerramentoVotacao; }
    public void setDataEncerramentoVotacao(LocalDateTime dataEncerramentoVotacao) { this.dataEncerramentoVotacao = dataEncerramentoVotacao; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
}
