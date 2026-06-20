@echo off
cd /d "%~dp0\.."
echo Matsukasa Local Press を起動します。
echo ブラウザで http://localhost:3000/local-press を開いてください。
if not exist node_modules (
  echo node_modules がないため npm install を実行します。
  npm install
)
set ENABLE_LOCAL_PRESS=true
npm run dev
