namespace MemuVie.Evento.Models;

public class TokenRedefinicaoSenha
{
    public long Id { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime DataExpiracao { get; set; }

    // Foreign Keys
    public long UsuarioId { get; set; }

    // Navigation properties
    public Usuario Usuario { get; set; } = null!;

    public bool IsExpirado()
    {
        return DateTime.UtcNow > DataExpiracao;
    }
}
