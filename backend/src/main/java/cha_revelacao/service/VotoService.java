package cha_revelacao.service;

import cha_revelacao.dto.request.VotoRequest;
import cha_revelacao.dto.response.EventoSummaryResponse;
import cha_revelacao.dto.response.UsuarioResponse;
import cha_revelacao.dto.response.VotoResponse;
import cha_revelacao.exception.BusinessException;
import cha_revelacao.model.Evento;
import cha_revelacao.model.Usuario;
import cha_revelacao.model.Voto;
import cha_revelacao.repository.EventoRepository;
import cha_revelacao.repository.UsuarioRepository;
import cha_revelacao.repository.VotoRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VotoService {

    private final VotoRepository votoRepository;
    private final EventoRepository eventoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ModelMapper modelMapper;

    private static final String USUARIO_NAO_ENCONTRADO = "Usuário não encontrado";
    private static final String EVENTO_NAO_ENCONTRADO = "Evento não encontrado";
    private static final String VOTO_NAO_ENCONTRADO = "Voto não encontrado";
    private static final Logger log = LoggerFactory.getLogger(VotoService.class);

    public VotoService(VotoRepository votoRepository,
                       EventoRepository eventoRepository,
                       UsuarioRepository usuarioRepository,
                       ModelMapper modelMapper) {
        this.votoRepository = votoRepository;
        this.eventoRepository = eventoRepository;
        this.usuarioRepository = usuarioRepository;
        this.modelMapper = modelMapper;
    }

    public VotoResponse votar(VotoRequest request, String emailUsuario) {
        Usuario convidado = usuarioRepository.findByEmailAndAtivo(emailUsuario)
            .orElseThrow(() -> new BusinessException(USUARIO_NAO_ENCONTRADO));

        Evento evento = eventoRepository.findById(request.getEventoId())
            .orElseThrow(() -> new BusinessException(EVENTO_NAO_ENCONTRADO));

        if (Boolean.TRUE.equals(evento.getVotacaoEncerrada())) {
            throw new BusinessException("A votação para este evento já foi encerrada");
        }
        if (evento.getStatus() != Evento.StatusEvento.ATIVO) {
            throw new BusinessException("Evento não está ativo");
        }
        if (votoRepository.existsByEventoIdAndConvidadoId(evento.getId(), convidado.getId())) {
            throw new BusinessException("Usuário já votou neste evento");
        }

        Voto voto = new Voto();
        voto.setEvento(evento);
        voto.setConvidado(convidado);
        voto.setPalpite(request.getPalpite());
        voto.setJustificativa(request.getJustificativa());

        Voto votoSalvo = votoRepository.save(voto);
        return converterParaResponse(votoSalvo);
    }

    public VotoResponse atualizarVoto(Long id, VotoRequest request, String emailUsuario) {
        Voto voto = votoRepository.findById(id)
            .orElseThrow(() -> new BusinessException(VOTO_NAO_ENCONTRADO));

        Usuario usuario = usuarioRepository.findByEmailAndAtivo(emailUsuario)
            .orElseThrow(() -> new BusinessException(USUARIO_NAO_ENCONTRADO));

        if (!voto.getConvidado().getId().equals(usuario.getId())) {
            throw new BusinessException("Usuário não tem permissão para editar este voto");
        }
        if (Boolean.TRUE.equals(voto.getEvento().getVotacaoEncerrada())) {
            throw new BusinessException("A votação para este evento já foi encerrada");
        }

        voto.setPalpite(request.getPalpite());
        voto.setJustificativa(request.getJustificativa());

        Voto votoAtualizado = votoRepository.save(voto);
        return converterParaResponse(votoAtualizado);
    }

    public VotoResponse buscarPorId(Long id) {
        Voto voto = votoRepository.findById(id)
            .orElseThrow(() -> new BusinessException(VOTO_NAO_ENCONTRADO));
        return converterParaResponse(voto);
    }

    public List<VotoResponse> listarVotosPorEvento(Long eventoId) {
        return votoRepository.findByEventoIdOrderByCriadoEmDesc(eventoId).stream()
            .map(this::converterParaResponse)
            .collect(Collectors.toList());
    }

    public List<VotoResponse> listarVotosDoUsuario(String emailUsuario) {
        Usuario usuario = usuarioRepository.findByEmailAndAtivo(emailUsuario)
            .orElseThrow(() -> new BusinessException(USUARIO_NAO_ENCONTRADO));
        try {
            List<Voto> votos = votoRepository.findByConvidadoIdOrderByCriadoEmDesc(usuario.getId());
            log.info("Listando votos do usuário: {} - total: {}", usuario.getEmail(), votos.size());
            List<VotoResponse> responses = votos.stream()
                .map(voto -> {
                    try {
                        return converterParaResponse(voto);
                    } catch (Exception ex) {
                        log.error("Erro ao mapear voto id {}: {}", voto.getId(), ex.getMessage(), ex);
                        throw new RuntimeException("Erro ao mapear voto id " + voto.getId() + ": " + ex.getMessage(), ex);
                    }
                })
                .collect(Collectors.toList());
            return responses;
        } catch (Exception ex) {
            log.error("Erro ao listar votos do usuário {}: {}", usuario.getEmail(), ex.getMessage(), ex);
            throw new RuntimeException("Erro ao listar votos do usuário: " + ex.getMessage(), ex);
        }
    }

    public VotoResponse buscarVotoDoUsuarioNoEvento(Long eventoId, String emailUsuario) {
        Usuario usuario = usuarioRepository.findByEmailAndAtivo(emailUsuario)
            .orElseThrow(() -> new BusinessException(USUARIO_NAO_ENCONTRADO));

        Voto voto = votoRepository.findByEventoIdAndConvidadoId(eventoId, usuario.getId())
            .orElseThrow(() -> new BusinessException(VOTO_NAO_ENCONTRADO));

        return converterParaResponse(voto);
    }

    public void deletarVoto(Long id, String emailUsuario) {
        Voto voto = votoRepository.findById(id)
            .orElseThrow(() -> new BusinessException(VOTO_NAO_ENCONTRADO));

        Usuario usuario = usuarioRepository.findByEmailAndAtivo(emailUsuario)
            .orElseThrow(() -> new BusinessException(USUARIO_NAO_ENCONTRADO));

        if (!voto.getConvidado().getId().equals(usuario.getId())) {
            throw new BusinessException("Usuário não tem permissão para deletar este voto");
        }
        if (Boolean.TRUE.equals(voto.getEvento().getVotacaoEncerrada())) {
            throw new BusinessException("A votação para este evento já foi encerrada");
        }

        votoRepository.delete(voto);
    }

    private VotoResponse converterParaResponse(Voto voto) {
        VotoResponse response = modelMapper.map(voto, VotoResponse.class);
        response.setConvidado(modelMapper.map(voto.getConvidado(), UsuarioResponse.class));

        EventoSummaryResponse eventoSummary = new EventoSummaryResponse();
        eventoSummary.setId(voto.getEvento().getId());
        eventoSummary.setTitulo(voto.getEvento().getTitulo());
        eventoSummary.setNomeMae(voto.getEvento().getNomeMae());
        eventoSummary.setNomePai(voto.getEvento().getNomePai());
        response.setEvento(eventoSummary);
        return response;
    }
}
