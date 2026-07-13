#!/bin/bash
set -e

# ============================================================
# Deployment Script for Shared Hosting (cPanel + SSH)
# ============================================================
# Usage: ./deploy/deploy.sh
#
# Prerequisites:
#   - SSH access to hosting
#   - Node.js + PM2 on hosting
#   - rsync installed locally
# ============================================================

# --- CONFIGURATION (edit these) ---
REMOTE_USER="jemputma"
REMOTE_HOST="sakura"
REMOTE_DOMAIN_DIR="gentle-emerald-armadillo.103-10-78-80.cpanel.site"
REMOTE_BACKEND_DIR="insurance-backend"
BACKEND_PORT=3001

# The public URL where your backend will be accessible
BACKEND_URL="http://${REMOTE_DOMAIN_DIR}:${BACKEND_PORT}"

# --- COLORS ---
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== Insurance App Deployment ===${NC}\n"

# --- STEP 1: Build Frontend ---
echo -e "${YELLOW}[1/5] Building frontend...${NC}"
NEXT_PUBLIC_BACKEND_URL="${BACKEND_URL}" \
NEXT_PUBLIC_SENANGPAY_MERCHANT_ID="${NEXT_PUBLIC_SENANGPAY_MERCHANT_ID:-}" \
NODE_ENV=production \
npm run build

echo "  Frontend built -> out/"

# --- STEP 2: Build Backend ---
echo -e "${YELLOW}[2/5] Building backend...${NC}"
cd backend
npm run build
echo "  Backend built -> backend/dist/"
cd ..

# --- STEP 3: Upload Frontend ---
echo -e "${YELLOW}[3/5] Uploading frontend to shared hosting...${NC}"
rsync -avz --delete \
  out/ \
  "${REMOTE_USER}@${REMOTE_HOST}:~/${REMOTE_DOMAIN_DIR}/pj-insurance/"

# Upload .htaccess to the domain root (not inside pj-insurance)
scp deploy/.htaccess "${REMOTE_USER}@${REMOTE_HOST}:~/${REMOTE_DOMAIN_DIR}/.htaccess"

echo "  Frontend uploaded to ~/${REMOTE_DOMAIN_DIR}/pj-insurance/"

# --- STEP 4: Upload Backend ---
echo -e "${YELLOW}[4/5] Uploading backend to shared hosting...${NC}"
rsync -avz --delete \
  --exclude='node_modules' \
  --exclude='.env' \
  --exclude='src' \
  backend/dist/ \
  backend/package.json \
  backend/package-lock.json \
  backend/ecosystem.config.cjs \
  "${REMOTE_USER}@${REMOTE_HOST}:~/${REMOTE_BACKEND_DIR}/"

echo "  Backend uploaded to ~/${REMOTE_BACKEND_DIR}/"
echo ""
echo -e "${YELLOW}[5/5] Remote setup required (run once on server):${NC}"
echo ""
echo "  ssh ${REMOTE_USER}@${REMOTE_HOST}"
echo "  cd ~/${REMOTE_BACKEND_DIR}"
echo "  npm install --production"
echo "  # Create .env file with your secrets (see backend/.env.production.example)"
echo "  pm2 start ecosystem.config.cjs"
echo "  pm2 save"
echo ""
echo -e "${GREEN}=== Deployment Complete ===${NC}"
echo ""
echo "Frontend: http://${REMOTE_DOMAIN_DIR}/pj-insurance/"
echo "Backend:  ${BACKEND_URL}/api/health"
