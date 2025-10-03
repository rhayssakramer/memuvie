-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(100) NOT NULL,
    foto_perfil VARCHAR(1000),
    tipo VARCHAR(20) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP
);

-- Criar tabela de eventos
CREATE TABLE IF NOT EXISTS eventos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descricao VARCHAR(1000),
    data_evento TIMESTAMP NOT NULL,
    local VARCHAR(500),
    nome_mae VARCHAR(100) NOT NULL,
    nome_pai VARCHAR(100) NOT NULL,
    revelado BOOLEAN DEFAULT FALSE,
    resultado_revelacao VARCHAR(255),
    status VARCHAR(255) NOT NULL,
    tipo_evento VARCHAR(255),
    cor_tema VARCHAR(255),
    foto_capa VARCHAR(1000),
    video_destaque VARCHAR(1000),
    votacao_encerrada BOOLEAN DEFAULT FALSE,
    data_encerramento_votacao TIMESTAMP,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP,
    usuario_id INTEGER NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Criar tabela de votos
CREATE TABLE IF NOT EXISTS votos (
    id SERIAL PRIMARY KEY,
    palpite VARCHAR(20) NOT NULL,
    justificativa VARCHAR(500),
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    evento_id INTEGER NOT NULL,
    convidado_id INTEGER NOT NULL,
    FOREIGN KEY (evento_id) REFERENCES eventos(id),
    FOREIGN KEY (convidado_id) REFERENCES usuarios(id),
    CONSTRAINT uq_voto_evento_convidado UNIQUE (evento_id, convidado_id)
);

-- Criar tabela de galeria_posts
CREATE TABLE IF NOT EXISTS galeria_posts (
    id SERIAL PRIMARY KEY,
    mensagem TEXT,
    url_foto VARCHAR(1000),
    url_video VARCHAR(1000),
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    usuario_id INTEGER NOT NULL,
    evento_id INTEGER NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (evento_id) REFERENCES eventos(id)
);

-- Converter IDs para BIGINT após a criação das tabelas
ALTER TABLE usuarios ALTER COLUMN id TYPE BIGINT;
ALTER SEQUENCE usuarios_id_seq AS BIGINT;

ALTER TABLE eventos ALTER COLUMN id TYPE BIGINT;
ALTER SEQUENCE eventos_id_seq AS BIGINT;
ALTER TABLE eventos ALTER COLUMN usuario_id TYPE BIGINT;

ALTER TABLE votos ALTER COLUMN id TYPE BIGINT;
ALTER SEQUENCE votos_id_seq AS BIGINT;
ALTER TABLE votos ALTER COLUMN evento_id TYPE BIGINT;
ALTER TABLE votos ALTER COLUMN convidado_id TYPE BIGINT;

ALTER TABLE galeria_posts ALTER COLUMN id TYPE BIGINT;
ALTER SEQUENCE galeria_posts_id_seq AS BIGINT;
ALTER TABLE galeria_posts ALTER COLUMN usuario_id TYPE BIGINT;
ALTER TABLE galeria_posts ALTER COLUMN evento_id TYPE BIGINT;