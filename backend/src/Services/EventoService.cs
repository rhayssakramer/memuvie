namespace MemuVie.Evento.Services;

using AutoMapper;
using MemuVie.Evento.Data.Repositories;
using MemuVie.Evento.DTOs.Requests;
using MemuVie.Evento.DTOs.Responses;
using MemuVie.Evento.Exceptions;
using MemuVie.Evento.Models;

public interface IEventoService
{
    Task<EventoResponse> CriarEventoAsync(EventoRequest request, string emailUsuario);
    Task<IEnumerable<EventoResponse>> ListarTodosAsync();
    Task<IEnumerable<EventoResponse>> ListarEventosAtivosAsync();
    Task<IEnumerable<EventoResponse>> ListarEventosComVotacaoAbertaAsync();
    Task<IEnumerable<EventoResponse>> ListarEventosPorUsuarioAsync(string email);
    Task<EventoResponse> BuscarPorIdAsync(long id);
    Task<EventoResponse> AtualizarAsync(long id, EventoRequest request, string emailUsuario);
    Task DeletarAsync(long id, string emailUsuario);
    Task EncerrarVotacaoAsync(long id);
    Task RevelarAsync(long id, BabySex resultado);
}

public class EventoService : IEventoService
{
    private readonly IEventoRepository _eventoRepository;
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<EventoService> _logger;

    public EventoService(
        IEventoRepository eventoRepository,
        IUsuarioRepository usuarioRepository,
        IMapper mapper,
        ILogger<EventoService> logger)
    {
        _eventoRepository = eventoRepository;
        _usuarioRepository = usuarioRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<EventoResponse> CriarEventoAsync(EventoRequest request, string emailUsuario)
    {
        var usuario = await _usuarioRepository.GetByEmailAndAtivoAsync(emailUsuario.ToLower().Trim());
        if (usuario == null)
        {
            throw new ResourceNotFoundException("Usuário não encontrado");
        }

        var evento = new Evento
        {
            Titulo = request.Titulo,
            Descricao = request.Descricao,
            DataEvento = request.DataEvento,
            Local = request.Local,
            NomeMae = request.NomeMae,
            NomePai = request.NomePai,
            DataEncerramentoVotacao = request.DataEncerramentoVotacao,
            FotoCapa = request.FotoCapa,
            VideoDestaque = request.VideoDestaque,
            CorTema = request.CorTema,
            Status = EventStatus.Ativo,
            VotacaoEncerrada = false,
            Revelado = false,
            UsuarioId = usuario.Id,
            CriadoEm = DateTime.UtcNow
        };

        var eventoSalvo = await _eventoRepository.AddAsync(evento);
        eventoSalvo.Usuario = usuario;
        
        return _mapper.Map<EventoResponse>(eventoSalvo);
    }

    public async Task<IEnumerable<EventoResponse>> ListarTodosAsync()
    {
        var eventos = await _eventoRepository.GetAllAsync();
        return eventos.Select(e => _mapper.Map<EventoResponse>(e));
    }

    public async Task<IEnumerable<EventoResponse>> ListarEventosAtivosAsync()
    {
        var eventos = await _eventoRepository.GetEventosAtivoAsync();
        return eventos.Select(e => _mapper.Map<EventoResponse>(e));
    }

    public async Task<IEnumerable<EventoResponse>> ListarEventosComVotacaoAbertaAsync()
    {
        var eventos = await _eventoRepository.GetEventosComVotacaoAbertaAsync();
        return eventos.Select(e => _mapper.Map<EventoResponse>(e));
    }

    public async Task<IEnumerable<EventoResponse>> ListarEventosPorUsuarioAsync(string email)
    {
        var usuario = await _usuarioRepository.GetByEmailAndAtivoAsync(email.ToLower().Trim());
        if (usuario == null)
        {
            throw new ResourceNotFoundException("Usuário não encontrado");
        }

        var eventos = await _eventoRepository.GetEventosPorUsuarioAsync(usuario.Id);
        return eventos.Select(e => _mapper.Map<EventoResponse>(e));
    }

    public async Task<EventoResponse> BuscarPorIdAsync(long id)
    {
        var evento = await _eventoRepository.GetByIdAsync(id);
        if (evento == null)
        {
            throw new ResourceNotFoundException("Evento não encontrado");
        }
        return _mapper.Map<EventoResponse>(evento);
    }

    public async Task<EventoResponse> AtualizarAsync(long id, EventoRequest request, string emailUsuario)
    {
        var evento = await _eventoRepository.GetByIdAsync(id);
        if (evento == null)
        {
            throw new ResourceNotFoundException("Evento não encontrado");
        }

        var usuario = await _usuarioRepository.GetByEmailAndAtivoAsync(emailUsuario.ToLower().Trim());
        if (usuario == null || evento.UsuarioId != usuario.Id)
        {
            throw new UnauthorizedException("Você não tem permissão para atualizar este evento");
        }

        evento.Titulo = request.Titulo;
        evento.Descricao = request.Descricao;
        evento.DataEvento = request.DataEvento;
        evento.Local = request.Local;
        evento.NomeMae = request.NomeMae;
        evento.NomePai = request.NomePai;
        evento.DataEncerramentoVotacao = request.DataEncerramentoVotacao;
        evento.FotoCapa = request.FotoCapa;
        evento.VideoDestaque = request.VideoDestaque;
        evento.CorTema = request.CorTema;
        evento.AtualizadoEm = DateTime.UtcNow;

        await _eventoRepository.UpdateAsync(evento);
        return _mapper.Map<EventoResponse>(evento);
    }

    public async Task DeletarAsync(long id, string emailUsuario)
    {
        var evento = await _eventoRepository.GetByIdAsync(id);
        if (evento == null)
        {
            throw new ResourceNotFoundException("Evento não encontrado");
        }

        var usuario = await _usuarioRepository.GetByEmailAndAtivoAsync(emailUsuario.ToLower().Trim());
        if (usuario == null || evento.UsuarioId != usuario.Id)
        {
            throw new UnauthorizedException("Você não tem permissão para deletar este evento");
        }

        await _eventoRepository.DeleteAsync(id);
    }

    public async Task EncerrarVotacaoAsync(long id)
    {
        var evento = await _eventoRepository.GetByIdAsync(id);
        if (evento == null)
        {
            throw new ResourceNotFoundException("Evento não encontrado");
        }

        evento.VotacaoEncerrada = true;
        evento.DataEncerramentoVotacao = DateTime.UtcNow;
        evento.AtualizadoEm = DateTime.UtcNow;

        await _eventoRepository.UpdateAsync(evento);
    }

    public async Task RevelarAsync(long id, BabySex resultado)
    {
        var evento = await _eventoRepository.GetByIdAsync(id);
        if (evento == null)
        {
            throw new ResourceNotFoundException("Evento não encontrado");
        }

        evento.Revelado = true;
        evento.ResultadoRevelacao = resultado;
        evento.Status = EventStatus.Finalizado;
        evento.AtualizadoEm = DateTime.UtcNow;

        await _eventoRepository.UpdateAsync(evento);
    }
}
