namespace MemuVie.Evento.Data.Repositories;

using MemuVie.Evento.Models;

public interface ITokenRedefinicaoSenhaRepository : IRepository<TokenRedefinicaoSenha>
{
    Task<TokenRedefinicaoSenha?> GetByTokenAsync(string token);
    Task<TokenRedefinicaoSenha?> GetPorUsuarioAsync(long usuarioId);
}
