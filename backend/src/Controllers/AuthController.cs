namespace MemuVie.Evento.Controllers;

using Microsoft.AspNetCore.Mvc;
using MemuVie.Evento.DTOs.Requests;
using MemuVie.Evento.DTOs.Responses;
using MemuVie.Evento.Exceptions;
using MemuVie.Evento.Services;

[ApiController]
[Route("/api/auth")]
public class AuthController : ControllerBase
{
    private readonly IUsuarioService _usuarioService;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        IUsuarioService usuarioService,
        IEmailService emailService,
        IConfiguration configuration,
        ILogger<AuthController> logger)
    {
        _usuarioService = usuarioService;
        _emailService = emailService;
        _configuration = configuration;
        _logger = logger;
    }

    [HttpPost("registrar")]
    public async Task<ActionResult<UsuarioResponse>> Registrar([FromBody] UsuarioRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ApiResponse(false, "Dados de entrada inválidos"));
            }

            var response = await _usuarioService.CriarUsuarioAsync(request);
            return StatusCode(StatusCodes.Status201Created, response);
        }
        catch (BusinessException ex)
        {
            _logger.LogWarning("Erro de negócio no registro: {Message}", ex.Message);
            return Conflict(new ApiResponse(false, ex.Message));
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("Erro de validação no registro: {Message}", ex.Message);
            return BadRequest(new ApiResponse(false, ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao registrar usuário");
            return StatusCode(StatusCodes.Status500InternalServerError, new ApiResponse(false, "Erro ao processar a requisição"));
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<JwtResponse>> Login([FromBody] LoginRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Tentativa de login com dados inválidos");
                return BadRequest(new ApiResponse(false, "Email ou senha inválidos"));
            }

            var response = await _usuarioService.AutenticarAsync(request);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Tentativa de login falhou");
            return Unauthorized(new ApiResponse(false, "Email ou senha inválidos"));
        }
    }

    [HttpPost("esqueci-senha")]
    public async Task<ActionResult<ApiResponse>> EsqueciSenha([FromBody] EsqueciSenhaRequest request)
    {
        try
        {
            if (!ModelState.IsValid || string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest(new ApiResponse(false, "Email inválido"));
            }

            // Buscar usuário pelo email
            var usuario = await _usuarioService.ObterPorEmailAsync(request.Email);
            if (usuario == null)
            {
                // Não revelar se o email existe por segurança
                _logger.LogInformation("Solicitação de redefinição para email inexistente: {Email}", request.Email);
                return Ok(new ApiResponse(true, "Se o email existe na base, você receberá instruções para redefinir sua senha"));
            }

            // Gerar token de redefinição
            var token = await _usuarioService.GerarTokenRedefinicaoAsync(usuario);
            if (string.IsNullOrEmpty(token))
            {
                _logger.LogError("Falha ao gerar token de redefinição para usuário: {UserId}", usuario.Id);
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new ApiResponse(false, "Erro ao gerar token de redefinição"));
            }

            // Obter URL do frontend
            var frontendUrl = _configuration["App:FrontendUrl"] ?? "http://localhost:4200";

            // Enviar email de redefinição
            var emailSent = await _emailService.SendPasswordResetEmailAsync(
                email: usuario.Email,
                nome: usuario.Nome,
                resetToken: token,
                baseUrl: frontendUrl
            );

            if (!emailSent)
            {
                _logger.LogError("Falha ao enviar email de redefinição para: {Email}", usuario.Email);
                // Ainda assim retornamos sucesso para não revelar problemas técnicos
            }

            _logger.LogInformation("Email de redefinição de senha enviado para: {Email}", usuario.Email);
            return Ok(new ApiResponse(true, "Se o email existe na base, você receberá instruções para redefinir sua senha"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao processar solicitação de esqueci-senha para: {Email}", request.Email);
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new ApiResponse(false, "Erro ao processar solicitação"));
        }
    }

    [HttpPost("redefinir-senha")]
    public async Task<ActionResult<ApiResponse>> RedefinirSenha([FromBody] RedefinirSenhaRequest request)
    {
        try
        {
            if (!ModelState.IsValid || string.IsNullOrWhiteSpace(request.Token) || string.IsNullOrWhiteSpace(request.NovaSenha))
            {
                return BadRequest(new ApiResponse(false, "Token e nova senha são obrigatórios"));
            }

            // Validar força da senha (mínimo 8 caracteres)
            if (request.NovaSenha.Length < 8)
            {
                return BadRequest(new ApiResponse(false, "A senha deve ter no mínimo 8 caracteres"));
            }

            await _usuarioService.RedefinirSenhaAsync(request.Token, request.NovaSenha);
            _logger.LogInformation("Senha redefinida com sucesso");
            return Ok(new ApiResponse(true, "Senha redefinida com sucesso. Você pode fazer login agora."));
        }
        catch (Exceptions.BusinessException ex)
        {
            _logger.LogWarning("Erro ao redefinir senha: {Message}", ex.Message);
            return BadRequest(new ApiResponse(false, ex.Message));
        }
        catch (Exceptions.ResourceNotFoundException ex)
        {
            _logger.LogWarning("Recurso não encontrado ao redefinir senha: {Message}", ex.Message);
            return NotFound(new ApiResponse(false, ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao redefinir senha");
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new ApiResponse(false, "Erro ao redefinir senha"));
        }
    }
}

