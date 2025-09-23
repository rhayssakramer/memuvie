package cha_revelacao.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "tokens_redefinicao_senha")
@Data
public class TokenRedefinicaoSenha {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String token;
    
    @ManyToOne(targetEntity = Usuario.class, fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "usuario_id")
    private Usuario usuario;
    
    @Column(nullable = false)
    private LocalDateTime dataExpiracao;
    
    public TokenRedefinicaoSenha() {
    }
    
    public TokenRedefinicaoSenha(String token, Usuario usuario, LocalDateTime dataExpiracao) {
        this.token = token;
        this.usuario = usuario;
        this.dataExpiracao = dataExpiracao;
    }
    
    public boolean isExpirado() {
        return LocalDateTime.now().isAfter(this.dataExpiracao);
    }
}