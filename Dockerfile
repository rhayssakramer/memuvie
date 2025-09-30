FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY backend/ .
RUN chmod +x ./mvnw
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Instalar curl para healthcheck
RUN apk add --no-cache curl

# Criar diretório para uploads
RUN mkdir -p /uploads/memuvie

COPY --from=builder /app/target/revelacao-cha-*.jar app.jar

EXPOSE 8080

# Usar variável de ambiente para definir o perfil
ENV SPRING_PROFILES_ACTIVE=prod

ENTRYPOINT ["java", "-jar", "app.jar"]