INSERT INTO eventos (
    titulo, 
    descricao, 
    data_evento, 
    local, 
    nome_mae, 
    nome_pai, 
    status,
    usuario_id,
    revelado,
    votacao_encerrada
) VALUES (
    'Evento de Teste', 
    'Evento para testes da aplicação', 
    NOW() + INTERVAL '30 days', 
    'Local de Teste', 
    'Mãe Teste', 
    'Pai Teste', 
    'ATIVO',
    1,
    false,
    false
);