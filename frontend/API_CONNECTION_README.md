# Configuração de Conexão Frontend-Backend

Este documento explica como o frontend Angular se conecta ao backend Spring Boot no projeto Memuvie.

## Estrutura de Conexão

### Configuração do Backend
O backend está configurado para ser executado na porta 8080 com os seguintes parâmetros no arquivo `backend/src/main/resources/application.properties`:

```properties
# Configurações de servidor
server.port=8080
```

### Configuração do Frontend
A conexão com o backend é configurada através dos seguintes componentes:

1. **Arquivos de ambiente**: Localizado em `src/environments/` que definem a URL base da API:
   - `environment.ts` (desenvolvimento)
   - `environment.prod.ts` (produção)

2. **Serviços Angular**: Os serviços injetam a URL da API e fornecem métodos para comunicação:
   - `AuthService`: Para autenticação e registro
   - `EventoService`: Para gerenciar eventos
   - `GaleriaService`: Para gerenciar a galeria de posts
   - `FileUploadService`: Para gerenciar uploads de arquivos

3. **Proxy de desenvolvimento**: Um arquivo `proxy.conf.json` que redireciona chamadas de API em desenvolvimento para evitar problemas de CORS.

## Como os Componentes Usam os Serviços

Os componentes agora dependem de serviços injetados para comunicação com o backend:

```typescript
constructor(private authService: AuthService) {}

login() {
  this.authService.login(credentials).subscribe(response => {
    // Processar resposta
  });
}
```

## Fluxo de Autenticação

1. O usuário faz login no frontend
2. O frontend envia credenciais para o backend via `AuthService`
3. O backend valida e retorna um token JWT
4. O token é armazenado no localStorage e incluído em requisições subsequentes via `AuthInterceptor`

## Tratamento de Erros

Todos os serviços implementam tratamento de erros para lidar com falhas na comunicação:
- Timeout
- Credenciais inválidas
- Serviço indisponível

## Modo de Fallback Local

Para garantir que a aplicação funcione mesmo sem o backend, implementamos um modo de fallback que usa o armazenamento local:

```typescript
this.authService.login(credentials).subscribe({
  next: (response) => {
    // Processar resposta do backend
  },
  error: () => {
    // Fallback para modo local
  }
});
```

## Como Executar

1. **Backend**: Execute o Spring Boot na porta 8080
2. **Frontend**: Execute `npm start` para iniciar com o proxy configurado

## Configurações Adicionais

- **CORS**: O backend foi configurado para aceitar solicitações do frontend
- **Tamanho de Upload**: Configurado para até 100MB para suportar uploads de mídia
- **JWT**: Token JWT configurado para expirar em 24 horas