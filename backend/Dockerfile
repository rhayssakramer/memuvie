# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copiar arquivo de projeto
COPY EventoAPI.csproj .
RUN dotnet restore

# Copiar código fonte e outras arquivos
COPY . .

# Build da aplicação
RUN dotnet publish -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app

# Criar diretório de uploads
RUN mkdir -p /app/uploads

# Copiar aplicação publicada
COPY --from=build /app/publish .

# Expor porta padrão do Render
EXPOSE 5000

# Variáveis de ambiente padrão
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Executar aplicação
ENTRYPOINT ["dotnet", "EventoAPI.dll"]
