-- Atualizar a senha do usuário admin para "admin123"
-- A senha está sendo hasheada com bcrypt
UPDATE usuarios
SET senha = '$2a$10$yfLzrBkpKQSI81Hc7FBqFeMH1ZaPMtAnhXnj5e8pfjwQucIRmYlZu'
WHERE email = 'admin@revelacaocha.com';

-- Verificar se a atualização foi bem-sucedida
SELECT id, nome, email, senha, tipo, ativo
FROM usuarios
WHERE email = 'admin@revelacaocha.com';
