# Multi-stage build para otimizar o tamanho da imagem
FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine AS builder

WORKDIR /app

# Copiar arquivo de projeto
COPY EventoAPI.csproj .
COPY global.json .

# Restaurar dependências (para cache do Docker)
RUN dotnet restore EventoAPI.csproj

# Copiar código fonte
COPY Program.cs .
COPY src src
COPY Migrations Migrations
COPY Properties Properties
COPY appsettings.json .
COPY appsettings.Production.json .
COPY appsettings.Homolog.json .

# Compilar aplicação
RUN dotnet publish EventoAPI.csproj -c Release -o /app/publish --no-restore

# Segunda stage - runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine

WORKDIR /app

# Copiar aplicação publicada da primeira stage
COPY --from=builder /app/publish .

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup && \
    chown -R appuser:appgroup /app

USER appuser

# Expor porta padrão do Render
EXPOSE 8080

# Variáveis de ambiente padrão
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD wget -q -O- http://localhost:8080/health || exit 1

# Comando de execução
ENTRYPOINT ["dotnet", "EventoAPI.dll"]
