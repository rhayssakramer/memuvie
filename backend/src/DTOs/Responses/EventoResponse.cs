namespace MemuVie.Evento.DTOs.Responses;

using MemuVie.Evento.Models;

public class EventoResponse
{
    public long Id { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public DateTime DataEvento { get; set; }
    public string? Local { get; set; }
    public string NomeMae { get; set; } = string.Empty;
    public string NomePai { get; set; } = string.Empty;
    public bool Revelado { get; set; }
    public BabySex? ResultadoRevelacao { get; set; }
    public EventStatus Status { get; set; }
    public bool VotacaoEncerrada { get; set; }
    public DateTime? DataEncerramentoVotacao { get; set; }
    public string? FotoCapa { get; set; }
    public string? VideoDestaque { get; set; }
    public string? CorTema { get; set; }
    public EventType TipoEvento { get; set; }
    public DateTime CriadoEm { get; set; }
    public UsuarioResponse Usuario { get; set; } = null!;
}
