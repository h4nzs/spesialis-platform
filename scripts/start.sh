#!/usr/bin/env bash
set -e

MODE="${1:-dev}"
SEED=false

if [[ "$MODE" == "dev" ]]; then
  if [[ "$*" == *"--seed"* ]]; then SEED=true; fi

  echo "🚀 Spesialis Platform — Development Mode"

  # ─── .env ──────────────────────────────────────────────────────
  if [ ! -f .env ]; then
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo "⚠️  Edit JWT_SECRET in .env before production use"
  fi

  # ─── Docker dependencies ──────────────────────────────────────
  echo "🐘 Starting PostgreSQL..."
  docker compose up -d postgres

  # ─── Mailpit (optional) ────────────────────────────────────────
  if [[ "$*" == *"--mail"* ]]; then
    echo "📧 Starting Mailpit..."
    docker compose --profile mail up -d
  fi

  # ─── Redis (optional) ──────────────────────────────────────────
  if [[ "$*" == *"--redis"* ]]; then
    echo "⚡ Starting Redis..."
    docker compose --profile cache up -d
  fi

  # ─── Wait for PostgreSQL ──────────────────────────────────────
  echo -n "⏳ Waiting for PostgreSQL"
  until docker compose exec -T postgres pg_isready -U specialist > /dev/null 2>&1; do
    echo -n "."
    sleep 2
  done
  echo " ✅"

  # ─── Migrate ──────────────────────────────────────────────────
  echo "📦 Running database migrations..."
  pnpm --filter @specialist/database db:migrate

  # ─── Seed ──────────────────────────────────────────────────────
  if $SEED; then
    echo "🌱 Seeding database..."
    pnpm --filter @specialist/api db:seed
  fi

  # ─── Start dev servers ────────────────────────────────────────
  echo "🚀 Starting API (port 3000) & Web (port 4321)..."
  echo ""
  echo "  Frontend : http://localhost:4321"
  echo "  API      : http://localhost:3000"
  echo "  Health   : http://localhost:3000/api/v1/health"
  echo ""
  pnpm dev

elif [[ "$MODE" == "prod" ]]; then
  echo "🚀 Spesialis Platform — Production Mode"

  # ─── Check .env ───────────────────────────────────────────────
  if [ ! -f .env ]; then
    echo "❌ .env not found! Create from .env.example and configure secrets."
    exit 1
  fi

  # ─── Build ────────────────────────────────────────────────────
  echo "🔨 Building all apps..."
  pnpm install
  pnpm build

  # ─── Start full stack ────────────────────────────────────────
  echo "🐘 Starting PostgreSQL & services..."
  docker compose up -d postgres

  echo -n "⏳ Waiting for PostgreSQL"
  until docker compose exec -T postgres pg_isready -U specialist > /dev/null 2>&1; do
    echo -n "."
    sleep 2
  done
  echo " ✅"

  # ─── Migrate ──────────────────────────────────────────────────
  echo "📦 Running database migrations..."
  pnpm --filter @specialist/database db:migrate

  # ─── Seed if --seed flag ──────────────────────────────────────
  if [[ "$*" == *"--seed"* ]]; then
    echo "🌱 Seeding database..."
    pnpm --filter @specialist/api db:seed
  fi

  # ─── Start API as daemon ──────────────────────────────────────
  echo "🚀 Starting API (port 3000)..."
  pnpm --filter @specialist/api start &
  API_PID=$!
  sleep 2

  # ─── Start Web (built, served via Astro) ──────────────────────
  echo "🌐 Starting Web (port 4321)..."
  pnpm --filter web preview --host &
  WEB_PID=$!

  # ─── Trap to clean up ─────────────────────────────────────────
  cleanup() {
    echo ""
    echo "🛑 Stopping..."
    kill $API_PID $WEB_PID 2>/dev/null
    exit 0
  }
  trap cleanup SIGINT SIGTERM

  echo ""
  echo "  Frontend : http://localhost:4321"
  echo "  API      : http://localhost:3000"
  echo "  Health   : http://localhost:3000/api/v1/health"
  echo "  PID API  : $API_PID"
  echo "  PID Web  : $WEB_PID"
  echo "  Ctrl+C to stop all"
  echo ""

  wait

elif [[ "$MODE" == "reset" ]]; then
  echo "🔄 Resetting platform..."
  docker compose down -v 2>/dev/null || true
  echo "  Containers & volumes removed"
  echo "  Run 'bash scripts/start.sh dev --seed' to start fresh"

elif [[ "$MODE" == "status" ]]; then
  echo "📊 Platform Status"
  docker compose ps 2>/dev/null || echo "  Docker not running"
  echo ""
  if lsof -i :3000 > /dev/null 2>&1; then
    echo "  API      :3000 — running"
  else
    echo "  API      :3000 — stopped"
  fi
  if lsof -i :4321 > /dev/null 2>&1; then
    echo "  Web      :4321 — running"
  else
    echo "  Web      :4321 — stopped"
  fi

else
  echo "Usage: bash scripts/start.sh <mode> [--seed] [--mail] [--cms] [--redis]"
  echo ""
  echo "Modes:"
  echo "  dev       Start development environment (default)"
  echo "  prod      Build & start production environment"
  echo "  reset     Remove all containers and volumes"
  echo "  status    Show running services"
  echo ""
  echo "Flags:"
  echo "  --seed    Seed database with demo data"
  echo "  --mail    Start Mailpit (email dev UI at :8025)"
  echo "  --redis   Start Redis (optional — in-memory fallback used otherwise)"

fi
