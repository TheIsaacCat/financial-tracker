#!/bin/bash

set -e

echo "Financial Tracker - Render Deployment Check"
echo "==========================================="
echo ""

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: Docker is not installed or is not on PATH."
  echo "Install Docker first, then rerun this script."
  exit 1
fi

echo "OK: Docker is available"

if [ ! -d ".git" ]; then
  echo "ERROR: This directory is not a git repository."
  echo "Run git init, commit the project, and push it to GitHub/GitLab before deploying."
  exit 1
fi

echo "OK: Git repository found"

required_files=(
  "render.yaml"
  "backend/package.json"
  "backend/Dockerfile"
  "backend/src/index.js"
  "frontend/package.json"
  "frontend/Dockerfile"
  "frontend/app/dashboard/page.js"
)

for file in "${required_files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "ERROR: Required file missing: $file"
    exit 1
  fi
done

echo "OK: Required deployment files present"
echo ""
echo "Building backend image..."
docker build -t financial-tracker-backend ./backend

echo ""
echo "Building frontend image..."
docker build -t financial-tracker-frontend ./frontend

echo ""
echo "Docker builds completed."
echo ""
echo "Next steps:"
echo "1. Push this repo to GitHub/GitLab."
echo "2. In Render, create a new Blueprint from this repo."
echo "3. Fill in the sync:false environment variables."
echo "4. After first deploy, update FRONTEND_URL and NEXT_PUBLIC_API_URL with the real service URLs."
echo ""
echo "See RENDER_DEPLOYMENT.md for the full walkthrough."
