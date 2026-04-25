using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EventoAPI.Migrations
{
    /// <inheritdoc />
    public partial class RemoveVotoFeature : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<bool>(
                name: "Ativo",
                table: "Usuarios",
                type: "boolean",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<bool>(
                name: "VotacaoEncerrada",
                table: "Eventos",
                type: "boolean",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<bool>(
                name: "Revelado",
                table: "Eventos",
                type: "boolean",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "INTEGER");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<bool>(
                name: "Ativo",
                table: "Usuarios",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "boolean");

            migrationBuilder.AlterColumn<bool>(
                name: "VotacaoEncerrada",
                table: "Eventos",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "boolean");

            migrationBuilder.AlterColumn<bool>(
                name: "Revelado",
                table: "Eventos",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "boolean");
        }
    }
}
