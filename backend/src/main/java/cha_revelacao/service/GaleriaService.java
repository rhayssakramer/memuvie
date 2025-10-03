package cha_revelacao.service;

import cha_revelacao.dto.request.GaleriaPostRequest;
import cha_revelacao.dto.response.GaleriaPostResponse;
import cha_revelacao.dto.response.UsuarioResponse;
import cha_revelacao.dto.response.EventoResponse;
import cha_revelacao.exception.BusinessException;
import cha_revelacao.model.Evento;
import cha_revelacao.model.GaleriaPost;
import cha_revelacao.model.Usuario;
import cha_revelacao.repository.EventoRepository;
import cha_revelacao.repository.GaleriaPostRepository;
import cha_revelacao.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GaleriaService {

    private final GaleriaPostRepository galeriaPostRepository;
    private final EventoRepository eventoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ModelMapper modelMapper;

    @Transactional
    public GaleriaPostResponse criarPost(GaleriaPostRequest request, String email) {
        Usuario usuario = usuarioRepository.findByEmailAndAtivo(email)
                .orElseThrow(() -> new BusinessException("Usuário não encontrado"));

        Evento evento = eventoRepository.findById(request.getEventoId())
                .orElseThrow(() -> new BusinessException("Evento não encontrado"));

        GaleriaPost galeriaPost = new GaleriaPost();
        galeriaPost.setMensagem(request.getMensagem());
        galeriaPost.setUrlFoto(request.getUrlFoto());
        galeriaPost.setUrlVideo(request.getUrlVideo());
        galeriaPost.setUsuario(usuario);
        galeriaPost.setEvento(evento);

                GaleriaPost postSalvo = galeriaPostRepository.save(galeriaPost);
                return toResponse(postSalvo);
    }

    @Transactional(readOnly = true)
    public List<GaleriaPostResponse> listarPostsDoEvento(Long eventoId) {
        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new BusinessException("Evento não encontrado"));

        return galeriaPostRepository.findByEventoOrderByDataCriacaoDesc(evento).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<GaleriaPostResponse> listarPostsDoUsuario(String email) {
        Usuario usuario = usuarioRepository.findByEmailAndAtivo(email)
                .orElseThrow(() -> new BusinessException("Usuário não encontrado"));

        return galeriaPostRepository.findByUsuarioOrderByDataCriacaoDesc(usuario).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<GaleriaPostResponse> listarTodosPosts() {
        return galeriaPostRepository.findAllByOrderByDataCriacaoDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GaleriaPostResponse buscarPostPorId(Long id) {
        GaleriaPost post = galeriaPostRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Post não encontrado"));
        return toResponse(post);
    }

    @Transactional
    public void deletarPost(Long id, String email) {
        GaleriaPost post = galeriaPostRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Post não encontrado"));
        
        Usuario usuario = usuarioRepository.findByEmailAndAtivo(email)
                .orElseThrow(() -> new BusinessException("Usuário não encontrado"));
        
        // Verificar se é o proprietário do post ou um administrador
        if (!post.getUsuario().getId().equals(usuario.getId()) && 
            usuario.getTipo() != Usuario.TipoUsuario.ADMIN) {
            throw new BusinessException("Você não tem permissão para excluir este post");
        }
        
        galeriaPostRepository.delete(post);
    }

        private GaleriaPostResponse toResponse(GaleriaPost post) {
                GaleriaPostResponse resp = new GaleriaPostResponse();
                resp.setId(post.getId());
                resp.setMensagem(post.getMensagem());
                resp.setUrlFoto(post.getUrlFoto());
                resp.setUrlVideo(post.getUrlVideo());
                resp.setDataCriacao(post.getDataCriacao());

                if (post.getUsuario() != null) {
                        UsuarioResponse ur = new UsuarioResponse();
                        ur.setId(post.getUsuario().getId());
                        ur.setNome(post.getUsuario().getNome());
                        ur.setEmail(post.getUsuario().getEmail());
                        ur.setFotoPerfil(post.getUsuario().getFotoPerfil());
                        ur.setTipo(post.getUsuario().getTipo());
                        ur.setAtivo(post.getUsuario().getAtivo());
                        ur.setCriadoEm(post.getUsuario().getCriadoEm());
                        resp.setUsuario(ur);
                }

                if (post.getEvento() != null) {
                        EventoResponse er = new EventoResponse();
                        er.setId(post.getEvento().getId());
                        er.setTitulo(post.getEvento().getTitulo());
                        er.setDescricao(post.getEvento().getDescricao());
                        er.setDataEvento(post.getEvento().getDataEvento());
                        er.setLocal(post.getEvento().getLocal());
                        er.setNomeMae(post.getEvento().getNomeMae());
                        er.setNomePai(post.getEvento().getNomePai());
                        er.setRevelado(post.getEvento().getRevelado());
                        er.setResultadoRevelacao(post.getEvento().getResultadoRevelacao());
                        er.setStatus(post.getEvento().getStatus());
                        er.setVotacaoEncerrada(post.getEvento().getVotacaoEncerrada());
                        er.setDataEncerramentoVotacao(post.getEvento().getDataEncerramentoVotacao());
                        er.setCriadoEm(post.getEvento().getCriadoEm());
                        resp.setEvento(er);
                }

                return resp;
        }
}