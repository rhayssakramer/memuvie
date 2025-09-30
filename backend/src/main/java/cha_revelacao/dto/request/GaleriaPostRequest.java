package cha_revelacao.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class GaleriaPostRequest {

    @Size(max = 5000, message = "Mensagem deve ter no máximo 5000 caracteres")
    private String mensagem;

    private String urlFoto;
    
    private String urlVideo;
    
    @NotNull(message = "ID do evento é obrigatório")
    private Long eventoId;
}