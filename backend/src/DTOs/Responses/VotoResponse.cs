namespace MemuVie.Evento.DTOs.Responses;

using MemuVie.Evento.Models;

public class VotoResponse
{
    public long Id { get; set; }
    public BabySex Palpite { get; set; }
    public string? Justificativa { get; set; }
    public DateTime CriadoEm { get; set; }
    public EventoSummaryResponse Evento { get; set; } = null!;
    public UsuarioResponse Convidado { get; set; } = null!;
}
