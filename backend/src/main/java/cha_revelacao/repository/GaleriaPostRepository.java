package cha_revelacao.repository;

import cha_revelacao.model.Evento;
import cha_revelacao.model.GaleriaPost;
import cha_revelacao.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GaleriaPostRepository extends JpaRepository<GaleriaPost, Long> {
    List<GaleriaPost> findByEventoOrderByDataCriacaoDesc(Evento evento);
    List<GaleriaPost> findByUsuarioOrderByDataCriacaoDesc(Usuario usuario);
    List<GaleriaPost> findAllByOrderByDataCriacaoDesc();
}