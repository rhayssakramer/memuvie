namespace MemuVie.Evento.Services;

using AutoMapper;
using MemuVie.Evento.Data.Repositories;
using MemuVie.Evento.DTOs.Requests;
using MemuVie.Evento.DTOs.Responses;
using MemuVie.Evento.Exceptions;
using MemuVie.Evento.Models;

public interface IVotoService
{
    Task<VotoResponse> VotarAsync(VotoRequest request, string emailUsuario);
    Task<IEnumerable<VotoResponse>> ListarVotosPorUsuarioAsync(string email);
    Task<IEnumerable<VotoResponse>> ListarVotosPorEventoAsync(long eventoId);
    Task<VotoResponse> BuscarPorIdAsync(long id);
    Task<VotoResponse?> BuscarVotoDoUsuarioNoEventoAsync(long eventoId, string email);
    Task<VotoResponse> AtualizarAsync(long id, VotoRequest request, string emailUsuario);
    Task DeletarAsync(long id, string emailUsuario);
}

public class VotoService : IVotoService
{
    private readonly IVotoRepository _votoRepository;
    private readonly IEventoRepository _eventoRepository;
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<VotoService> _logger;

    public VotoService(
        IVotoRepository votoRepository,
        IEventoRepository eventoRepository,
        IUsuarioRepository usuarioRepository,
        IMapper mapper,
        ILogger<VotoService> logger)
    {
        _votoRepository = votoRepository;
        _eventoRepository = eventoRepository;
        _usuarioRepository = usuarioRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<VotoResponse> VotarAsync(VotoRequest request, string emailUsuario)
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

        // Verificar se o usuário já votou
        var votoExistente = await _votoRepository.GetVotoByEventoAndUsuarioAsync(request.EventoId, usuario.Id);
        if (votoExistente != null)
        {
            throw new BusinessException("Você já votou neste evento");
        }

        // Verificar se a votação está encerrada
        if (evento.VotacaoEncerrada)
        {
            throw new BusinessException("A votação para este evento foi encerrada");
        }

        var voto = new Voto
        {
            EventoId = request.EventoId,
            ConvidadoId = usuario.Id,
            Palpite = request.Palpite,
            Justificativa = request.Justificativa,
            CriadoEm = DateTime.UtcNow
        };

        var votoSalvo = await _votoRepository.AddAsync(voto);
        votoSalvo.Evento = evento;
        votoSalvo.Convidado = usuario;

        return _mapper.Map<VotoResponse>(votoSalvo);
    }

    public async Task<IEnumerable<VotoResponse>> ListarVotosPorUsuarioAsync(string email)
    {
        var usuario = await _usuarioRepository.GetByEmailAndAtivoAsync(email.ToLower().Trim());
        if (usuario == null)
        {
            throw new ResourceNotFoundException("Usuário não encontrado");
        }

        var votos = await _votoRepository.GetVotosPorUsuarioAsync(usuario.Id);
        return votos.Select(v => _mapper.Map<VotoResponse>(v));
    }

    public async Task<IEnumerable<VotoResponse>> ListarVotosPorEventoAsync(long eventoId)
    {
        var votos = await _votoRepository.GetVotosPorEventoAsync(eventoId);
        return votos.Select(v => _mapper.Map<VotoResponse>(v));
    }

    public async Task<VotoResponse> BuscarPorIdAsync(long id)
    {
        var voto = await _votoRepository.GetByIdAsync(id);
        if (voto == null)
        {
            throw new ResourceNotFoundException("Voto não encontrado");
        }
        return _mapper.Map<VotoResponse>(voto);
    }

    public async Task<VotoResponse?> BuscarVotoDoUsuarioNoEventoAsync(long eventoId, string email)
    {
        var usuario = await _usuarioRepository.GetByEmailAndAtivoAsync(email.ToLower().Trim());
        if (usuario == null)
        {
            return null;
        }

        var voto = await _votoRepository.GetVotoByEventoAndUsuarioAsync(eventoId, usuario.Id);
        return voto == null ? null : _mapper.Map<VotoResponse>(voto);
    }

    public async Task<VotoResponse> AtualizarAsync(long id, VotoRequest request, string emailUsuario)
    {
        var voto = await _votoRepository.GetByIdAsync(id);
        if (voto == null)
        {
            throw new ResourceNotFoundException("Voto não encontrado");
        }

        var usuario = await _usuarioRepository.GetByEmailAndAtivoAsync(emailUsuario.ToLower().Trim());
        if (usuario == null || voto.ConvidadoId != usuario.Id)
        {
            throw new UnauthorizedException("Você não tem permissão para atualizar este voto");
        }

        voto.Palpite = request.Palpite;
        voto.Justificativa = request.Justificativa;

        await _votoRepository.UpdateAsync(voto);
        return _mapper.Map<VotoResponse>(voto);
    }

    public async Task DeletarAsync(long id, string emailUsuario)
    {
        var voto = await _votoRepository.GetByIdAsync(id);
        if (voto == null)
        {
            throw new ResourceNotFoundException("Voto não encontrado");
        }

        var usuario = await _usuarioRepository.GetByEmailAndAtivoAsync(emailUsuario.ToLower().Trim());
        if (usuario == null || voto.ConvidadoId != usuario.Id)
        {
            throw new UnauthorizedException("Você não tem permissão para deletar este voto");
        }

        await _votoRepository.DeleteAsync(id);
    }
}
