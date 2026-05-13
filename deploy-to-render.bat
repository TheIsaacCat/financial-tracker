@echo off
setlocal

echo.
echo Financial Tracker - Render Deployment Check
echo ===========================================
echo.

docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not installed or is not on PATH.
    echo Install Docker first, then rerun this script.
    exit /b 1
)

echo OK: Docker is available

if not exist ".git" (
    echo ERROR: This directory is not a git repository.
    echo Run git init, commit the project, and push it to GitHub/GitLab before deploying.
    exit /b 1
)

echo OK: Git repository found

for %%f in (
    "render.yaml"
    "backend\package.json"
    "backend\Dockerfile"
    "backend\src\index.js"
    "frontend\package.json"
    "frontend\Dockerfile"
    "frontend\app\dashboard\page.js"
) do (
    if not exist %%f (
        echo ERROR: Required file missing: %%f
        exit /b 1
    )
)

echo OK: Required deployment files present
echo.
echo Building backend image...
docker build -t financial-tracker-backend ./backend
if errorlevel 1 exit /b 1

echo.
echo Building frontend image...
docker build -t financial-tracker-frontend ./frontend
if errorlevel 1 exit /b 1

echo.
echo Docker builds completed.
echo.
echo Next steps:
echo 1. Push this repo to GitHub/GitLab.
echo 2. In Render, create a new Blueprint from this repo.
echo 3. Fill in the sync:false environment variables.
echo 4. After first deploy, update FRONTEND_URL and NEXT_PUBLIC_API_URL with the real service URLs.
echo.
echo See RENDER_DEPLOYMENT.md for the full walkthrough.

endlocal
