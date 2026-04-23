namespace MemuVie.Evento.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MemuVie.Evento.DTOs.Requests;
using MemuVie.Evento.DTOs.Responses;
using MemuVie.Evento.Models;
using MemuVie.Evento.Services;
using System.Security.Claims;

[ApiController]
[Route("/api/eventos")]
public class EventoController : ControllerBase
{
    private readonly IEventoService _eventoService;
    private readonly ILogger<EventoController> _logger;

    public EventoController(IEventoService eventoService, ILogger<EventoController> logger)
    {
        _eventoService = eventoService;
        _logger = logger;
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<EventoResponse>> Criar([FromBody] EventoRequest request)
    {
        try
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(email))
            {
                return Unauthorized(new ApiResponse(false, "Usuário não autenticado"));
            }

            var response = await _eventoService.CriarEventoAsync(request, email);
            return StatusCode(StatusCodes.Status201Created, response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao criar evento");
            return BadRequest(new ApiResponse(false, "Erro ao criar evento"));
        }
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<EventoResponse>>> ListarTodos()
    {
        try
        {
            var eventos = await _eventoService.ListarTodosAsync();
            return Ok(eventos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao listar eventos");
            return BadRequest(new ApiResponse(false, "Erro ao listar eventos"));
        }
    }

    [HttpGet("ativos")]
    public async Task<ActionResult<IEnumerable<EventoResponse>>> ListarEventosAtivos()
    {
        try
        {
            var eventos = await _eventoService.ListarEventosAtivosAsync();
            return Ok(eventos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao listar eventos ativos");
            return BadRequest(new ApiResponse(false, "Erro ao listar eventos ativos"));
        }
    }

    [HttpGet("votacao-aberta")]
    public async Task<ActionResult<IEnumerable<EventoResponse>>> ListarEventosComVotacaoAberta()
    {
        try
        {
            var eventos = await _eventoService.ListarEventosComVotacaoAbertaAsync();
            return Ok(eventos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao listar eventos com votação aberta");
            return BadRequest(new ApiResponse(false, "Erro ao listar eventos com votação aberta"));
        }
    }

    [HttpGet("meus-eventos")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<EventoResponse>>> ListarEventosDoUsuario()
    {
        try
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(email))
            {
                return Unauthorized(new ApiResponse(false, "Usuário não autenticado"));
            }

            var eventos = await _eventoService.ListarEventosPorUsuarioAsync(email);
            return Ok(eventos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao listar eventos do usuário");
            return BadRequest(new ApiResponse(false, "Erro ao listar eventos do usuário"));
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<EventoResponse>> BuscarPorId(long id)
    {
        try
        {
            var evento = await _eventoService.BuscarPorIdAsync(id);
            return Ok(evento);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar evento");
            return NotFound(new ApiResponse(false, "Evento não encontrado"));
        }
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<ActionResult<EventoResponse>> Atualizar(long id, [FromBody] EventoRequest request)
    {
        try
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(email))
            {
                return Unauthorized(new ApiResponse(false, "Usuário não autenticado"));
            }

            var evento = await _eventoService.AtualizarAsync(id, request, email);
            return Ok(evento);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new ApiResponse(false, ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao atualizar evento");
            return BadRequest(new ApiResponse(false, "Erro ao atualizar evento"));
        }
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Deletar(long id)
    {
        try
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(email))
            {
                return Unauthorized(new ApiResponse(false, "Usuário não autenticado"));
            }

            await _eventoService.DeletarAsync(id, email);
            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new ApiResponse(false, ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao deletar evento");
            return NotFound(new ApiResponse(false, "Evento não encontrado"));
        }
    }

    [HttpPost("{id}/encerrar-votacao")]
    [Authorize]
    public async Task<IActionResult> EncerrarVotacao(long id)
    {
        try
        {
            await _eventoService.EncerrarVotacaoAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao encerrar votação");
            return NotFound(new ApiResponse(false, "Evento não encontrado"));
        }
    }

    [HttpPost("{id}/revelar")]
    [Authorize]
    public async Task<IActionResult> Revelar(long id, [FromBody] BabySex resultado)
    {
        try
        {
            await _eventoService.RevelarAsync(id, resultado);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao revelar resultado");
            return NotFound(new ApiResponse(false, "Evento não encontrado"));
        }
    }
}
