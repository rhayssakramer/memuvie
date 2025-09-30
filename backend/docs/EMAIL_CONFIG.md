# Configuração de Email para Redefinição de Senha

## Visão Geral

O sistema foi configurado para suportar múltiplos provedores de email para o envio de emails de redefinição de senha. Os provedores suportados são:

- Gmail
- Outlook/Office365
- Hotmail
- iCloud

O sistema detecta automaticamente o provedor com base no domínio do email do usuário e utiliza as configurações apropriadas.

## Arquivos Principais

1. `EmailConfig.java` - Configuração de múltiplos provedores de email
2. `EmailService.java` - Serviço para envio de emails
3. `RedefinicaoSenhaService.java` - Serviço para gerenciar a lógica de redefinição de senha
4. `RedefinicaoSenhaController.java` - Controlador REST para endpoints de redefinição de senha
5. `application.properties` - Configurações dos provedores de email

## Como Configurar

### 1. Configurações Gerais no application.properties

As configurações padrão são usadas quando não é possível determinar o provedor específico do email do usuário:

```properties
# Configurações padrão de email (usadas quando não é possível determinar o provedor)
spring.mail.host=${MAIL_HOST:smtp.gmail.com}
spring.mail.port=${MAIL_PORT:587}
spring.mail.username=${MAIL_USERNAME:memuvie.app@gmail.com}
spring.mail.password=${MAIL_PASSWORD:sua-senha-de-app}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

### 2. Configurações Específicas por Provedor

Cada provedor tem suas próprias configurações:

```properties
# Gmail
mail.provider.gmail.host=smtp.gmail.com
mail.provider.gmail.port=587
mail.provider.gmail.auth=true
mail.provider.gmail.starttls=true

# Outlook/Hotmail
mail.provider.outlook.host=smtp.office365.com
mail.provider.outlook.port=587
mail.provider.outlook.auth=true
mail.provider.outlook.starttls=true

# iCloud
mail.provider.icloud.host=smtp.mail.me.com
mail.provider.icloud.port=587
mail.provider.icloud.auth=true
mail.provider.icloud.starttls=true
```

### 3. Configuração das Credenciais

Para cada provedor, você precisa configurar as credenciais de envio. Isto pode ser feito:

1. Diretamente no arquivo `application.properties` (não recomendado para ambientes de produção)
2. Por variáveis de ambiente (método recomendado)
3. Por configuração externa (application-prod.properties ou similar)

### 4. Variáveis de Ambiente Necessárias

Para produção, configure as seguintes variáveis de ambiente:

```shell
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=seu-email@gmail.com
MAIL_PASSWORD=sua-senha-de-app
FRONTEND_URL=https://seusite.com
```

## Notas Importantes sobre Autenticação

### Gmail

- Ative a autenticação de dois fatores em sua conta Google
- Gere uma "Senha de App" específica para o aplicativo em [Google Account Security](https://myaccount.google.com/security)
- Use esta senha no lugar da senha normal da conta

### Outlook/Hotmail

- Use sua senha normal ou gere uma senha de app se usar autenticação de dois fatores
- Para contas Microsoft 365 Business, você pode precisar de permissões adicionais

### iCloud

- Ative a autenticação de dois fatores
- Gere uma senha específica para aplicativo em Configurações da Conta > Segurança > Gerar Senha

## Troubleshooting

### Problemas Comuns e Soluções

1. **Erro de Autenticação**
   - Verifique se as credenciais estão corretas
   - Para Gmail, certifique-se de estar usando uma Senha de App
   - Verifique se a conta não está bloqueada por tentativas de login suspeitas

2. **Erro de Conexão**
   - Verifique se as portas SMTP não estão bloqueadas pelo firewall
   - Certifique-se de que o host SMTP está correto para o provedor

3. **Email não chega**
   - Verifique a pasta de spam do destinatário
   - Verifique se o domínio do remetente tem configurações SPF/DKIM adequadas
   - Aumente os tempos limite de conexão se necessário

### Logs

Para diagnóstico, ative logs detalhados adicionando no application.properties:

```properties
logging.level.org.springframework.mail=DEBUG
```

## Implementação Avançada

Para uma configuração mais robusta em ambiente de produção:

1. Implemente um sistema de fila para emails (RabbitMQ, ActiveMQ, etc.)
2. Adicione retry automático para emails que falham
3. Considere usar um serviço especializado como SendGrid, Amazon SES ou Mailgun