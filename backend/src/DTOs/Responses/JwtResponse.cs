namespace MemuVie.Evento.DTOs.Responses;

public class JwtResponse
{
    public string Token { get; set; } = string.Empty;
    public string Type { get; set; } = "Bearer";
    public UsuarioResponse Usuario { get; set; } = null!;
}
