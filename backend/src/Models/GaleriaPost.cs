namespace MemuVie.Evento.Models;

public class GaleriaPost
{
    public long Id { get; set; }
    public string? Mensagem { get; set; }
    public string? UrlFoto { get; set; }
    public string? UrlVideo { get; set; }
    public DateTime DataCriacao { get; set; }

    // Foreign Keys
    public long UsuarioId { get; set; }
    public long EventoId { get; set; }

    // Navigation properties
    public Usuario Usuario { get; set; } = null!;
    public Evento Evento { get; set; } = null!;
}
