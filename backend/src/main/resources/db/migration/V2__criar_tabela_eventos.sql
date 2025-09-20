CREATE TABLE eventos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descricao VARCHAR(1000),
    data_evento TIMESTAMP NOT NULL,
    local VARCHAR(500),
    nome_mae VARCHAR(100) NOT NULL,
    nome_pai VARCHAR(100) NOT NULL,
    revelado BOOLEAN DEFAULT FALSE,
    resultado_revelacao VARCHAR(20),
    status VARCHAR(20) NOT NULL,
    votacao_encerrada BOOLEAN DEFAULT FALSE,
    data_encerramento_votacao TIMESTAMP,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP,
    usuario_id INTEGER NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
