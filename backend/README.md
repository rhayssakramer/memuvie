# API Chá Revelação

API para gerenciamento de usuários, eventos e votos (palpites de sexo do bebê) com autenticação JWT, documentação Swagger (Springdoc) e acesso administrativo ao banco via Adminer.

## Sumário
- [Stack Tecnológica](#stack-tecnológica)
- [Arquitetura e Principais Componentes](#arquitetura-e-principais-componentes)
- [Executando o Projeto](#executando-o-projeto)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Banco de Dados e Migrations (Flyway)](#banco-de-dados-e-migrations-flyway)
- [Autenticação e Segurança (JWT)](#autenticação-e-segurança-jwt)
- [Swagger / OpenAPI](#swagger--openapi)
- [Acesso ao Banco (Adminer)](#acesso-ao-banco-adminer)
- [Endpoints Principais](#endpoints-principais)
- [Fluxo de Uso Rápido](#fluxo-de-uso-rápido)
- [Exemplos cURL](#exemplos-curl)
- [Troubleshooting](#troubleshooting)
- [Próximas Evoluções Sugeridas](#próximas-evoluções-sugeridas)

## Stack Tecnológica
- **Java** 21
- **Spring Boot** 3.5.x
- **Spring Data JPA** (Hibernate)
- **Spring Security** (JWT stateless)
- **Flyway** (controle de schema)
- **PostgreSQL** 15
- **ModelMapper** (DTO ↔ entidade)
- **Springdoc OpenAPI** (Swagger UI)
- **Docker / Docker Compose**

## Arquitetura e Principais Componentes
| Camada | Descrição |
|--------|-----------|
| controller | Exposição dos endpoints REST |
| service | Regras de negócio (UsuarioService, EventoService, VotoService, JwtService) |
| repository | Interfaces Spring Data (UsuarioRepository, EventoRepository, VotoRepository) |
| security | Filtro JWT, UserDetailsService, EntryPoint |
| dto.request / dto.response | Objetos de transporte |
| exception | Exceções e handler global |
| model | Entidades JPA: Usuario, Evento, Voto |

## Executando o Projeto
### Via Docker (recomendado)
```bash
docker compose up -d --build
```
Logs:
```bash
docker compose logs -f app
```
Reset completo (DERRUBA E APAGA DADOS):
```bash
bash scripts/reset_full.sh
```
(Usar Git Bash / WSL no Windows)

### Sem Docker (necessário Postgres local rodando)
Ajuste `application.properties` ou use variáveis:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/revelacao_cha_db
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.jpa.hibernate.ddl-auto=validate
spring.flyway.enabled=true
```
Rodar:
```bash
./mvnw spring-boot:run
```

## Variáveis de Ambiente
Principais (definidas no docker-compose):
| Nome | Função |
|------|--------|
| SPRING_DATASOURCE_URL | URL JDBC do Postgres |
| SPRING_DATASOURCE_USERNAME / PASSWORD | Credenciais banco |
| SPRING_PROFILES_ACTIVE | Perfil ativo (docker) |
| SERVER_SERVLET_CONTEXT_PATH | Prefixo global (/api) |
| SPRING_JPA_HIBERNATE_DDL_AUTO | validate (não recria schema) |
| JWT_SECRET | Chave de assinatura do token |
| JWT_EXPIRATION | Expiração em ms |

## Banco de Dados e Migrations (Flyway)
Migrations em `src/main/resources/db/migration`:
```
V1__criar_tabela_usuarios.sql
V2__criar_tabela_eventos.sql
V3__criar_tabela_votos.sql
V4__ajustar_tipos_bigint.sql (se aplicável)
```
Se alterar migration já aplicada → usar `flyway repair` (serviço flyway) ou resetar volume.

Executar manualmente (ferramenta flyway opcional):
```bash
docker compose run --rm flyway migrate
# ou
docker compose run --rm flyway repair
```

## Autenticação e Segurança (JWT)
Fluxo:
1. `POST /auth/registrar` cria usuário (default: CONVIDADO)
2. `POST /auth/login` retorna `{ token: "<JWT>" }`
3. Enviar `Authorization: Bearer <token>` nos endpoints protegidos.

Usuários podem ter papéis: `ADMIN`, `ORGANIZADOR`, `CONVIDADO`.
Lógica de autorização adicional em services/controllers (ex: só dono altera evento).

## Swagger / OpenAPI
Disponível após subir:
- UI: http://localhost:8080/api/swagger-ui.html
- Docs JSON: http://localhost:8080/api/v3/api-docs
Botão **Authorize** → inserir: `Bearer <token>`

## Acesso ao Banco (Adminer)
Interface web para inspeção do PostgreSQL:
- URL: http://localhost:8081
- Sistema: PostgreSQL
- Servidor: `postgres`
- Banco: `revelacao_cha_db`
- Usuário/Senha: `postgres` / `postgres`

## Endpoints Principais
| Categoria | Método | Caminho | Auth |
|-----------|--------|---------|------|
| Auth | POST | /auth/registrar | Público |
| Auth | POST | /auth/login | Público |
| Usuário | GET | /usuarios/me | JWT |
| Usuário | GET | /usuarios/{id} | JWT |
| Usuário | GET | /usuarios | ADMIN |
| Eventos | POST | /eventos | JWT |
| Eventos | GET | /eventos | Público/JWT |
| Eventos | GET | /eventos/ativos | Público |
| Eventos | GET | /eventos/votacao-aberta | Público |
| Eventos | GET | /eventos/meus-eventos | JWT |
| Eventos | PUT | /eventos/{id} | Dono |
| Eventos | PUT | /eventos/{id}/revelar | Dono |
| Eventos | PUT | /eventos/{id}/encerrar-votacao | Dono |
| Votos | POST | /votos | JWT |
| Votos | GET | /votos | JWT |
| Votos | GET | /votos/evento/{id} | JWT (ou público dependendo de regra futura) |
| Votos | GET | /votos/evento/{id}/meu-voto | JWT |
| Votos | PUT | /votos/{id} | Autor do voto |
| Votos | DELETE | /votos/{id} | Autor do voto |

## Fluxo de Uso Rápido
1. Registrar usuário
2. Login (pegar token)
3. Criar evento
4. Listar eventos / votar
5. Revelar resultado (dono) ou encerrar votação

## Exemplos cURL
Registrar:
```bash
curl -X POST http://localhost:8080/api/auth/registrar \
 -H "Content-Type: application/json" \
 -d '{"nome":"Alice","email":"alice@example.com","senha":"senha123"}'
```
Login:
```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
 -H "Content-Type: application/json" \
 -d '{"email":"alice@example.com","senha":"senha123"}' | jq -r .token)
```
Criar evento:
```bash
curl -X POST http://localhost:8080/api/eventos \
 -H "Authorization: Bearer $TOKEN" \
 -H "Content-Type: application/json" \
 -d '{
  "titulo":"Chá João",
  "descricao":"Família",
  "dataEvento":"2025-10-10T15:00:00",
  "local":"Salão",
  "nomeMae":"Maria",
  "nomePai":"Carlos",
  "dataEncerramentoVotacao":"2025-10-05T23:59:00"
 }'
```
Votar:
```bash
curl -X POST http://localhost:8080/api/votos \
 -H "Authorization: Bearer $TOKEN" \
 -H "Content-Type: application/json" \
 -d '{"eventoId":1,"palpite":"MENINO","justificativa":"Intuição"}'
```
Listar votos do evento:
```bash
curl http://localhost:8080/api/votos/evento/1 -H "Authorization: Bearer $TOKEN"
```

## Troubleshooting
| Problema | Causa comum | Solução |
|----------|-------------|---------|
| 401 Unauthorized | Falta ou formato inválido de token | Verificar `Authorization: Bearer <token>` |
| 403 Forbidden | Sem permissão (não dono / não ADMIN) | Confirmar papel / dono recurso |
| Flyway checksum mismatch | Alterou migration aplicada | `docker compose run --rm flyway repair` ou reset volume |
| Schema inválido (tipo id) | Diferença SERIAL vs BIGINT | Aplicar migration de ajuste (V4) |
| Repositório não sobe | Falha no EntityManagerFactory | Verificar logs Flyway primeiro |

## Próximas Evoluções Sugeridas
- Endpoint para promover usuário a ORGANIZADOR / ADMIN
- Paginação nas listagens de eventos e votos
- Cache de consultas públicas (ex: eventos ativos)
- Rate limiting básico em /auth/login
- Testes de integração (Testcontainers) para pipeline CI

---
**Licença:** MIT

