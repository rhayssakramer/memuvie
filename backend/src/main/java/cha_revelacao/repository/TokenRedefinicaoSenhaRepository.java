package cha_revelacao.repository;

import cha_revelacao.model.TokenRedefinicaoSenha;
import cha_revelacao.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface TokenRedefinicaoSenhaRepository extends JpaRepository<TokenRedefinicaoSenha, Long> {
    Optional<TokenRedefinicaoSenha> findByToken(@Param("token") String token);
    
    @Transactional
    void deleteByUsuario(@Param("usuario") Usuario usuario);
    
    @Transactional
    long countByUsuario(@Param("usuario") Usuario usuario);
}