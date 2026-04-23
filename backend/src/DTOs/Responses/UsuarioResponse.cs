namespace MemuVie.Evento.DTOs.Responses;

using MemuVie.Evento.Models;

public class UsuarioResponse
{
    public long Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? FotoPerfil { get; set; }
    public UserType Tipo { get; set; }
    public bool Ativo { get; set; }
    public DateTime CriadoEm { get; set; }
}
