CREATE TABLE votos (
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

