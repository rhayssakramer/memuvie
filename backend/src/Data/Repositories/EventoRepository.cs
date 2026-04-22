namespace MemuVie.Evento.Data.Repositories;

using Microsoft.EntityFrameworkCore;
using MemuVie.Evento.Models;

public class EventoRepository : Repository<Evento>, IEventoRepository
{
    public EventoRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Evento>> GetEventosAtivoAsync()
    {
        return await _dbSet
            .Where(e => e.Status == EventStatus.Ativo)
            .Include(e => e.Usuario)
            .OrderByDescending(e => e.DataEvento)
            .ToListAsync();
    }

    public async Task<IEnumerable<Evento>> GetEventosComVotacaoAbertaAsync()
    {
        return await _dbSet
            .Where(e => e.Status == EventStatus.Ativo && !e.VotacaoEncerrada)
            .Include(e => e.Usuario)
            .OrderByDescending(e => e.DataEvento)
            .ToListAsync();
    }

    public async Task<IEnumerable<Evento>> GetEventosPorUsuarioAsync(long usuarioId)
    {
        return await _dbSet
            .Where(e => e.UsuarioId == usuarioId)
            .Include(e => e.Usuario)
            .OrderByDescending(e => e.DataEvento)
            .ToListAsync();
    }
}
