package cha_revelacao.repository;

import cha_revelacao.model.Evento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventoRepository extends JpaRepository<Evento, Long> {

    List<Evento> findByUsuarioIdOrderByDataEventoDesc(Long usuarioId);

    List<Evento> findByStatusOrderByDataEventoDesc(Evento.StatusEvento status);

    @Query("SELECT e FROM Evento e WHERE e.dataEvento >= :dataInicio AND e.dataEvento <= :dataFim ORDER BY e.dataEvento")
    List<Evento> findEventosPorPeriodo(@Param("dataInicio") LocalDateTime dataInicio,
                                       @Param("dataFim") LocalDateTime dataFim);

    @Query("SELECT e FROM Evento e WHERE e.votacaoEncerrada = false AND e.status = 'ATIVO' ORDER BY e.dataEvento")
    List<Evento> findEventosComVotacaoAberta();
}
