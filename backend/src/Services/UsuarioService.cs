namespace MemuVie.Evento.Services;

using AutoMapper;
using MemuVie.Evento.Data.Repositories;
using MemuVie.Evento.DTOs.Requests;
using MemuVie.Evento.DTOs.Responses;
using MemuVie.Evento.Exceptions;
using MemuVie.Evento.Models;
using MemuVie.Evento.Security;

public interface IUsuarioService
{
    Task<UsuarioResponse> CriarUsuarioAsync(UsuarioRequest request);
    Task<JwtResponse> AutenticarAsync(LoginRequest request);
    Task<UsuarioResponse> BuscarPorIdAsync(long id);
    Task<UsuarioResponse> BuscarPorEmailAsync(string email);
    Task<UsuarioResponse> BuscarUsuarioAtualAsync(string email);
    Task<IEnumerable<UsuarioResponse>> ListarTodosAsync();
    Task<IEnumerable<UsuarioResponse>> ListarTodosAtivosAsync();
    Task<UsuarioResponse> AtualizarAsync(long id, UsuarioRequest request, string emailAtual);
    Task DesativarAsync(long id);
    Task AlterarSenhaAsync(long id, AlterarSenhaRequest request);
    Task<Usuario?> ObterPorEmailAsync(string email);
    Task<string> GerarTokenRedefinicaoAsync(Usuario usuario);
    Task<bool> RedefinirSenhaAsync(string token, string novaSenha);
}

