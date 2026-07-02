@echo off
setlocal

set "PROJECT_DIR=%~dp0"
set "FRONTEND_PORT=5173"
set "WORKER_PORT=8787"
set "FRONTEND_URL=http://localhost:%FRONTEND_PORT%/?proxy=http%%3A%%2F%%2Flocalhost%%3A%WORKER_PORT%"

cd /d "%PROJECT_DIR%"

if not exist ".dev.vars" (
  echo Creating .dev.vars template...
  > ".dev.vars" echo DEEPSEEK_API_KEY=your_deepseek_api_key
  >> ".dev.vars" echo DASHSCOPE_API_KEY=your_dashscope_api_key
  >> ".dev.vars" echo DASHSCOPE_WORKSPACE_ID=
  >> ".dev.vars" echo DASHSCOPE_TTS_MODEL=cosyvoice-v3-plus
  >> ".dev.vars" echo ALLOWED_ORIGIN=http://localhost:%FRONTEND_PORT%
  echo.
  echo Please fill .dev.vars with your real API keys, then run this script again.
  start notepad ".dev.vars"
  pause
  exit /b 1
)

where npx >nul 2>nul
if errorlevel 1 (
  echo Node.js/npm is required. Install Node.js first:
  echo https://nodejs.org/
  pause
  exit /b 1
)

set "PY_CMD="
where py >nul 2>nul
if not errorlevel 1 set "PY_CMD=py -3"

if not defined PY_CMD (
  where python >nul 2>nul
  if not errorlevel 1 set "PY_CMD=python"
)

if not defined PY_CMD (
  echo Python 3 is required for the local static web server.
  echo Install Python from Microsoft Store or https://www.python.org/downloads/
  pause
  exit /b 1
)

echo Starting Cloudflare Worker on http://localhost:%WORKER_PORT%
start "CosyVoice TTS Worker" /D "%PROJECT_DIR%" cmd /k npx --yes wrangler dev worker/doubao-tts-proxy.js --local --port %WORKER_PORT%

timeout /t 5 /nobreak >nul

echo Starting frontend on http://localhost:%FRONTEND_PORT%
start "CosyVoice TTS Frontend" /D "%PROJECT_DIR%" cmd /k %PY_CMD% -m http.server %FRONTEND_PORT%

timeout /t 2 /nobreak >nul

echo Opening %FRONTEND_URL%
start "" "%FRONTEND_URL%"

echo.
echo Local test is starting.
echo Keep both command windows open while testing.
echo Close those windows to stop the local servers.
pause
