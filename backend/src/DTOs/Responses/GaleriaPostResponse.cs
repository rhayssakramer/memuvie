namespace MemuVie.Evento.DTOs.Responses;

public class GaleriaPostResponse
{
    public long Id { get; set; }
    public string? Mensagem { get; set; }
    public string? UrlFoto { get; set; }
    public string? UrlVideo { get; set; }
    public DateTime DataCriacao { get; set; }
    public UsuarioResponse Usuario { get; set; } = null!;
    public EventoSummaryResponse Evento { get; set; } = null!;
}
