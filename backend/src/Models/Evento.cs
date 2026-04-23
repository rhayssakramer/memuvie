namespace MemuVie.Evento.Models;

public class Evento
{
    public long Id { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public DateTime DataEvento { get; set; }
    public string? Local { get; set; }
    public string NomeMae { get; set; } = string.Empty;
    public string NomePai { get; set; } = string.Empty;
    public bool Revelado { get; set; } = false;
    public BabySex? ResultadoRevelacao { get; set; }
    public EventStatus Status { get; set; } = EventStatus.Ativo;
    public bool VotacaoEncerrada { get; set; } = false;
    public DateTime? DataEncerramentoVotacao { get; set; }
    public string? FotoCapa { get; set; }
    public string? VideoDestaque { get; set; }
    public string? CorTema { get; set; }
    public EventType TipoEvento { get; set; } = EventType.ChaRevelacao;
    public DateTime CriadoEm { get; set; }
    public DateTime? AtualizadoEm { get; set; }

    // Foreign Keys
    public long UsuarioId { get; set; }

    // Navigation properties
    public Usuario Usuario { get; set; } = null!;
    public ICollection<Voto> Votos { get; set; } = new List<Voto>();
    public ICollection<GaleriaPost> GaleriaPosts { get; set; } = new List<GaleriaPost>();
}

public enum BabySex
{
    Menino = 0,
    Menina = 1
}

public enum EventStatus
{
    Ativo = 0,
    Cancelado = 1,
    Finalizado = 2
}

public enum EventType
{
    ChaRevelacao = 0,
    Aniversario = 1,
    Casamento = 2,
    Formatura = 3,
    Outro = 4
}
