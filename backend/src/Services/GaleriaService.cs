namespace MemuVie.Evento.Services;

using AutoMapper;
using MemuVie.Evento.Data.Repositories;
using MemuVie.Evento.DTOs.Requests;
using MemuVie.Evento.DTOs.Responses;
using MemuVie.Evento.Exceptions;
using MemuVie.Evento.Models;

public interface IGaleriaService
{
    Task<GaleriaPostResponse> CriarPostAsync(GaleriaPostRequest request, string emailUsuario);
    Task<IEnumerable<GaleriaPostResponse>> ListarPostsPorEventoAsync(long eventoId);
    Task<IEnumerable<GaleriaPostResponse>> ListarPostsPorUsuarioAsync(string email);
    Task<IEnumerable<GaleriaPostResponse>> ListarTodosPostsAsync();
    Task<GaleriaPostResponse> BuscarPostPorIdAsync(long id);
    Task<GaleriaPostResponse> AtualizarPostAsync(long id, GaleriaPostRequest request, string emailUsuario);
    Task DeletarPostAsync(long id, string emailUsuario);
}

public class GaleriaService : IGaleriaService
{
    private readonly IGaleriaPostRepository _galeriaPostRepository;
    private readonly IEventoRepository _eventoRepository;
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<GaleriaService> _logger;

    public GaleriaService(
        IGaleriaPostRepository galeriaPostRepository,
        IEventoRepository eventoRepository,
        IUsuarioRepository usuarioRepository,
        IMapper mapper,
        ILogger<GaleriaService> logger)
    {
        _galeriaPostRepository = galeriaPostRepository;
        _eventoRepository = eventoRepository;
        _usuarioRepository = usuarioRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<GaleriaPostResponse> CriarPostAsync(GaleriaPostRequest request, string emailUsuario)
    {
        var usuario = await _usuarioRepository.GetByEmailAndAtivoAsync(emailUsuario.ToLower().Trim());
        if (usuario == null)
        {
            throw new ResourceNotFoundException("Usuário não encontrado");
        }

        var evento = await _eventoRepository.GetByIdAsync(request.EventoId);
        if (evento == null)
        {
            throw new ResourceNotFoundException("Evento não encontrado");
        }

        var post = new GaleriaPost
        {
            Mensagem = request.Mensagem,
            UrlFoto = request.UrlFoto,
            UrlVideo = request.UrlVideo,
            UsuarioId = usuario.Id,
            EventoId = request.EventoId,
            DataCriacao = DateTime.UtcNow
        };

        var postSalvo = await _galeriaPostRepository.AddAsync(post);
        postSalvo.Usuario = usuario;
        postSalvo.Evento = evento;

        return _mapper.Map<GaleriaPostResponse>(postSalvo);
    }

    public async Task<IEnumerable<GaleriaPostResponse>> ListarPostsPorEventoAsync(long eventoId)
    {
        var posts = await _galeriaPostRepository.GetPostsPorEventoAsync(eventoId);
        return posts.Select(p => _mapper.Map<GaleriaPostResponse>(p));
    }

    public async Task<IEnumerable<GaleriaPostResponse>> ListarPostsPorUsuarioAsync(string email)
    {
        var usuario = await _usuarioRepository.GetByEmailAndAtivoAsync(email.ToLower().Trim());
        if (usuario == null)
        {
            throw new ResourceNotFoundException("Usuário não encontrado");
        }

        var posts = await _galeriaPostRepository.GetPostsPorUsuarioAsync(usuario.Id);
        return posts.Select(p => _mapper.Map<GaleriaPostResponse>(p));
    }

    public async Task<IEnumerable<GaleriaPostResponse>> ListarTodosPostsAsync()
    {
        var posts = await _galeriaPostRepository.GetAllAsync();
        return posts.Select(p => _mapper.Map<GaleriaPostResponse>(p));
    }

    public async Task<GaleriaPostResponse> BuscarPostPorIdAsync(long id)
    {
        var post = await _galeriaPostRepository.GetByIdAsync(id);
        if (post == null)
        {
            throw new ResourceNotFoundException("Post não encontrado");
        }
        return _mapper.Map<GaleriaPostResponse>(post);
    }

    public async Task<GaleriaPostResponse> AtualizarPostAsync(long id, GaleriaPostRequest request, string emailUsuario)
    {
        var post = await _galeriaPostRepository.GetByIdAsync(id);
        if (post == null)
        {
            throw new ResourceNotFoundException("Post não encontrado");
        }

        var usuario = await _usuarioRepository.GetByEmailAndAtivoAsync(emailUsuario.ToLower().Trim());
        if (usuario == null || post.UsuarioId != usuario.Id)
        {
            throw new UnauthorizedException("Você não tem permissão para atualizar este post");
        }

        post.Mensagem = request.Mensagem;
        post.UrlFoto = request.UrlFoto;
        post.UrlVideo = request.UrlVideo;

        await _galeriaPostRepository.UpdateAsync(post);
        return _mapper.Map<GaleriaPostResponse>(post);
    }

    public async Task DeletarPostAsync(long id, string emailUsuario)
    {
        var post = await _galeriaPostRepository.GetByIdAsync(id);
        if (post == null)
        {
            throw new ResourceNotFoundException("Post não encontrado");
        }

        var usuario = await _usuarioRepository.GetByEmailAndAtivoAsync(emailUsuario.ToLower().Trim());
        if (usuario == null || post.UsuarioId != usuario.Id)
        {
            throw new UnauthorizedException("Você não tem permissão para deletar este post");
        }

        await _galeriaPostRepository.DeleteAsync(id);
    }
}
