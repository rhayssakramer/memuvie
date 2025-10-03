-- Script para criar um usuário administrador padrão
INSERT INTO usuarios (
    nome,
    email,
    senha,
    foto_perfil,
    tipo,
    ativo
) VALUES (
    'Admin',
    'admin@example.com',
    '$2a$10$FxytEKGpX0Bjja8D1dclveYkZqRzgRTYPc9h3Q5vyGx9LkkKC25Lm', -- senha é 'admin123'
    NULL,
    'ADMIN',
    true
);