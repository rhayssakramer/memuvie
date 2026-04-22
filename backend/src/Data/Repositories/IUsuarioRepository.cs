namespace MemuVie.Evento.Data.Repositories;

using MemuVie.Evento.Models;

public interface IUsuarioRepository : IRepository<Usuario>
{
    Task<Usuario?> GetByEmailAsync(string email);
    Task<Usuario?> GetByEmailAndAtivoAsync(string email);
    Task<IEnumerable<Usuario>> GetAllAtivosAsync();
}
