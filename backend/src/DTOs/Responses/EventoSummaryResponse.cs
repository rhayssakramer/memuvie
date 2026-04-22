namespace MemuVie.Evento.DTOs.Responses;

using MemuVie.Evento.Models;

public class EventoSummaryResponse
{
    public long Id { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public DateTime DataEvento { get; set; }
    public BabySex? ResultadoRevelacao { get; set; }
    public EventStatus Status { get; set; }
}
