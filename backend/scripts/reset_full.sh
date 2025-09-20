#!/usr/bin/env bash
set -euo pipefail

# Reset completo (destrutivo) - remove volume de dados do Postgres e recria tudo
# Uso: ./scripts/reset_full.sh

echo "[1/5] Derrubando containers (removendo volumes) ..."
docker compose down -v || true

echo "[2/5] Limpando imagens dangling (opcional) ..."
docker image prune -f || true

echo "[3/5] Recriando containers (build forçado) ..."
docker compose up -d --build --force-recreate postgres

echo "[4/5] Aguardando Postgres ficar saudável ..."
ATTEMPTS=30
until docker compose ps | grep revelacao-cha-postgres | grep -qi "healthy"; do
  ((ATTEMPTS--)) || { echo "Postgres não ficou healthy a tempo"; exit 1; }
  sleep 2
  echo "  ... aguardando Postgres (faltam $ATTEMPTS tentativas)"
done

echo "[5/5] Subindo aplicação ..."
docker compose up -d --build --force-recreate app

echo "Logs iniciais (CTRL+C para sair):"
docker compose logs -f app

