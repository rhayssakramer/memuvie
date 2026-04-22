namespace MemuVie.Evento.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MemuVie.Evento.DTOs.Requests;
using MemuVie.Evento.DTOs.Responses;
using MemuVie.Evento.Services;
using System.Security.Claims;

[ApiController]
[Route("/usuarios")]
[Authorize]
public class UsuarioController : ControllerBase
{
    private readonly IUsuarioService _usuarioService;
    private readonly ILogger<UsuarioController> _logger;

    public UsuarioController(IUsuarioService usuarioService, ILogger<UsuarioController> logger)
    {
        _usuarioService = usuarioService;
        _logger = logger;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<UsuarioResponse>>> ListarTodos()
    {
        try
        {
            var usuarios = await _usuarioService.ListarTodosAsync();
            return Ok(usuarios);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao listar usuários");
            return BadRequest(new ApiResponse(false, "Erro ao listar usuários"));
        }
    }

    [HttpGet("/{id}")]
    public async Task<ActionResult<UsuarioResponse>> BuscarPorId(long id)
    {
        try
        {
            var usuario = await _usuarioService.BuscarPorIdAsync(id);
            return Ok(usuario);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar usuário");
            return NotFound(new ApiResponse(false, "Usuário não encontrado"));
        }
    }

    [HttpGet("/me")]
    public async Task<ActionResult<UsuarioResponse>> BuscarUsuarioAtual()
    {
        try
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(email))
            {
                return Unauthorized(new ApiResponse(false, "Usuário não autenticado"));
            }

            var usuario = await _usuarioService.BuscarUsuarioAtualAsync(email);
            return Ok(usuario);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar usuário atual");
            return NotFound(new ApiResponse(false, "Usuário não encontrado"));
        }
    }

    [HttpPut("/{id}")]
    public async Task<ActionResult<UsuarioResponse>> Atualizar(long id, [FromBody] UsuarioRequest request)
    {
        try
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(email))
            {
                return Unauthorized(new ApiResponse(false, "Usuário não autenticado"));
            }

            var usuario = await _usuarioService.AtualizarAsync(id, request, email);
            return Ok(usuario);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new ApiResponse(false, ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao atualizar usuário");
            return BadRequest(new ApiResponse(false, "Erro ao atualizar usuário"));
        }
    }

    [HttpDelete("/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Desativar(long id)
    {
        try
        {
            await _usuarioService.DesativarAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao desativar usuário");
            return NotFound(new ApiResponse(false, "Usuário não encontrado"));
        }
    }

    [HttpPut("/{id}/alterar-senha")]
    public async Task<IActionResult> AlterarSenha(long id, [FromBody] AlterarSenhaRequest request)
    {
        try
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(email))
            {
                return Unauthorized(new ApiResponse(false, "Usuário não autenticado"));
            }

            await _usuarioService.AlterarSenhaAsync(id, request);
            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new ApiResponse(false, ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao alterar senha");
            return BadRequest(new ApiResponse(false, "Erro ao alterar senha"));
        }
    }
}
