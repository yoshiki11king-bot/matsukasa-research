#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
echo "Matsukasa Local Press を起動します。"
echo "ブラウザで http://localhost:3000/local-press を開いてください。"
echo ""
if [ ! -d "node_modules" ]; then
  echo "node_modules がないため npm install を実行します。"
  npm install
fi
ENABLE_LOCAL_PRESS=true npm run dev
