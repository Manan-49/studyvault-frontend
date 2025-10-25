#!/bin/bash
# deploy.sh - Complete Netlify Deployment Script

set -e  # Exit on error

echo "🚀 StudyVault Frontend Deployment"
echo "=================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="https://cutting-array-treasures-aus.trycloudflare.com"
REPO_NAME="studyvault-frontend"
GITHUB_USERNAME="YOUR_GITHUB_USERNAME"  # ⚠️ CHANGE THIS

echo ""
echo -e "${BLUE}📝 Configuration:${NC}"
echo "   Backend URL: $BACKEND_URL"
echo "   GitHub User: $GITHUB_USERNAME"
echo ""

# Step 1: Create netlify.toml
echo -e "${BLUE}📄 Creating netlify.toml...${NC}"
cat > netlify.toml << 'EOF'
[build]
  command = "npm run build"
  publish = ".next"
  
[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"
  NEXT_TELEMETRY_DISABLED = "1"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  force = false

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    X-XSS-Protection = "1; mode=block"

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
    Service-Worker-Allowed = "/"

[[headers]]
  for = "/manifest.json"
  [headers.values]
    Content-Type = "application/manifest+json"
    Cache-Control = "public, max-age=0, must-revalidate"

[[headers]]
  for = "/_next/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
EOF

echo -e "${GREEN}✅ netlify.toml created${NC}"

# Step 2: Create .nvmrc
echo -e "${BLUE}📄 Creating .nvmrc...${NC}"
echo "18" > .nvmrc
echo -e "${GREEN}✅ .nvmrc created${NC}"

# Step 3: Update .gitignore
echo -e "${BLUE}📄 Updating .gitignore...${NC}"
if ! grep -q ".env.local" .gitignore 2>/dev/null; then
  cat >> .gitignore << 'EOF'

# Local env files
.env.local
.env*.local
.env

# Netlify
.netlify
EOF
  echo -e "${GREEN}✅ .gitignore updated${NC}"
else
  echo -e "${GREEN}✅ .gitignore already configured${NC}"
fi

# Step 4: Initialize git (if not already)
if [ ! -d .git ]; then
  echo -e "${BLUE}🔧 Initializing git repository...${NC}"
  git init
  git branch -M main
  echo -e "${GREEN}✅ Git initialized${NC}"
else
  echo -e "${GREEN}✅ Git already initialized${NC}"
fi

# Step 5: Commit changes
echo -e "${BLUE}💾 Committing changes...${NC}"
git add .
git commit -m "Add Netlify configuration for PWA deployment" || echo "No changes to commit"
echo -e "${GREEN}✅ Changes committed${NC}"

# Step 6: Add remote (if not exists)
if ! git remote | grep -q origin; then
  echo -e "${BLUE}🔗 Adding GitHub remote...${NC}"
  git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
  echo -e "${GREEN}✅ Remote added${NC}"
else
  echo -e "${GREEN}✅ Remote already exists${NC}"
fi

# Step 7: Push to GitHub
echo -e "${BLUE}📤 Pushing to GitHub...${NC}"
echo ""
echo -e "${RED}⚠️  You may need to authenticate with GitHub${NC}"
echo ""
git push -u origin main || {
  echo -e "${RED}❌ Push failed. Please check:${NC}"
  echo "   1. GitHub repository exists: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
  echo "   2. You have push permissions"
  echo "   3. Run manually: git push -u origin main"
  exit 1
}
echo -e "${GREEN}✅ Pushed to GitHub${NC}"

# Step 8: Install Netlify CLI (if not installed)
if ! command -v netlify &> /dev/null; then
  echo -e "${BLUE}📦 Installing Netlify CLI...${NC}"
  npm install -g netlify-cli
  echo -e "${GREEN}✅ Netlify CLI installed${NC}"
else
  echo -e "${GREEN}✅ Netlify CLI already installed${NC}"
fi

# Step 9: Login to Netlify
echo -e "${BLUE}🔐 Logging in to Netlify...${NC}"
netlify login

# Step 10: Initialize Netlify site
echo -e "${BLUE}🌐 Initializing Netlify site...${NC}"
netlify init

# Step 11: Set environment variables
echo -e "${BLUE}🔧 Setting environment variables...${NC}"
netlify env:set NEXT_PUBLIC_API_URL "$BACKEND_URL"
netlify env:set NEXT_PUBLIC_WS_URL "$BACKEND_URL"
netlify env:set NEXT_PUBLIC_APP_NAME "StudyVault"
echo -e "${GREEN}✅ Environment variables set${NC}"

# Step 12: Deploy
echo -e "${BLUE}🚀 Deploying to Netlify...${NC}"
netlify deploy --prod

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo "   1. Copy your Netlify URL from above"
echo "   2. Update backend CORS_ORIGINS with Netlify URL"
echo "   3. Test your PWA!"
echo ""
echo -e "${BLUE}🔗 Useful Commands:${NC}"
echo "   netlify open       - Open Netlify dashboard"
echo "   netlify logs       - View deployment logs"
echo "   netlify env:list   - List environment variables"
echo ""