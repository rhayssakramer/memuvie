namespace MemuVie.Evento.Data.Repositories;

using Microsoft.EntityFrameworkCore;
using MemuVie.Evento.Models;

public class TokenRedefinicaoSenhaRepository : Repository<TokenRedefinicaoSenha>, ITokenRedefinicaoSenhaRepository
{
    public TokenRedefinicaoSenhaRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<TokenRedefinicaoSenha?> GetByTokenAsync(string token)
    {
        return await _dbSet
            .Include(t => t.Usuario)
            .FirstOrDefaultAsync(t => t.Token == token);
    }

    public async Task<TokenRedefinicaoSenha?> GetPorUsuarioAsync(long usuarioId)
    {
        return await _dbSet
            .Include(t => t.Usuario)
            .FirstOrDefaultAsync(t => t.UsuarioId == usuarioId);
    }
}
