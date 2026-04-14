namespace MemuVie.Evento.DTOs.Requests;

public class EventoRequest
{
    public string Titulo { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public DateTime DataEvento { get; set; }
    public string? Local { get; set; }
    public string NomeMae { get; set; } = string.Empty;
    public string NomePai { get; set; } = string.Empty;
    public DateTime? DataEncerramentoVotacao { get; set; }
    public string? FotoCapa { get; set; }
    public string? VideoDestaque { get; set; }
    public string? CorTema { get; set; }
}
