namespace MemuVie.Evento.Data.Repositories;

using MemuVie.Evento.Models;

public interface IGaleriaPostRepository : IRepository<GaleriaPost>
{
    Task<IEnumerable<GaleriaPost>> GetPostsPorEventoAsync(long eventoId);
    Task<IEnumerable<GaleriaPost>> GetPostsPorUsuarioAsync(long usuarioId);
}
