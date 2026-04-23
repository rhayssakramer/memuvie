namespace MemuVie.Evento.Data.Repositories;

using Microsoft.EntityFrameworkCore;
using MemuVie.Evento.Models;

public class GaleriaPostRepository : Repository<GaleriaPost>, IGaleriaPostRepository
{
    public GaleriaPostRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<GaleriaPost>> GetPostsPorEventoAsync(long eventoId)
    {
        return await _dbSet
            .Where(g => g.EventoId == eventoId)
            .Include(g => g.Usuario)
            .Include(g => g.Evento)
            .OrderByDescending(g => g.DataCriacao)
            .ToListAsync();
    }

    public async Task<IEnumerable<GaleriaPost>> GetPostsPorUsuarioAsync(long usuarioId)
    {
        return await _dbSet
            .Where(g => g.UsuarioId == usuarioId)
            .Include(g => g.Usuario)
            .Include(g => g.Evento)
            .OrderByDescending(g => g.DataCriacao)
            .ToListAsync();
    }
}
