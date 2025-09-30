CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP
);

-- Inserir um usuário administrador padrão (senha: admin123)
INSERT INTO usuarios (nome, email, senha, tipo)
VALUES ('Administrador', 'admin@revelacaocha.com', '$2a$10$hKDVYxLefVHV/vtuPhWD3OigtRyOykRLDdUAp80Z1crSoS1lFqaFS', 'ADMIN');
