-- Ajuste dos tipos de colunas para BIGINT para alinhar com entidades Java (Long)
-- Não altere migrações anteriores já aplicadas; evolua o schema via nova versão.

BEGIN;

-- 1. usuarios
ALTER TABLE usuarios ALTER COLUMN id TYPE BIGINT;
-- Ajusta a sequence gerada pelo SERIAL para bigint
ALTER SEQUENCE usuarios_id_seq AS BIGINT;

-- 2. eventos (depende de usuarios)
ALTER TABLE eventos ALTER COLUMN id TYPE BIGINT;
ALTER SEQUENCE eventos_id_seq AS BIGINT;
ALTER TABLE eventos ALTER COLUMN usuario_id TYPE BIGINT;

-- 3. votos (depende de eventos e usuarios)
ALTER TABLE votos ALTER COLUMN id TYPE BIGINT;
ALTER SEQUENCE votos_id_seq AS BIGINT;
ALTER TABLE votos ALTER COLUMN evento_id TYPE BIGINT;
ALTER TABLE votos ALTER COLUMN convidado_id TYPE BIGINT;

COMMIT;

