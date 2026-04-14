#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

set -a
source "$ROOT_DIR/.env"
set +a

exec bun run "$ROOT_DIR/src/server.ts"
