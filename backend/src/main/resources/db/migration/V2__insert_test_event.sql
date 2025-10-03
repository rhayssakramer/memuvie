-- Script para criar um evento padrão para testes
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
    CURRENT_DATE + INTERVAL '30 day', 
    'Local de Teste', 
    'Mãe Teste', 
    'Pai Teste', 
    'ATIVO',
    1,
    false,
    false
);