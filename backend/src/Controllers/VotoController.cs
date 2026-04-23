namespace MemuVie.Evento.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MemuVie.Evento.DTOs.Requests;
using MemuVie.Evento.DTOs.Responses;
using MemuVie.Evento.Services;
using System.Security.Claims;

[ApiController]
[Route("/votos")]
[Authorize]
public class VotoController : ControllerBase
{
    private readonly IVotoService _votoService;
    private readonly ILogger<VotoController> _logger;

    public VotoController(IVotoService votoService, ILogger<VotoController> logger)
    {
        _votoService = votoService;
        _logger = logger;
    }

    [HttpPost]
    public async Task<ActionResult<VotoResponse>> Votar([FromBody] VotoRequest request)
    {
        try
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(email))
            {
                return Unauthorized(new ApiResponse(false, "Usuário não autenticado"));
            }

            var response = await _votoService.VotarAsync(request, email);
            return StatusCode(StatusCodes.Status201Created, response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao votar");
            return BadRequest(new ApiResponse(false, "Erro ao votar"));
        }
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<VotoResponse>>> ListarVotosDoUsuario()
    {
        try
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(email))
            {
                return Unauthorized(new ApiResponse(false, "Usuário não autenticado"));
            }

            var votos = await _votoService.ListarVotosPorUsuarioAsync(email);
            return Ok(votos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao listar votos do usuário");
            return BadRequest(new ApiResponse(false, "Erro ao listar votos do usuário"));
        }
    }

    [HttpGet("evento/{eventoId}")]
    public async Task<ActionResult<IEnumerable<VotoResponse>>> ListarVotosPorEvento(long eventoId)
    {
        try
        {
            var votos = await _votoService.ListarVotosPorEventoAsync(eventoId);
            return Ok(votos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao listar votos do evento");
            return BadRequest(new ApiResponse(false, "Erro ao listar votos do evento"));
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<VotoResponse>> BuscarPorId(long id)
    {
        try
        {
            var voto = await _votoService.BuscarPorIdAsync(id);
            return Ok(voto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar voto");
            return NotFound(new ApiResponse(false, "Voto não encontrado"));
        }
    }

    [HttpGet("evento/{eventoId}/meu-voto")]
    public async Task<ActionResult<VotoResponse>> BuscarVotoDoUsuarioNoEvento(long eventoId)
    {
        try
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(email))
            {
                return Unauthorized(new ApiResponse(false, "Usuário não autenticado"));
            }

            var voto = await _votoService.BuscarVotoDoUsuarioNoEventoAsync(eventoId, email);
            if (voto == null)
            {
                return NotFound(new ApiResponse(false, "Voto não encontrado"));
            }
            return Ok(voto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar voto do usuário");
            return BadRequest(new ApiResponse(false, "Erro ao buscar voto do usuário"));
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<VotoResponse>> Atualizar(long id, [FromBody] VotoRequest request)
    {
        try
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(email))
            {
                return Unauthorized(new ApiResponse(false, "Usuário não autenticado"));
            }

            var voto = await _votoService.AtualizarAsync(id, request, email);
            return Ok(voto);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new ApiResponse(false, ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao atualizar voto");
            return BadRequest(new ApiResponse(false, "Erro ao atualizar voto"));
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Deletar(long id)
    {
        try
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(email))
            {
                return Unauthorized(new ApiResponse(false, "Usuário não autenticado"));
            }

            await _votoService.DeletarAsync(id, email);
            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new ApiResponse(false, ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao deletar voto");
            return NotFound(new ApiResponse(false, "Voto não encontrado"));
        }
    }
}
