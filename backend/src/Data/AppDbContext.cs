namespace MemuVie.Evento.Data;

using Microsoft.EntityFrameworkCore;
using MemuVie.Evento.Models;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Usuario> Usuarios { get; set; } = null!;
    public DbSet<Evento> Eventos { get; set; } = null!;
    public DbSet<Voto> Votos { get; set; } = null!;
    public DbSet<GaleriaPost> GaleriaPosts { get; set; } = null!;
    public DbSet<TokenRedefinicaoSenha> TokensRedefinicaoSenha { get; set; } = null!;

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        base.OnConfiguring(optionsBuilder);
        // Suprimir warning de pending model changes em produção
        optionsBuilder.ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Usuario Configuration
        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Nome).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(150);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Senha).IsRequired().HasMaxLength(100);
            entity.Property(e => e.FotoPerfil).HasMaxLength(1000000);
            entity.Property(e => e.Tipo).HasConversion<string>();
            entity.Property(e => e.Ativo).HasColumnType("boolean");
            entity.Property(e => e.CriadoEm).ValueGeneratedOnAdd().HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // Evento Configuration
        modelBuilder.Entity<Evento>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Titulo).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Descricao).HasMaxLength(1000);
            entity.Property(e => e.Local).HasMaxLength(500);
            entity.Property(e => e.NomeMae).IsRequired().HasMaxLength(100);
            entity.Property(e => e.NomePai).IsRequired().HasMaxLength(100);
            entity.Property(e => e.ResultadoRevelacao).HasConversion<string?>();
            entity.Property(e => e.Revelado).HasColumnType("boolean");
            entity.Property(e => e.VotacaoEncerrada).HasColumnType("boolean");
            entity.Property(e => e.Status).HasConversion<string>();
            entity.Property(e => e.TipoEvento).HasConversion<string>();
            entity.Property(e => e.FotoCapa).HasMaxLength(1000);
            entity.Property(e => e.VideoDestaque).HasMaxLength(1000);
            entity.Property(e => e.CriadoEm).ValueGeneratedOnAdd().HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(e => e.Usuario)
                .WithMany(u => u.Eventos)
                .HasForeignKey(e => e.UsuarioId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.Votos)
                .WithOne(v => v.Evento)
                .HasForeignKey(v => v.EventoId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.GaleriaPosts)
                .WithOne(g => g.Evento)
                .HasForeignKey(g => g.EventoId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Voto Configuration
        modelBuilder.Entity<Voto>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Palpite).HasConversion<string>();
            entity.Property(e => e.Justificativa).HasMaxLength(500);
            entity.Property(e => e.CriadoEm).ValueGeneratedOnAdd().HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.HasIndex(e => new { e.EventoId, e.ConvidadoId }).IsUnique();

            entity.HasOne(v => v.Evento)
                .WithMany(e => e.Votos)
                .HasForeignKey(v => v.EventoId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(v => v.Convidado)
                .WithMany(u => u.Votos)
                .HasForeignKey(v => v.ConvidadoId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // GaleriaPost Configuration
        modelBuilder.Entity<GaleriaPost>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Mensagem).HasMaxLength(5000);
            entity.Property(e => e.UrlFoto).HasMaxLength(1000);
            entity.Property(e => e.UrlVideo).HasMaxLength(1000);
            entity.Property(e => e.DataCriacao).ValueGeneratedOnAdd().HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(g => g.Usuario)
                .WithMany(u => u.GaleriaPosts)
                .HasForeignKey(g => g.UsuarioId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(g => g.Evento)
                .WithMany(e => e.GaleriaPosts)
                .HasForeignKey(g => g.EventoId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // TokenRedefinicaoSenha Configuration
        modelBuilder.Entity<TokenRedefinicaoSenha>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Token).IsRequired().HasMaxLength(500);
            entity.HasIndex(e => e.Token).IsUnique();

            entity.HasOne(t => t.Usuario)
                .WithMany()
                .HasForeignKey(t => t.UsuarioId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
