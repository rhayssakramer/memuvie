using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace EventoAPI.Migrations
{
    /// <inheritdoc />
    public partial class ConverterParaSqlite : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", Npgsql.EntityFrameworkCore.PostgreSQL.Metadata.NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nome = table.Column<string>(maxLength: 100, nullable: false),
                    Email = table.Column<string>(maxLength: 150, nullable: false),
                    Senha = table.Column<string>(maxLength: 100, nullable: false),
                    FotoPerfil = table.Column<string>(maxLength: 1000000, nullable: true),
                    Tipo = table.Column<string>(nullable: false),
                    Ativo = table.Column<bool>(nullable: false),
                    CriadoEm = table.Column<DateTime>(nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    AtualizadoEm = table.Column<DateTime>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Eventos",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", Npgsql.EntityFrameworkCore.PostgreSQL.Metadata.NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Titulo = table.Column<string>(maxLength: 200, nullable: false),
                    Descricao = table.Column<string>(maxLength: 1000, nullable: true),
                    DataEvento = table.Column<DateTime>(nullable: false),
                    Local = table.Column<string>(maxLength: 500, nullable: true),
                    NomeMae = table.Column<string>(maxLength: 100, nullable: false),
                    NomePai = table.Column<string>(maxLength: 100, nullable: false),
                    Revelado = table.Column<bool>(nullable: false),
                    ResultadoRevelacao = table.Column<string>(nullable: true),
                    Status = table.Column<string>(nullable: false),
                    VotacaoEncerrada = table.Column<bool>(nullable: false),
                    DataEncerramentoVotacao = table.Column<DateTime>(nullable: true),
                    FotoCapa = table.Column<string>(maxLength: 1000, nullable: true),
                    VideoDestaque = table.Column<string>(maxLength: 1000, nullable: true),
                    CorTema = table.Column<string>(nullable: true),
                    TipoEvento = table.Column<string>(nullable: false),
                    CriadoEm = table.Column<DateTime>(nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    AtualizadoEm = table.Column<DateTime>(nullable: true),
                    UsuarioId = table.Column<long>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Eventos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Eventos_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TokensRedefinicaoSenha",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", Npgsql.EntityFrameworkCore.PostgreSQL.Metadata.NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Token = table.Column<string>(maxLength: 500, nullable: false),
                    DataExpiracao = table.Column<DateTime>(nullable: false),
                    UsuarioId = table.Column<long>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TokensRedefinicaoSenha", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TokensRedefinicaoSenha_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GaleriaPosts",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", Npgsql.EntityFrameworkCore.PostgreSQL.Metadata.NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Mensagem = table.Column<string>(maxLength: 5000, nullable: true),
                    UrlFoto = table.Column<string>(maxLength: 1000, nullable: true),
                    UrlVideo = table.Column<string>(maxLength: 1000, nullable: true),
                    DataCriacao = table.Column<DateTime>(nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UsuarioId = table.Column<long>(nullable: false),
                    EventoId = table.Column<long>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GaleriaPosts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GaleriaPosts_Eventos_EventoId",
                        column: x => x.EventoId,
                        principalTable: "Eventos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GaleriaPosts_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Votos",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", Npgsql.EntityFrameworkCore.PostgreSQL.Metadata.NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Palpite = table.Column<string>(nullable: false),
                    Justificativa = table.Column<string>(maxLength: 500, nullable: true),
                    CriadoEm = table.Column<DateTime>(nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    EventoId = table.Column<long>(nullable: false),
                    ConvidadoId = table.Column<long>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Votos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Votos_Eventos_EventoId",
                        column: x => x.EventoId,
                        principalTable: "Eventos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Votos_Usuarios_ConvidadoId",
                        column: x => x.ConvidadoId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Eventos_UsuarioId",
                table: "Eventos",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_GaleriaPosts_EventoId",
                table: "GaleriaPosts",
                column: "EventoId");

            migrationBuilder.CreateIndex(
                name: "IX_GaleriaPosts_UsuarioId",
                table: "GaleriaPosts",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_TokensRedefinicaoSenha_Token",
                table: "TokensRedefinicaoSenha",
                column: "Token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TokensRedefinicaoSenha_UsuarioId",
                table: "TokensRedefinicaoSenha",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_Email",
                table: "Usuarios",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Votos_ConvidadoId",
                table: "Votos",
                column: "ConvidadoId");

            migrationBuilder.CreateIndex(
                name: "IX_Votos_EventoId_ConvidadoId",
                table: "Votos",
                columns: new[] { "EventoId", "ConvidadoId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GaleriaPosts");

            migrationBuilder.DropTable(
                name: "TokensRedefinicaoSenha");

            migrationBuilder.DropTable(
                name: "Votos");

            migrationBuilder.DropTable(
                name: "Eventos");

            migrationBuilder.DropTable(
                name: "Usuarios");
        }
    }
}
