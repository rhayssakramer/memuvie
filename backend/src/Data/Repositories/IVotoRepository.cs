namespace MemuVie.Evento.Data.Repositories;

using MemuVie.Evento.Models;

public interface IVotoRepository : IRepository<Voto>
{
    Task<Voto?> GetVotoByEventoAndUsuarioAsync(long eventoId, long usuarioId);
    Task<IEnumerable<Voto>> GetVotosPorEventoAsync(long eventoId);
    Task<IEnumerable<Voto>> GetVotosPorUsuarioAsync(long usuarioId);
}
