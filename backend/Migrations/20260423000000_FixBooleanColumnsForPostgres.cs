using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EventoAPI.Migrations
{
    /// <inheritdoc />
    public partial class FixBooleanColumnsForPostgres : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Detecta se está rodando no PostgreSQL e converte as colunas INTEGER para BOOLEAN
            migrationBuilder.Sql(@"
                DO $$
                BEGIN
                    -- Corrige Usuarios.Ativo
                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_name = 'Usuarios'
                          AND column_name = 'Ativo'
                          AND data_type = 'integer'
                    ) THEN
                        ALTER TABLE ""Usuarios""
                            ALTER COLUMN ""Ativo"" TYPE boolean
                            USING CASE WHEN ""Ativo"" = 0 THEN false ELSE true END;
                    END IF;

                    -- Corrige Eventos.Revelado
                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_name = 'Eventos'
                          AND column_name = 'Revelado'
                          AND data_type = 'integer'
                    ) THEN
                        ALTER TABLE ""Eventos""
                            ALTER COLUMN ""Revelado"" TYPE boolean
                            USING CASE WHEN ""Revelado"" = 0 THEN false ELSE true END;
                    END IF;

                    -- Corrige Eventos.VotacaoEncerrada
                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_name = 'Eventos'
                          AND column_name = 'VotacaoEncerrada'
                          AND data_type = 'integer'
                    ) THEN
                        ALTER TABLE ""Eventos""
                            ALTER COLUMN ""VotacaoEncerrada"" TYPE boolean
                            USING CASE WHEN ""VotacaoEncerrada"" = 0 THEN false ELSE true END;
                    END IF;
                END
                $$;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_name = 'Usuarios'
                          AND column_name = 'Ativo'
                          AND data_type = 'boolean'
                    ) THEN
                        ALTER TABLE ""Usuarios""
                            ALTER COLUMN ""Ativo"" TYPE integer
                            USING CASE WHEN ""Ativo"" THEN 1 ELSE 0 END;
                    END IF;

                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_name = 'Eventos'
                          AND column_name = 'Revelado'
                          AND data_type = 'boolean'
                    ) THEN
                        ALTER TABLE ""Eventos""
                            ALTER COLUMN ""Revelado"" TYPE integer
                            USING CASE WHEN ""Revelado"" THEN 1 ELSE 0 END;
                    END IF;

                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_name = 'Eventos'
                          AND column_name = 'VotacaoEncerrada'
                          AND data_type = 'boolean'
                    ) THEN
                        ALTER TABLE ""Eventos""
                            ALTER COLUMN ""VotacaoEncerrada"" TYPE integer
                            USING CASE WHEN ""VotacaoEncerrada"" THEN 1 ELSE 0 END;
                    END IF;
                END
                $$;
            ");
        }
    }
}
