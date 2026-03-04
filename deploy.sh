#!/usr/bin/env bash
set -euo pipefail

# Ensure Strapi is reachable before building
if ! curl -sf http://localhost:1337/api/skills > /dev/null 2>&1; then
  echo "❌ Strapi is not running on localhost:1337"
  echo "   Start it: cd ~/strapi-cms/strapi-app && npm run develop"
  exit 1
fi

echo "✅ Strapi is up"

# Build static site (fetches from Strapi at build time)
echo "🔨 Building..."
pnpm build

# Deploy the build/ directory to Vercel as static files
echo "🚀 Deploying to Vercel..."
npx vercel deploy build --prod

echo "✅ Done!"
