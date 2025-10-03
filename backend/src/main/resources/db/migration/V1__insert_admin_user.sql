-- Script para criar um usuário administrador padrão
INSERT INTO usuarios (
    id,
    nome,
    email,
    senha,
    foto_perfil,
    tipo,
    ativo
) VALUES (
    1,
    'Admin',
    'admin@example.com',
    '$2a$10$FxytEKGpX0Bjja8D1dclveYkZqRzgRTYPc9h3Q5vyGx9LkkKC25Lm', -- senha é 'admin123'
    NULL,
    'ADMIN',
    true
);