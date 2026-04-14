namespace MemuVie.Evento.Data;

using Microsoft.EntityFrameworkCore;
using MemuVie.Evento.Models;
using MemuVie.Evento.Security;

public class DatabaseSeeder
{
    public static async Task SeedAdminUserAsync(AppDbContext context, IPasswordHashService passwordHashService, IConfiguration configuration)
    {
        try
        {
            // Verificar se já existe um admin
            var existingAdmin = await context.Usuarios.FirstOrDefaultAsync(u => u.Email == "admin@memuvie.com");
            if (existingAdmin != null)
            {
                Console.WriteLine($"ℹ️  Admin já existe: {existingAdmin.Nome}");
                return; // Admin já existe
            }

            // Criar usuário admin padrão (sempre criar se não existir)
            var adminUser = new Usuario
            {
                Nome = "Admin memuvie",
                Email = "admin@memuvie.com",
                Senha = passwordHashService.HashPassword("Admin@123456"), // Alterar em produção!
                Tipo = UserType.Admin,
                Ativo = true,
                CriadoEm = DateTime.UtcNow
            };

            context.Usuarios.Add(adminUser);
            await context.SaveChangesAsync();

            Console.WriteLine("✅ Usuário admin criado com sucesso!");
            Console.WriteLine("📧 Email: admin@memuvie.com");
            Console.WriteLine("🔑 Senha: Admin@123456");
            Console.WriteLine("⚠️  IMPORTANTE: Altere a senha após primeiro login!");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"⚠️  Erro ao criar usuário admin: {ex.Message}");
        }
    }
}
