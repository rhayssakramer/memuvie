namespace MemuVie.Evento.DTOs.Requests;

using System.ComponentModel.DataAnnotations;

public class UsuarioRequest
{
    [Required(ErrorMessage = "Nome é obrigatório")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Nome deve ter entre 2 e 100 caracteres")]
    public string Nome { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email é obrigatório")]
    [EmailAddress(ErrorMessage = "Email inválido")]
    [StringLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Senha é obrigatória")]
    [StringLength(100, MinimumLength = 8, ErrorMessage = "Senha deve ter no mínimo 8 caracteres")]
    public string? Senha { get; set; }

    [StringLength(100, MinimumLength = 8, ErrorMessage = "Senha atual deve ter no mínimo 8 caracteres")]
    public string? SenhaAtual { get; set; }

    [StringLength(1000000)]
    public string? FotoPerfil { get; set; }
}
