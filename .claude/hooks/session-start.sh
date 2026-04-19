#!/bin/bash
# SessionStart hook: bootstrap the workspace so tests and linters run.
# Idempotent — safe to run on every session start.
set -euo pipefail

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}"

log() { printf '[session-start] %s\n' "$*"; }

# Node.js / npm
if [ -f package.json ]; then
  if command -v npm >/dev/null 2>&1; then
    log "Installing npm dependencies"
    npm install --no-audit --no-fund --silent || log "npm install failed (continuing)"
  else
    log "package.json found but npm not installed"
  fi
fi

# Python — pip/requirements
if [ -f requirements.txt ]; then
  if command -v pip >/dev/null 2>&1; then
    log "Installing Python requirements"
    pip install --quiet -r requirements.txt || log "pip install failed (continuing)"
  fi
fi

# Python — Poetry
if [ -f pyproject.toml ] && command -v poetry >/dev/null 2>&1; then
  log "Installing Poetry dependencies"
  poetry install --no-interaction --no-ansi || log "poetry install failed (continuing)"
fi

# Rust
if [ -f Cargo.toml ] && command -v cargo >/dev/null 2>&1; then
  log "Fetching Cargo dependencies"
  cargo fetch --quiet || log "cargo fetch failed (continuing)"
fi

# Go
if [ -f go.mod ] && command -v go >/dev/null 2>&1; then
  log "Downloading Go modules"
  go mod download || log "go mod download failed (continuing)"
fi

# Ruby
if [ -f Gemfile ] && command -v bundle >/dev/null 2>&1; then
  log "Installing Ruby gems"
  bundle install --quiet || log "bundle install failed (continuing)"
fi

log "Bootstrap complete"
