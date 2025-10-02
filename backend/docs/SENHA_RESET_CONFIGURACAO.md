# Configuração da Funcionalidade de Redefinição de Senha

Este documento descreve as alterações feitas para resolver problemas com a funcionalidade de redefinição de senha e instruções para configurá-la corretamente.

## Alterações Realizadas

1. **Correção no mapeamento de URLs do controller**:
   - Adicionado `/api/auth` como path alternativo para o controller de redefinição de senha
   - Isso garante compatibilidade com as requisições vindas do frontend

2. **Adição de método no repositório**:
   - Adicionado método `findByUsuario_Email` para buscar tokens por email do usuário
   - Facilita o debug e identificação de problemas

3. **Melhorias no tratamento de erros e logs**:
   - Logs mais detalhados para debug
   - Tratamento seguro para ambiente de produção
   - Exibição de tokens gerados para fins de teste em ambiente de desenvolvimento

4. **Melhorias no controller**:
   - Logs detalhados de entrada e saída para facilitar diagnóstico
   - Melhor tratamento de erros para evitar respostas 500

## Configuração Necessária

Para que a funcionalidade de redefinição de senha funcione corretamente, é necessário:

1. **Configurar o arquivo `application-mail.properties`**:
   - Este arquivo deve ser criado em `src/main/resources/`
   - Ele deve conter credenciais reais de email (e está no .gitignore por segurança)

2. **Exemplo de configuração para Gmail**:

```properties
# Credenciais do provedor padrão (Gmail)
spring.mail.username=seu-email@gmail.com
spring.mail.password=sua-senha-de-app-real

# Confirme que estamos usando o host e porta corretos
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.connectiontimeout=10000
spring.mail.properties.mail.smtp.timeout=10000
spring.mail.properties.mail.smtp.writetimeout=10000
spring.mail.properties.mail.smtp.ssl.trust=*

# URL do frontend para links de redefinição
app.frontend.url=https://memuvie.vercel.app
```

1. **Instruções para senha de app do Gmail**:
   - Ative a autenticação de dois fatores em sua conta Google
   - Gere uma "Senha de App" em [Google Account Security](https://myaccount.google.com/security)
   - Use essa senha no lugar da senha normal da sua conta

2. **Teste e verificação**:
   - Após configurar, teste o fluxo completo de redefinição de senha
   - Verifique os logs para identificar qualquer problema
   - Para desenvolvimento, os tokens serão impressos nos logs
   - Em produção, defina a variável de ambiente `PROD_ENV=true` para desativar o log dos tokens

## Diagnóstico de Problemas

Se ainda houver problemas, verifique:

1. Se as credenciais de email são válidas
2. Se a conta de email permite acesso de aplicativos menos seguros
3. Os logs detalhados implementados nas classes:
   - `RedefinicaoSenhaController.java`
   - `RedefinicaoSenhaService.java`
   - `EmailService.java`