public class UsuarioService : IUsuarioService
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly ITokenRedefinicaoSenhaRepository _tokenRepository;
    private readonly IPasswordHashService _passwordHashService;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IMapper _mapper;
    private readonly ILogger<UsuarioService> _logger;

    public UsuarioService(
        IUsuarioRepository usuarioRepository,
        ITokenRedefinicaoSenhaRepository tokenRepository,
        IPasswordHashService passwordHashService,
        IJwtTokenService jwtTokenService,
        IMapper mapper,
        ILogger<UsuarioService> logger)
    {
        _usuarioRepository = usuarioRepository;
        _tokenRepository = tokenRepository;
        _passwordHashService = passwordHashService;
        _jwtTokenService = jwtTokenService;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<UsuarioResponse> CriarUsuarioAsync(UsuarioRequest request)
    {
        // Validar entrada
        if (string.IsNullOrWhiteSpace(request.Nome))
            throw new ArgumentException("Nome é obrigatório");

        if (string.IsNullOrWhiteSpace(request.Email))
            throw new ArgumentException("Email é obrigatório");

        if (string.IsNullOrWhiteSpace(request.Senha))
            throw new ArgumentException("Senha é obrigatória");

        if (request.Senha.Length < 8)
            throw new ArgumentException("Senha deve ter no mínimo 8 caracteres");

        var emailNormalizado = request.Email.ToLower().Trim();

        // Verificar se email já existe
        var usuarioExistente = await _usuarioRepository.GetByEmailAsync(emailNormalizado);
        if (usuarioExistente != null)
        {
            throw new BusinessException("Email já está em uso");
        }

        var usuario = new Usuario
        {
            Nome = request.Nome.Trim(),
            Email = emailNormalizado,
            Senha = _passwordHashService.HashPassword(request.Senha),
            FotoPerfil = request.FotoPerfil,
            Tipo = UserType.Convidado,
            Ativo = true,
            CriadoEm = DateTime.UtcNow
        };

        var usuarioSalvo = await _usuarioRepository.AddAsync(usuario);
        try
        {
            return _mapper.Map<UsuarioResponse>(usuarioSalvo);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao mapear usuário para resposta: {UserId}", usuarioSalvo.Id);
            throw;
        }
    }

    public async Task<JwtResponse> AutenticarAsync(LoginRequest request)
    {
        var emailNormalizado = request.Email.ToLower().Trim();

        _logger.LogInformation("Tentativa de autenticação para usuário: {Email}", emailNormalizado);

        var usuario = await _usuarioRepository.GetByEmailAndAtivoAsync(emailNormalizado);
        if (usuario == null)
        {
            _logger.LogWarning("Tentativa de login para usuário inexistente ou inativo: {Email}", emailNormalizado);
            throw new BusinessException("Credenciais inválidas");
        }

        if (!_passwordHashService.VerifyPassword(request.Senha, usuario.Senha))
        {
            _logger.LogWarning("Senha incorreta para usuário: {Email}", emailNormalizado);
            throw new BusinessException("Credenciais inválidas");
        }

        _logger.LogInformation("Autenticação bem-sucedida para o usuário: {Email}", emailNormalizado);

        var token = _jwtTokenService.GenerateToken(usuario);
        return new JwtResponse
        {
            Token = token,
            Type = "Bearer",
            Usuario = _mapper.Map<UsuarioResponse>(usuario)
        };
    }

    public async Task<UsuarioResponse> BuscarPorIdAsync(long id)
    {
        var usuario = await _usuarioRepository.GetByIdAsync(id);
        if (usuario == null)
        {
            throw new ResourceNotFoundException("Usuário não encontrado");
        }
        return _mapper.Map<UsuarioResponse>(usuario);
    }

    public async Task<UsuarioResponse> BuscarPorEmailAsync(string email)
    {
        var usuario = await _usuarioRepository.GetByEmailAsync(email.ToLower().Trim());
        if (usuario == null)
        {
            throw new ResourceNotFoundException("Usuário não encontrado");
        }
        return _mapper.Map<UsuarioResponse>(usuario);
    }

    public async Task<UsuarioResponse> BuscarUsuarioAtualAsync(string email)
    {
        var usuario = await _usuarioRepository.GetByEmailAndAtivoAsync(email.ToLower().Trim());
        if (usuario == null)
        {
            throw new ResourceNotFoundException("Usuário não encontrado");
        }
        return _mapper.Map<UsuarioResponse>(usuario);
    }

    public async Task<IEnumerable<UsuarioResponse>> ListarTodosAsync()
    {
        var usuarios = await _usuarioRepository.GetAllAsync();
        return usuarios.Select(u => _mapper.Map<UsuarioResponse>(u));
    }

    public async Task<IEnumerable<UsuarioResponse>> ListarTodosAtivosAsync()
    {
        var usuarios = await _usuarioRepository.GetAllAtivosAsync();
        return usuarios.Select(u => _mapper.Map<UsuarioResponse>(u));
    }

    public async Task<UsuarioResponse> AtualizarAsync(long id, UsuarioRequest request, string emailAtual)
    {
        var usuario = await _usuarioRepository.GetByIdAsync(id);
        if (usuario == null)
        {
            throw new ResourceNotFoundException("Usuário não encontrado");
        }

        // Verificar se é o próprio usuário
        if (usuario.Email != emailAtual.ToLower().Trim())
        {
            throw new UnauthorizedException("Você não tem permissão para atualizar este usuário");
        }

        usuario.Nome = request.Nome;
        
        // Se um novo email foi fornecido, verificar duplicatas
        if (!string.IsNullOrEmpty(request.Email) && request.Email.ToLower().Trim() != usuario.Email)
        {
            var emailExistente = await _usuarioRepository.GetByEmailAsync(request.Email.ToLower().Trim());
            if (emailExistente != null)
            {
                throw new BusinessException("Email já está em uso");
            }
            usuario.Email = request.Email.ToLower().Trim();
        }

        if (!string.IsNullOrEmpty(request.FotoPerfil))
        {
            usuario.FotoPerfil = request.FotoPerfil;
        }

        usuario.AtualizadoEm = DateTime.UtcNow;

        await _usuarioRepository.UpdateAsync(usuario);
        return _mapper.Map<UsuarioResponse>(usuario);
    }

    public async Task DesativarAsync(long id)
    {
        var usuario = await _usuarioRepository.GetByIdAsync(id);
        if (usuario == null)
        {
            throw new ResourceNotFoundException("Usuário não encontrado");
        }

        usuario.Ativo = false;
        usuario.AtualizadoEm = DateTime.UtcNow;
        await _usuarioRepository.UpdateAsync(usuario);
    }

    public async Task AlterarSenhaAsync(long id, AlterarSenhaRequest request)
    {
        var usuario = await _usuarioRepository.GetByIdAsync(id);
        if (usuario == null)
        {
            throw new ResourceNotFoundException("Usuário não encontrado");
        }

        if (!_passwordHashService.VerifyPassword(request.SenhaAtual, usuario.Senha))
        {
            throw new BusinessException("Senha atual inválida");
        }

        usuario.Senha = _passwordHashService.HashPassword(request.NovaSenha);
        usuario.AtualizadoEm = DateTime.UtcNow;
        await _usuarioRepository.UpdateAsync(usuario);
    }

    /// <summary>
    /// Obtém um usuário pelo email (retorna a entidade em vez de DTO)
    /// </summary>
    public async Task<Usuario?> ObterPorEmailAsync(string email)
    {
        return await _usuarioRepository.GetByEmailAsync(email.ToLower().Trim());
    }

    /// <summary>
    /// Gera um token de redefinição de senha para o usuário
    /// </summary>
    public async Task<string> GerarTokenRedefinicaoAsync(Usuario usuario)
    {
        try
        {
            // Remover token anterior se existir
            var tokenAnterior = await _tokenRepository.GetPorUsuarioAsync(usuario.Id);
            if (tokenAnterior != null)
            {
                await _tokenRepository.DeleteAsync(tokenAnterior.Id);
            }

            // Gerar novo token
            var token = Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(32));
            var tokenRedefinicao = new TokenRedefinicaoSenha
            {
                UsuarioId = usuario.Id,
                Token = token,
                DataExpiracao = DateTime.UtcNow.AddMinutes(30)
            };

            await _tokenRepository.AddAsync(tokenRedefinicao);
            _logger.LogInformation("Token de redefinição gerado para usuário: {UsuarioId}", usuario.Id);

            return token;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao gerar token de redefinição para usuário: {UsuarioId}", usuario.Id);
            throw;
        }
    }

    /// <summary>
    /// Redefinir a senha de um usuário usando um token válido
    /// </summary>
    public async Task<bool> RedefinirSenhaAsync(string token, string novaSenha)
    {
        try
        {
            // Validar entrada
            if (string.IsNullOrWhiteSpace(token) || string.IsNullOrWhiteSpace(novaSenha))
            {
                _logger.LogWarning("Tentativa de redefinição com dados inválidos");
                throw new BusinessException("Token e nova senha são obrigatórios");
            }

            // Buscar token no banco
            var tokenRedefinicao = await _tokenRepository.GetByTokenAsync(token);
            if (tokenRedefinicao == null)
            {
                _logger.LogWarning("Token de redefinição inválido: {Token}", token);
                throw new BusinessException("Token de redefinição inválido");
            }

            // Verificar se token expirou
            if (tokenRedefinicao.DataExpiracao < DateTime.UtcNow)
            {
                _logger.LogWarning("Token de redefinição expirado para usuário: {UsuarioId}", tokenRedefinicao.UsuarioId);
                throw new BusinessException("Token de redefinição expirou. Solicite um novo email de redefinição");
            }

            // Buscar usuário
            var usuario = await _usuarioRepository.GetByIdAsync(tokenRedefinicao.UsuarioId);
            if (usuario == null)
            {
                _logger.LogWarning("Usuário não encontrado para token: {Token}", token);
                throw new ResourceNotFoundException("Usuário não encontrado");
            }

            // Atualizar senha
            usuario.Senha = _passwordHashService.HashPassword(novaSenha);
            usuario.AtualizadoEm = DateTime.UtcNow;
            await _usuarioRepository.UpdateAsync(usuario);

            // Deletar token usado
            await _tokenRepository.DeleteAsync(tokenRedefinicao.Id);

            _logger.LogInformation("Senha redefinida com sucesso para usuário: {UsuarioId}", usuario.Id);
            return true;
        }
        catch (BusinessException ex)
        {
            _logger.LogWarning("Erro ao redefinir senha: {Message}", ex.Message);
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro inesperado ao redefinir senha");
            throw;
        }
    }
}
