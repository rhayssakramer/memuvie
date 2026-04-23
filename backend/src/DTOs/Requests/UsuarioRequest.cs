namespace MemuVie.Evento.DTOs.Requests;

public class UsuarioRequest
{
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Senha { get; set; }
    public string? SenhaAtual { get; set; }
    public string? FotoPerfil { get; set; }
}
