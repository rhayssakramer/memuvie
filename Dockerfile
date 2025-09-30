FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY backend/ .
RUN chmod +x ./mvnw
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# Instalar curl para healthcheck
RUN apk add --no-cache curl

COPY --from=builder /app/target/revelacao-cha-*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=prod"]