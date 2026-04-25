using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EventoAPI.Migrations
{
    /// <inheritdoc />
    public partial class FixBooleanViapgCatalog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DO $$
                DECLARE
                    col_type text;
                BEGIN
                    -- Verifica Usuarios.Ativo via pg_catalog (case-sensitive)
                    SELECT pg_catalog.format_type(a.atttypid, a.atttypmod)
                    INTO col_type
                    FROM pg_catalog.pg_attribute a
                    JOIN pg_catalog.pg_class c ON c.oid = a.attrelid
                    WHERE c.relname = 'Usuarios' AND a.attname = 'Ativo' AND a.attnum > 0;

                    IF col_type IN ('integer', 'smallint', 'bigint') THEN
                        ALTER TABLE ""Usuarios"" ALTER COLUMN ""Ativo"" TYPE boolean USING ""Ativo""::boolean;
                    END IF;

                    -- Verifica Eventos.Revelado
                    SELECT pg_catalog.format_type(a.atttypid, a.atttypmod)
                    INTO col_type
                    FROM pg_catalog.pg_attribute a
                    JOIN pg_catalog.pg_class c ON c.oid = a.attrelid
                    WHERE c.relname = 'Eventos' AND a.attname = 'Revelado' AND a.attnum > 0;

                    IF col_type IN ('integer', 'smallint', 'bigint') THEN
                        ALTER TABLE ""Eventos"" ALTER COLUMN ""Revelado"" TYPE boolean USING ""Revelado""::boolean;
                    END IF;

                    -- Verifica Eventos.VotacaoEncerrada
                    SELECT pg_catalog.format_type(a.atttypid, a.atttypmod)
                    INTO col_type
                    FROM pg_catalog.pg_attribute a
                    JOIN pg_catalog.pg_class c ON c.oid = a.attrelid
                    WHERE c.relname = 'Eventos' AND a.attname = 'VotacaoEncerrada' AND a.attnum > 0;

                    IF col_type IN ('integer', 'smallint', 'bigint') THEN
                        ALTER TABLE ""Eventos"" ALTER COLUMN ""VotacaoEncerrada"" TYPE boolean USING ""VotacaoEncerrada""::boolean;
                    END IF;
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
