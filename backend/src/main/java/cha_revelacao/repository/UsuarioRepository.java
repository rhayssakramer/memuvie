package cha_revelacao.repository;

import cha_revelacao.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    // Verificar existência por email (case-insensitive)
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM Usuario u WHERE LOWER(u.email) = LOWER(:email)")
    boolean existsByEmail(@Param("email") String email);

    // Método corrigido para garantir que apenas busque usuários ativos
    @Query("SELECT u FROM Usuario u WHERE LOWER(u.email) = LOWER(:email) AND u.ativo = true")
    Optional<Usuario> findByEmailAndAtivo(@Param("email") String email);
}
