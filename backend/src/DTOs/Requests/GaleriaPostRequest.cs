namespace MemuVie.Evento.DTOs.Requests;

public class GaleriaPostRequest
{
    public string? Mensagem { get; set; }
    public string? UrlFoto { get; set; }
    public string? UrlVideo { get; set; }
    public long EventoId { get; set; }
}
