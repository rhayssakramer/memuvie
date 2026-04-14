namespace MemuVie.Evento.Models;

public class Usuario
{
    public long Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Senha { get; set; } = string.Empty;
    public string? FotoPerfil { get; set; }
    public UserType Tipo { get; set; } = UserType.Convidado;
    public bool Ativo { get; set; } = true;
    public DateTime CriadoEm { get; set; }
    public DateTime? AtualizadoEm { get; set; }

    // Navigation properties
    public ICollection<Voto> Votos { get; set; } = new List<Voto>();
    public ICollection<GaleriaPost> GaleriaPosts { get; set; } = new List<GaleriaPost>();
    public ICollection<Evento> Eventos { get; set; } = new List<Evento>();
}

public enum UserType
{
    Admin = 0,
    Convidado = 1
}
