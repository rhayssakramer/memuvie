using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EventoAPI.Migrations
{
    /// <inheritdoc />
    public partial class FixColumnTypesForPostgres : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Usa pg_catalog para verificar o tipo real da coluna (case-insensitive, funciona no Neon)
            migrationBuilder.Sql(@"
                DO $$
                BEGIN
                    -- Corrige Usuarios.Ativo (INTEGER → BOOLEAN)
                    IF EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_name = 'usuarios'
                          AND column_name = 'Ativo'
                          AND data_type IN ('integer', 'smallint', 'bigint')
                    ) THEN
                        ALTER TABLE ""Usuarios""
                            ALTER COLUMN ""Ativo"" TYPE boolean
                            USING CASE WHEN ""Ativo"" = 0 THEN false ELSE true END;
                    END IF;

                    -- Corrige Eventos.Revelado (INTEGER → BOOLEAN)
                    IF EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_name = 'eventos'
                          AND column_name = 'Revelado'
                          AND data_type IN ('integer', 'smallint', 'bigint')
                    ) THEN
                        ALTER TABLE ""Eventos""
                            ALTER COLUMN ""Revelado"" TYPE boolean
                            USING CASE WHEN ""Revelado"" = 0 THEN false ELSE true END;
                    END IF;

                    -- Corrige Eventos.VotacaoEncerrada (INTEGER → BOOLEAN)
                    IF EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_name = 'eventos'
                          AND column_name = 'VotacaoEncerrada'
                          AND data_type IN ('integer', 'smallint', 'bigint')
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
            migrationBuilder.Sql(
                "DO BEGIN " +
                "IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'Ativo' AND data_type = 'boolean') THEN " +
                "ALTER TABLE \"Usuarios\" ALTER COLUMN \"Ativo\" TYPE integer USING CASE WHEN \"Ativo\" THEN 1 ELSE 0 END; " +
                "END IF; " +
                "IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'eventos' AND column_name = 'Revelado' AND data_type = 'boolean') THEN " +
                "ALTER TABLE \"Eventos\" ALTER COLUMN \"Revelado\" TYPE integer USING CASE WHEN \"Revelado\" THEN 1 ELSE 0 END; " +
                "END IF; " +
                "IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'eventos' AND column_name = 'VotacaoEncerrada' AND data_type = 'boolean') THEN " +
                "ALTER TABLE \"Eventos\" ALTER COLUMN \"VotacaoEncerrada\" TYPE integer USING CASE WHEN \"VotacaoEncerrada\" THEN 1 ELSE 0 END; " +
                "END IF; END;");
        }
    }
}
