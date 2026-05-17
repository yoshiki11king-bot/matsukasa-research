#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
ENABLE_LOCAL_PRESS=true npm run dev
