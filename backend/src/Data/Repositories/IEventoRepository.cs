namespace MemuVie.Evento.Data.Repositories;

using MemuVie.Evento.Models;

public interface IEventoRepository : IRepository<Evento>
{
    Task<IEnumerable<Evento>> GetEventosAtivoAsync();
    Task<IEnumerable<Evento>> GetEventosComVotacaoAbertaAsync();
    Task<IEnumerable<Evento>> GetEventosPorUsuarioAsync(long usuarioId);
}
