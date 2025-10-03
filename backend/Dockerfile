# Multi-stage build para otimizar o tamanho da imagem
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Copiar arquivos de configuração do Maven
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
COPY mvnw.cmd .

# Dar permissão de execução
RUN chmod +x ./mvnw

# Baixar dependências primeiro (para cache do Docker)
RUN ./mvnw dependency:go-offline -B

# Copiar código fonte
COPY src src

# Compilar aplicação
RUN ./mvnw clean package -DskipTests

# Segunda stage - runtime
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Instalar curl para healthcheck
RUN apk add --no-cache curl

# Copiar JAR da primeira stage
COPY --from=builder /app/target/revelacao-cha-0.0.1-SNAPSHOT.jar app.jar

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Mudar ownership do app para o usuário criado
RUN chown -R appuser:appgroup /app
USER appuser

# Expor porta
EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/api/actuator/health || exit 1

# Comando de execução com otimizações JVM compatíveis
ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-XX:+UseG1GC", \
    "-Dspring.profiles.active=prod", \
    "-jar", "app.jar"]

