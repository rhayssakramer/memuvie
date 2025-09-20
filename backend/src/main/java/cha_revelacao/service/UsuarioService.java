package cha_revelacao.service;

import cha_revelacao.dto.request.LoginRequest;
import cha_revelacao.dto.request.UsuarioRequest;
import cha_revelacao.dto.response.JwtResponse;
import cha_revelacao.dto.response.UsuarioResponse;
import cha_revelacao.exception.BusinessException;
import cha_revelacao.model.Usuario;
import cha_revelacao.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final ModelMapper modelMapper;

    public UsuarioResponse criarUsuario(UsuarioRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email já está em uso");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(request.getNome());
        usuario.setEmail(request.getEmail());
        usuario.setSenha(passwordEncoder.encode(request.getSenha()));
        usuario.setTipo(Usuario.TipoUsuario.CONVIDADO);
        usuario.setAtivo(true);

        Usuario usuarioSalvo = usuarioRepository.save(usuario);
        return modelMapper.map(usuarioSalvo, UsuarioResponse.class);
    }

    public JwtResponse autenticar(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getSenha())
            );

            String jwt = jwtService.generateJwtToken(request.getEmail());
            Usuario usuario = usuarioRepository.findByEmailAndAtivo(request.getEmail())
                .orElseThrow(() -> new BusinessException("Usuário não encontrado"));

            UsuarioResponse usuarioResponse = modelMapper.map(usuario, UsuarioResponse.class);
            return new JwtResponse(jwt, usuarioResponse);
        } catch (AuthenticationException e) {
            throw new BusinessException("Credenciais inválidas");
        }
    }

    public UsuarioResponse buscarPorId(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new BusinessException("Usuário não encontrado"));
        return modelMapper.map(usuario, UsuarioResponse.class);
    }

    public UsuarioResponse buscarPorEmail(String email) {
        Usuario usuario = usuarioRepository.findByEmailAndAtivo(email)
            .orElseThrow(() -> new BusinessException("Usuário não encontrado"));
        return modelMapper.map(usuario, UsuarioResponse.class);
    }

    public List<UsuarioResponse> listarTodos() {
        return usuarioRepository.findAll().stream()
            .map(usuario -> modelMapper.map(usuario, UsuarioResponse.class))
            .collect(Collectors.toList());
    }

    public UsuarioResponse atualizarUsuario(Long id, UsuarioRequest request) {
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new BusinessException("Usuário não encontrado"));

        if (!usuario.getEmail().equals(request.getEmail()) &&
            usuarioRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email já está em uso");
        }

        usuario.setNome(request.getNome());
        usuario.setEmail(request.getEmail());

        if (request.getSenha() != null && !request.getSenha().isEmpty()) {
            usuario.setSenha(passwordEncoder.encode(request.getSenha()));
        }

        Usuario usuarioAtualizado = usuarioRepository.save(usuario);
        return modelMapper.map(usuarioAtualizado, UsuarioResponse.class);
    }

    public void desativarUsuario(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new BusinessException("Usuário não encontrado"));
        usuario.setAtivo(false);
        usuarioRepository.save(usuario);
    }
}
