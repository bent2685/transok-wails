#!/usr/bin/env bash
# Build the dash (download page) source and emit the artifacts into
# backend/app/templates/downpage so `go:embed` picks them up on the next
# `wails build` / `go build`.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="$ROOT_DIR/backend/app/templates/downpage"

cd "$ROOT_DIR"

if [ ! -d "dash/node_modules" ]; then
  echo "[build-dash] installing dash dependencies..."
  pnpm -F transok-download install
fi

echo "[build-dash] building dash -> $OUT_DIR"
pnpm -F transok-download build

echo "[build-dash] done. embedded assets:"
ls -lh "$OUT_DIR" "$OUT_DIR/assets"
