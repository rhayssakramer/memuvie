package cha_revelacao.dto.response;

import cha_revelacao.model.Usuario;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UsuarioResponse {
    private Long id;
    private String nome;
    private String email;
    private String fotoPerfil;
    private Usuario.TipoUsuario tipo;
    private Boolean ativo;
    private LocalDateTime criadoEm;

    public Long getId() {
        return id;
    }
}
