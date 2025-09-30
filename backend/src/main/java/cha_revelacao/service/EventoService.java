package cha_revelacao.service;

import cha_revelacao.dto.request.EventoRequest;
import cha_revelacao.dto.response.EventoResponse;
import cha_revelacao.dto.response.UsuarioResponse;
import cha_revelacao.exception.BusinessException;
import cha_revelacao.model.Evento;
import cha_revelacao.model.Usuario;
import cha_revelacao.repository.EventoRepository;
import cha_revelacao.repository.UsuarioRepository;
import cha_revelacao.repository.VotoRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventoService {

    private final EventoRepository eventoRepository;
    private final UsuarioRepository usuarioRepository;
    private final VotoRepository votoRepository;
    private final ModelMapper modelMapper;

    private static final String USUARIO_NAO_ENCONTRADO = "Usuário não encontrado";
    private static final String EVENTO_NAO_ENCONTRADO = "Evento não encontrado";

    public EventoService(EventoRepository eventoRepository,
                         UsuarioRepository usuarioRepository,
                         VotoRepository votoRepository,
                         ModelMapper modelMapper) {
        this.eventoRepository = eventoRepository;
        this.usuarioRepository = usuarioRepository;
        this.votoRepository = votoRepository;
        this.modelMapper = modelMapper;
    }

    public EventoResponse criarEvento(EventoRequest request, String emailUsuario) {
        Usuario usuario = usuarioRepository.findByEmailAndAtivo(emailUsuario)
            .orElseThrow(() -> new BusinessException(USUARIO_NAO_ENCONTRADO));

        Evento evento = new Evento();
        evento.setTitulo(request.getTitulo());
        evento.setDescricao(request.getDescricao());
        evento.setDataEvento(request.getDataEvento());
        evento.setLocal(request.getLocal());
        evento.setNomeMae(request.getNomeMae());
        evento.setNomePai(request.getNomePai());
        evento.setDataEncerramentoVotacao(request.getDataEncerramentoVotacao());
        evento.setFotoCapa(request.getFotoCapa());
        evento.setVideoDestaque(request.getVideoDestaque());
        evento.setCorTema(request.getCorTema());
        
        // Definir o tipo de evento, padrão para CHÁ_REVELAÇÃO se não for informado
        if (request.getTipoEvento() != null) {
            evento.setTipoEvento(request.getTipoEvento());
        } else {
            evento.setTipoEvento(Evento.TipoEvento.CHA_REVELACAO);
        }
        
        evento.setUsuario(usuario);
        evento.setStatus(Evento.StatusEvento.ATIVO);
        evento.setRevelado(false);
        evento.setVotacaoEncerrada(false);

        Evento eventoSalvo = eventoRepository.save(evento);
        return converterParaResponse(eventoSalvo);
    }

    public EventoResponse buscarPorId(Long id) {
        Evento evento = eventoRepository.findById(id)
            .orElseThrow(() -> new BusinessException(EVENTO_NAO_ENCONTRADO));
        return converterParaResponse(evento);
    }

    public List<EventoResponse> listarTodos() {
        return eventoRepository.findAll().stream()
            .map(this::converterParaResponse)
            .toList();
    }

    public List<EventoResponse> listarEventosAtivos() {
        return eventoRepository.findByStatusOrderByDataEventoDesc(Evento.StatusEvento.ATIVO).stream()
            .map(this::converterParaResponse)
            .toList();
    }

    public List<EventoResponse> listarEventosComVotacaoAberta() {
        return eventoRepository.findEventosComVotacaoAberta().stream()
            .map(this::converterParaResponse)
            .toList();
    }

    public List<EventoResponse> listarEventosDoUsuario(String emailUsuario) {
        Usuario usuario = usuarioRepository.findByEmailAndAtivo(emailUsuario)
            .orElseThrow(() -> new BusinessException(USUARIO_NAO_ENCONTRADO));

        return eventoRepository.findByUsuarioIdOrderByDataEventoDesc(usuario.getId()).stream()
            .map(this::converterParaResponse)
            .toList();
    }

    public EventoResponse atualizarEvento(Long id, EventoRequest request, String emailUsuario) {
        Evento evento = eventoRepository.findById(id)
            .orElseThrow(() -> new BusinessException(EVENTO_NAO_ENCONTRADO));

        Usuario usuario = usuarioRepository.findByEmailAndAtivo(emailUsuario)
            .orElseThrow(() -> new BusinessException(USUARIO_NAO_ENCONTRADO));

        if (!evento.getUsuario().getId().equals(usuario.getId())) {
            throw new BusinessException("Usuário não tem permissão para editar este evento");
        }

        evento.setTitulo(request.getTitulo());
        evento.setDescricao(request.getDescricao());
        evento.setDataEvento(request.getDataEvento());
        evento.setLocal(request.getLocal());
        evento.setNomeMae(request.getNomeMae());
        evento.setNomePai(request.getNomePai());
        evento.setDataEncerramentoVotacao(request.getDataEncerramentoVotacao());

        Evento eventoAtualizado = eventoRepository.save(evento);
        return converterParaResponse(eventoAtualizado);
    }

    public EventoResponse revelarResultado(Long id, Evento.SexoBebe resultado, String emailUsuario) {
        Evento evento = eventoRepository.findById(id)
            .orElseThrow(() -> new BusinessException(EVENTO_NAO_ENCONTRADO));

        Usuario usuario = usuarioRepository.findByEmailAndAtivo(emailUsuario)
            .orElseThrow(() -> new BusinessException(USUARIO_NAO_ENCONTRADO));

        if (!evento.getUsuario().getId().equals(usuario.getId())) {
            throw new BusinessException("Usuário não tem permissão para revelar este evento");
        }

        evento.setResultadoRevelacao(resultado);
        evento.setRevelado(true);
        evento.setVotacaoEncerrada(true);

        Evento eventoAtualizado = eventoRepository.save(evento);
        return converterParaResponse(eventoAtualizado);
    }

    public EventoResponse encerrarVotacao(Long id, String emailUsuario) {
        Evento evento = eventoRepository.findById(id)
            .orElseThrow(() -> new BusinessException(EVENTO_NAO_ENCONTRADO));

        Usuario usuario = usuarioRepository.findByEmailAndAtivo(emailUsuario)
            .orElseThrow(() -> new BusinessException(USUARIO_NAO_ENCONTRADO));

        if (!evento.getUsuario().getId().equals(usuario.getId())) {
            throw new BusinessException("Usuário não tem permissão para encerrar a votação deste evento");
        }

        evento.setVotacaoEncerrada(true);
        Evento eventoAtualizado = eventoRepository.save(evento);
        return converterParaResponse(eventoAtualizado);
    }

    public void deletarEvento(Long id, String emailUsuario) {
        Evento evento = eventoRepository.findById(id)
            .orElseThrow(() -> new BusinessException(EVENTO_NAO_ENCONTRADO));

        Usuario usuario = usuarioRepository.findByEmailAndAtivo(emailUsuario)
            .orElseThrow(() -> new BusinessException(USUARIO_NAO_ENCONTRADO));

        if (!evento.getUsuario().getId().equals(usuario.getId())) {
            throw new BusinessException("Usuário não tem permissão para deletar este evento");
        }

        eventoRepository.delete(evento);
    }

    private EventoResponse converterParaResponse(Evento evento) {
        EventoResponse response = modelMapper.map(evento, EventoResponse.class);
        response.setOrganizador(modelMapper.map(evento.getUsuario(), UsuarioResponse.class));

        // Contar votos
        Long totalVotosMenino = votoRepository.countVotosByEventoAndPalpite(evento.getId(), Evento.SexoBebe.MENINO);
        Long totalVotosMenina = votoRepository.countVotosByEventoAndPalpite(evento.getId(), Evento.SexoBebe.MENINA);
        Long totalVotos = votoRepository.countVotosByEvento(evento.getId());

        response.setTotalVotosMenino(totalVotosMenino.intValue());
        response.setTotalVotosMenina(totalVotosMenina.intValue());
        response.setTotalVotos(totalVotos.intValue());

        return response;
    }
}
