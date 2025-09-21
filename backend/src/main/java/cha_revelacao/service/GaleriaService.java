package cha_revelacao.service;

import cha_revelacao.dto.request.GaleriaPostRequest;
import cha_revelacao.dto.response.GaleriaPostResponse;
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
        return modelMapper.map(postSalvo, GaleriaPostResponse.class);
    }

    public List<GaleriaPostResponse> listarPostsDoEvento(Long eventoId) {
        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new BusinessException("Evento não encontrado"));

        return galeriaPostRepository.findByEventoOrderByDataCriacaoDesc(evento).stream()
                .map(post -> modelMapper.map(post, GaleriaPostResponse.class))
                .collect(Collectors.toList());
    }

    public List<GaleriaPostResponse> listarPostsDoUsuario(String email) {
        Usuario usuario = usuarioRepository.findByEmailAndAtivo(email)
                .orElseThrow(() -> new BusinessException("Usuário não encontrado"));

        return galeriaPostRepository.findByUsuarioOrderByDataCriacaoDesc(usuario).stream()
                .map(post -> modelMapper.map(post, GaleriaPostResponse.class))
                .collect(Collectors.toList());
    }

    public List<GaleriaPostResponse> listarTodosPosts() {
        return galeriaPostRepository.findAllByOrderByDataCriacaoDesc().stream()
                .map(post -> modelMapper.map(post, GaleriaPostResponse.class))
                .collect(Collectors.toList());
    }

    public GaleriaPostResponse buscarPostPorId(Long id) {
        GaleriaPost post = galeriaPostRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Post não encontrado"));
        return modelMapper.map(post, GaleriaPostResponse.class);
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
}