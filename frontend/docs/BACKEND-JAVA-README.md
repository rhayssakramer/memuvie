# Backend Java 21 – Clean Architecture, Swagger, Auth, Postgres, Docker

Este documento descreve um backend completo em Java 21 baseado em Spring Boot 3.x, com arquitetura limpa (camadas de apresentação, aplicação, domínio e infraestrutura), autenticação simples (JWT), documentação via Swagger/OpenAPI, CORS habilitado para o front Angular, persistência Postgres, e conteinerização com Docker/Docker Compose. O objetivo é fornecer um guia implementável que o time possa seguir para criar o serviço que conecta com o frontend atual do projeto.

## Objetivos
- Java 21, Spring Boot 3.x
- Clean Architecture (controllers → application/services → domain → infra)
- Autenticação simples (JWT) + rotas públicas/privadas
- Swagger UI para testar endpoints
- DTOs de entrada/saída, Entities do domínio
- Persistência Postgres via Spring Data JPA
- Migrações com Flyway
- Dockerfile e docker-compose para subir Postgres e a API
- CORS para o domínio do Angular (http://localhost:4200)

## Estrutura proposta
```
backend/
  pom.xml
  src/
    main/
      java/com/example/revelacao/
        api/                 # camada de apresentação (controllers, exception handlers)
          controller/
            AuthController.java
            PostController.java
          dto/
            auth/
              LoginRequest.java
              LoginResponse.java
              RegisterRequest.java
            post/
              CreatePostRequest.java
              PostResponse.java
          exception/
            ApiExceptionHandler.java
            BusinessException.java
            NotFoundException.java
        application/         # regras de caso de uso (services, ports)
          service/
            AuthService.java
            PostService.java
          security/
            JwtService.java
            PasswordService.java
        domain/              # entidades e contratos de domínio
          model/
            User.java
            Post.java
            MediaType.java
          repository/        # ports (interfaces)
            UserRepositoryPort.java
            PostRepositoryPort.java
        infrastructure/      # adapters (db, security, config)
          config/
            OpenApiConfig.java
            CorsConfig.java
            SecurityConfig.java
          persistence/
            entity/
              UserEntity.java
              PostEntity.java
            repository/
              UserRepository.java
              PostRepository.java
            mapper/
              UserMapper.java
              PostMapper.java
          security/
            JwtServiceImpl.java
            PasswordServiceImpl.java
      resources/
        application.yml
        db/migration/
          V1__init.sql
    test/
```

## Dependências (pom.xml)
- Spring Boot starters: web, validation, data-jpa, security
- PostgreSQL Driver
- Flyway
- Lombok (opcional para reduzir boilerplate)
- springdoc-openapi-starter (Swagger)
- JWT (jjwt-api, jjwt-impl, jjwt-jackson)

Exemplo (trechos relevantes):
```
<properties>
  <java.version>21</java.version>
  <spring-boot.version>3.3.4</spring-boot.version>
</properties>

<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
  </dependency>
  <dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
  </dependency>
  <dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
  </dependency>
  <dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
  </dependency>
  <dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.5.0</version>
  </dependency>
  <dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.5</version>
  </dependency>
  <dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
  </dependency>
  <dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
  </dependency>
</dependencies>
```

## Configuração (application.yml)
```
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/revelacao_db
    username: developer
    password: Luke@2020
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate.dialect: org.hibernate.dialect.PostgreSQLDialect
  flyway:
    enabled: true
    locations: classpath:db/migration

server:
  port: 8080

frontend:
  cors:
    allowed-origins:
      - http://localhost:4200
security:
  jwt:
    secret: "change-me-super-secret"
    expirationMinutes: 240
```

## Migração (Flyway – V1__init.sql)
```
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(191) NOT NULL,
  photo BYTEA NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS posts (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NULL,
  photo BYTEA NULL,
  video_url VARCHAR(512) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
```

## Domínio
- `User` (id, name, email, passwordHash, photo, createdAt)
- `Post` (id, userId, message, photo, videoUrl, createdAt)
- `MediaType` (PHOTO, VIDEO) – opcional para endpoints de upload

## DTOs (exemplos)
- Auth
  - `RegisterRequest { name, email, password, photoBase64? }`
  - `LoginRequest { email, password }`
  - `LoginResponse { token, user: { id, name, email, photoUrl? } }`
- Posts
  - `CreatePostRequest { message?, photoBase64?, videoUrl? }`
  - `PostResponse { id, userName, userPhotoUrl?, message, photoUrl?, videoUrl?, date }`

## Controllers (rotas-alvo para o frontend)
- `POST /api/auth/register` – cria usuário (hash de senha, opcional salvar foto)
- `POST /api/auth/login` – retorna JWT
- `GET /api/posts` – lista posts (paginado, ordem recente)
- `POST /api/posts` – cria post (mensagem + photoBase64 ou videoUrl)
- `GET /api/posts/{id}` – detalhado (opcional)
- `DELETE /api/posts/{id}` – opcional (admin)

Swagger UI: `GET /swagger-ui.html`

## Services (regras)
- `AuthService`: registrar, logar (validar hash), emitir JWT
- `PostService`: criar/listar posts, mapear para DTO de resposta com nome/foto do usuário

## Repositórios (ports/adapters)
- Ports no domínio (interfaces): `UserRepositoryPort`, `PostRepositoryPort`
- Adapters Spring Data (infra): `UserRepository`, `PostRepository`

## Segurança
- `PasswordService`: usar BCrypt (ou Argon2) para hash; em demo, BCrypt
- `JwtService`: gerar/validar JWT; guardar secret e expiração nas configs
- `SecurityConfig`: filtrar rotas, liberar `/api/auth/**`, proteger `/api/posts/**`

## Exceptions
- `BusinessException`, `NotFoundException`
- `ApiExceptionHandler` mapeia para HTTP status e mensagens JSON padrão

## CORS
Config via `CorsConfig` para permitir `http://localhost:4200` com métodos `GET,POST,DELETE,OPTIONS` e headers comuns.

## Docker
### Dockerfile (JDK 21, camadas)
```
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY mvnw pom.xml .
COPY .mvn .mvn
RUN ./mvnw -q -B -DskipTests dependency:go-offline
COPY src src
RUN ./mvnw -q -B -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/backend-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
```

### docker-compose.yml
```
version: "3.9"
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: revelacao_db
      POSTGRES_USER: developer
      POSTGRES_PASSWORD: Luke@2020
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
  api:
    build: ./backend
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/revelacao_db
      SPRING_DATASOURCE_USERNAME: developer
      SPRING_DATASOURCE_PASSWORD: Luke@2020
      FRONTEND_CORS_ALLOWED-ORIGINS: http://localhost:4200
      SECURITY_JWT_SECRET: change-me-super-secret
      SECURITY_JWT_EXPIRATIONMINUTES: 240
    ports:
      - "8080:8080"
    depends_on:
      - db
volumes:
  pgdata:
```

## Integração com o Frontend atual
- Substituir o login local:
  - Front chama `POST /api/auth/login` com `{ email, password }`, recebe `{ token, user }`
  - Salvar token no localStorage e usar em requisições autenticadas com header `Authorization: Bearer <token>`
- Criar Perfil:
  - Front chama `POST /api/auth/register` com `{ name, email, password, photoBase64? }` e em seguida login automático
- Postagem:
  - Front chama `POST /api/posts` com `{ message?, photoBase64?, videoUrl? }`
  - Listagem via `GET /api/posts`
- CORS: backend libera `http://localhost:4200`

## Como rodar (dev local)
1. Subir Postgres (opções):
   - Via Docker: `docker compose up -d db`
   - Localmente instalado: crie DB/usuário conforme application.yml
2. Rodar a API:
   - `./mvnw spring-boot:run` (ou via IDE)
3. Swagger: acesse `http://localhost:8080/swagger-ui.html`

## Testes (sugestões)
- Tests de serviço (AuthService, PostService)
- Tests de controller com WebMvcTest
- Testes de repositório com DataJpaTest (usando Testcontainers para Postgres)

## Observações finais
- Senhas: use BCrypt com força adequada (ex.: `BCryptPasswordEncoder`)
- Tokens: mantenha `secret` seguro (não commitar em repositório público)
- Migração: use Flyway para evoluções do schema
- Armazenamento de fotos: em MVP, guardar `BYTEA` ou externalizar para S3 e salvar a URL
- Logs e Observabilidade: considerar Spring Boot Actuator, logs JSON e tracing (futuro)
