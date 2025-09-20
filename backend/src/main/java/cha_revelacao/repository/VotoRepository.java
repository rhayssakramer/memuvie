package cha_revelacao.repository;

import cha_revelacao.model.Evento;
import cha_revelacao.model.Voto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VotoRepository extends JpaRepository<Voto, Long> {

    List<Voto> findByEventoIdOrderByCriadoEmDesc(Long eventoId);

    List<Voto> findByConvidadoIdOrderByCriadoEmDesc(Long convidadoId);

    Optional<Voto> findByEventoIdAndConvidadoId(Long eventoId, Long convidadoId);

    boolean existsByEventoIdAndConvidadoId(Long eventoId, Long convidadoId);

    @Query("SELECT COUNT(v) FROM Voto v WHERE v.evento.id = :eventoId AND v.palpite = :palpite")
    Long countVotosByEventoAndPalpite(@Param("eventoId") Long eventoId, @Param("palpite") Evento.SexoBebe palpite);

    @Query("SELECT COUNT(v) FROM Voto v WHERE v.evento.id = :eventoId")
    Long countVotosByEvento(@Param("eventoId") Long eventoId);
}
