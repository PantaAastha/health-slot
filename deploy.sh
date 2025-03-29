#!/bin/bash

# Exit on errors
set -e

echo "➡ Step 1: Building project..."
yarn build

echo "➡ Step 2: Preparing deployment..."
cd dist

# Initialize temporary repo
git init
git checkout -b main
git add -A
git commit -m "Deploy $(date +'%Y-%m-%d %H:%M:%S')"

echo "➡ Step 3: Pushing to GitHub..."
git remote add origin https://github.com/PantaAastha/health-slot.git
git push -f origin main:gh-pages

echo "✅ Deployment successful! Your app is live at:"
echo "https://PantaAastha.github.io/health-slot/"