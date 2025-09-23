package cha_revelacao.security;

import cha_revelacao.model.Usuario;
import cha_revelacao.repository.UsuarioRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@Slf4j
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    public UserDetailsServiceImpl(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        log.debug("Carregando usuário pelo email: {}", email);
        
        // Normaliza o email para evitar problemas de case-sensitivity
        String emailNormalizado = email.toLowerCase().trim();
        
        Usuario usuario = usuarioRepository.findByEmailAndAtivo(emailNormalizado)
                .orElseThrow(() -> {
                    log.warn("Usuário não encontrado ou inativo com o email: {}", emailNormalizado);
                    return new UsernameNotFoundException("Usuário não encontrado com o email: " + emailNormalizado);
                });
        
        log.debug("Usuário encontrado: {}. Está ativo: {}", usuario.getEmail(), usuario.getAtivo());
        
        return User.builder()
                .username(usuario.getEmail())
                .password(usuario.getSenha())
                .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + usuario.getTipo().name())))
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(!usuario.getAtivo())
                .build();
    }
}
