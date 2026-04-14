namespace MemuVie.Evento.Data.Repositories;

using Microsoft.EntityFrameworkCore;
using MemuVie.Evento.Models;

public class VotoRepository : Repository<Voto>, IVotoRepository
{
    public VotoRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<Voto?> GetVotoByEventoAndUsuarioAsync(long eventoId, long usuarioId)
    {
        return await _dbSet
            .Include(v => v.Evento)
            .Include(v => v.Convidado)
            .FirstOrDefaultAsync(v => v.EventoId == eventoId && v.ConvidadoId == usuarioId);
    }

    public async Task<IEnumerable<Voto>> GetVotosPorEventoAsync(long eventoId)
    {
        return await _dbSet
            .Where(v => v.EventoId == eventoId)
            .Include(v => v.Evento)
            .Include(v => v.Convidado)
            .OrderByDescending(v => v.CriadoEm)
            .ToListAsync();
    }

    public async Task<IEnumerable<Voto>> GetVotosPorUsuarioAsync(long usuarioId)
    {
        return await _dbSet
            .Where(v => v.ConvidadoId == usuarioId)
            .Include(v => v.Evento)
            .Include(v => v.Convidado)
            .OrderByDescending(v => v.CriadoEm)
            .ToListAsync();
    }
}
