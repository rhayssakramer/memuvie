namespace MemuVie.Evento.DTOs.Requests;

using MemuVie.Evento.Models;

public class VotoRequest
{
    public long EventoId { get; set; }
    public BabySex Palpite { get; set; }
    public string? Justificativa { get; set; }
}
