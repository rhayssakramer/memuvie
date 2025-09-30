package cha_revelacao.service;

import cha_revelacao.dto.request.AlterarSenhaRequest;
import cha_revelacao.dto.request.LoginRequest;
import cha_revelacao.dto.request.UsuarioRequest;
import cha_revelacao.dto.response.JwtResponse;
import cha_revelacao.dto.response.UsuarioResponse;
import cha_revelacao.exception.BusinessException;
import cha_revelacao.model.Usuario;
import cha_revelacao.repository.UsuarioRepository;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class UsuarioService {
    // Mensagem de erro padrão

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final ModelMapper modelMapper;

    // Constructor explícito para injeção de dependências
    public UsuarioService(UsuarioRepository usuarioRepository,
                          PasswordEncoder passwordEncoder,
                          JwtService jwtService,
                          AuthenticationManager authenticationManager,
                          ModelMapper modelMapper) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.modelMapper = modelMapper;
    }

    public UsuarioResponse criarUsuario(UsuarioRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email já está em uso");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(request.getNome());
        usuario.setEmail(request.getEmail());
        usuario.setSenha(passwordEncoder.encode(request.getSenha()));
        usuario.setFotoPerfil(request.getFotoPerfil()); // Adiciona a foto de perfil
        usuario.setTipo(Usuario.TipoUsuario.CONVIDADO);
        usuario.setAtivo(true);

        Usuario usuarioSalvo = usuarioRepository.save(usuario);
        return modelMapper.map(usuarioSalvo, UsuarioResponse.class);
    }

    public JwtResponse autenticar(LoginRequest request) {
        try {
            // Normaliza o email para evitar problemas de case-sensitivity
            String emailNormalizado = request.getEmail().toLowerCase().trim();

            // Log para debug
            log.info("Tentativa de autenticação para usuário: {}", emailNormalizado);

            // Verifica primeiro se o usuário existe e está ativo
            Optional<Usuario> usuarioOpt = usuarioRepository.findByEmailAndAtivo(emailNormalizado);
            if (usuarioOpt.isEmpty()) {
                log.warn("Tentativa de login para usuário inexistente ou inativo: {}", emailNormalizado);
                throw new BusinessException("Credenciais inválidas");
            }

            // Tenta autenticar com o AuthenticationManager
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(emailNormalizado, request.getSenha())
            );

            log.info("Autenticação bem-sucedida para o usuário: {}", emailNormalizado);

            // Gera o token JWT
            String jwt = jwtService.generateJwtToken(emailNormalizado);
            Usuario usuario = usuarioOpt.get();

            UsuarioResponse usuarioResponse = modelMapper.map(usuario, UsuarioResponse.class);
            return new JwtResponse(jwt, usuarioResponse);
        } catch (AuthenticationException e) {
            log.error("Falha na autenticação: {}", e.getMessage());
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

        // Atualiza a foto de perfil se fornecida
        if (request.getFotoPerfil() != null && !request.getFotoPerfil().isEmpty()) {
            usuario.setFotoPerfil(request.getFotoPerfil());
        }

        // Se a senha estiver sendo atualizada
        if (request.getSenha() != null && !request.getSenha().isEmpty()) {
            // Verifica se a senha atual está presente para autenticar
            if (request.getSenhaAtual() != null && !request.getSenhaAtual().isEmpty()) {
                // Verifica se a senha atual está correta
                if (!passwordEncoder.matches(request.getSenhaAtual(), usuario.getSenha())) {
                    throw new BusinessException("Senha atual incorreta");
                }

                // Verifica se a nova senha não é igual à senha atual
                if (passwordEncoder.matches(request.getSenha(), usuario.getSenha())) {
                    throw new BusinessException("A nova senha não pode ser igual à senha atual");
                }

                // Atualiza a senha
                usuario.setSenha(passwordEncoder.encode(request.getSenha()));
                log.info("Senha alterada com sucesso para usuário ID: {}", id);
            } else {
                // Se não houver senha atual, considera como cadastro inicial de senha
                usuario.setSenha(passwordEncoder.encode(request.getSenha()));
            }
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