namespace MemuVie.Evento.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MemuVie.Evento.DTOs.Requests;
using MemuVie.Evento.DTOs.Responses;
using MemuVie.Evento.Services;
using System.Security.Claims;

[ApiController]
[Route("/api/galeria")]
public class GaleriaController : ControllerBase
{
    private readonly IGaleriaService _galeriaService;
    private readonly ILogger<GaleriaController> _logger;

    public GaleriaController(IGaleriaService galeriaService, ILogger<GaleriaController> logger)
    {
        _galeriaService = galeriaService;
        _logger = logger;
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<GaleriaPostResponse>> CriarPost([FromBody] GaleriaPostRequest request)
    {
        try
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(email))
            {
                return Unauthorized(new ApiResponse(false, "Usuário não autenticado"));
            }

            var response = await _galeriaService.CriarPostAsync(request, email);
            return StatusCode(StatusCodes.Status201Created, response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao criar post");
            return BadRequest(new ApiResponse(false, "Erro ao criar post"));
        }
    }

    [HttpGet("evento/{eventoId}")]
    public async Task<ActionResult<IEnumerable<GaleriaPostResponse>>> ListarPostsDoEvento(long eventoId)
    {
        try
        {
            var posts = await _galeriaService.ListarPostsPorEventoAsync(eventoId);
            return Ok(posts);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao listar posts do evento");
            return BadRequest(new ApiResponse(false, "Erro ao listar posts do evento"));
        }
    }

    [HttpGet("meus-posts")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<GaleriaPostResponse>>> ListarPostsDoUsuario()
    {
        try
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(email))
            {
                return Unauthorized(new ApiResponse(false, "Usuário não autenticado"));
            }

            var posts = await _galeriaService.ListarPostsPorUsuarioAsync(email);
            return Ok(posts);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao listar posts do usuário");
            return BadRequest(new ApiResponse(false, "Erro ao listar posts do usuário"));
        }
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<GaleriaPostResponse>>> ListarTodosPosts()
    {
        try
        {
            var posts = await _galeriaService.ListarTodosPostsAsync();
            return Ok(posts);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao listar todos os posts");
            return BadRequest(new ApiResponse(false, "Erro ao listar todos os posts"));
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<GaleriaPostResponse>> BuscarPostPorId(long id)
    {
        try
        {
            var post = await _galeriaService.BuscarPostPorIdAsync(id);
            return Ok(post);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar post");
            return NotFound(new ApiResponse(false, "Post não encontrado"));
        }
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<ActionResult<GaleriaPostResponse>> AtualizarPost(long id, [FromBody] GaleriaPostRequest request)
    {
        try
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(email))
            {
                return Unauthorized(new ApiResponse(false, "Usuário não autenticado"));
            }

            var post = await _galeriaService.AtualizarPostAsync(id, request, email);
            return Ok(post);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new ApiResponse(false, ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao atualizar post");
            return BadRequest(new ApiResponse(false, "Erro ao atualizar post"));
        }
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeletarPost(long id)
    {
        try
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(email))
            {
                return Unauthorized(new ApiResponse(false, "Usuário não autenticado"));
            }

            await _galeriaService.DeletarPostAsync(id, email);
            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new ApiResponse(false, ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao deletar post");
            return NotFound(new ApiResponse(false, "Post não encontrado"));
        }
    }
}
