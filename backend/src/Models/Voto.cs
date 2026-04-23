namespace MemuVie.Evento.Models;

public class Voto
{
    public long Id { get; set; }
    public BabySex Palpite { get; set; }
    public string? Justificativa { get; set; }
    public DateTime CriadoEm { get; set; }

    // Foreign Keys
    public long EventoId { get; set; }
    public long ConvidadoId { get; set; }

    // Navigation properties
    public Evento Evento { get; set; } = null!;
    public Usuario Convidado { get; set; } = null!;
}
