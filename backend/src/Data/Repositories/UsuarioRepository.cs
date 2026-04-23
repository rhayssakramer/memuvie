namespace MemuVie.Evento.Data.Repositories;

using Microsoft.EntityFrameworkCore;
using MemuVie.Evento.Models;

public class UsuarioRepository : Repository<Usuario>, IUsuarioRepository
{
    public UsuarioRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<Usuario?> GetByEmailAsync(string email)
    {
        return await _dbSet.FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<Usuario?> GetByEmailAndAtivoAsync(string email)
    {
        return await _dbSet.FirstOrDefaultAsync(u => u.Email == email && u.Ativo);
    }

    public async Task<IEnumerable<Usuario>> GetAllAtivosAsync()
    {
        return await _dbSet.Where(u => u.Ativo).ToListAsync();
    }
}
