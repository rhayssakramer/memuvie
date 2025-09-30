package cha_revelacao.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class GaleriaPostResponse {
    private Long id;
    private String mensagem;
    private String urlFoto;
    private String urlVideo;
    private LocalDateTime dataCriacao;
    private UsuarioResponse usuario;
    private EventoResponse evento;
}