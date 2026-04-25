using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EventoAPI.Migrations
{
    /// <inheritdoc />
    public partial class ForceFixBooleanColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Força conversão ignorando erro se já for boolean
            migrationBuilder.Sql(@"
                DO $$
                BEGIN
                    BEGIN
                        ALTER TABLE ""Usuarios""
                            ALTER COLUMN ""Ativo"" TYPE boolean
                            USING CASE WHEN ""Ativo""::text = '0' OR ""Ativo""::text = 'false' THEN false ELSE true END;
                    EXCEPTION WHEN others THEN
                        NULL; -- já é boolean, ignora
                    END;

                    BEGIN
                        ALTER TABLE ""Eventos""
                            ALTER COLUMN ""Revelado"" TYPE boolean
                            USING CASE WHEN ""Revelado""::text = '0' OR ""Revelado""::text = 'false' THEN false ELSE true END;
                    EXCEPTION WHEN others THEN
                        NULL;
                    END;

                    BEGIN
                        ALTER TABLE ""Eventos""
                            ALTER COLUMN ""VotacaoEncerrada"" TYPE boolean
                            USING CASE WHEN ""VotacaoEncerrada""::text = '0' OR ""VotacaoEncerrada""::text = 'false' THEN false ELSE true END;
                    EXCEPTION WHEN others THEN
                        NULL;
                    END;
                END
                $$;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
