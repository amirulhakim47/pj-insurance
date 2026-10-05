#!/usr/bin/env bash
# LOCAL ONLY: zip source for manual upload. Do NOT use as Hostinger "Build command".
# On Hostinger Node.js app, set Build command to: npm run build  (Start: npm start)
#
# Usage:
#   ./scripts/build-hostinger-upload.sh
#
# Output:
#   deploy/pj-insrnce-hostinger.zip

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$ROOT/deploy"
ZIP_NAME="pj-insrnce-hostinger.zip"
STAGING="$OUT_DIR/hostinger-staging"

echo "==> Cleaning previous staging..."
rm -rf "$STAGING"
mkdir -p "$STAGING" "$OUT_DIR"

echo "==> Copying project files..."
rsync -a \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='out' \
  --exclude='.git' \
  --exclude='coverage' \
  --exclude='deploy' \
  --exclude='docs' \
  --exclude='backend' \
  --exclude='/data/' \
  --exclude='.env' \
  --exclude='.env.*' \
  --exclude='*.tsbuildinfo' \
  --exclude='.DS_Store' \
  --exclude='*.pdf' \
  --exclude='assets' \
  --exclude='.vercel' \
  --exclude='.swc' \
  --exclude='.qodo' \
  --exclude='.tmp-uat-media' \
  --exclude='.github' \
  --exclude='src/__tests__' \
  --exclude='jest.config.js' \
  --exclude='jest.setup.js' \
  --exclude='vercel.json' \
  --exclude='generate-ubb-report.py' \
  --exclude='EMAIL-DRAFT-ALLIANZ.md' \
  --exclude='STATUS-REPORT-ALLIANZ.md' \
  --exclude='scripts/*.py' \
  --exclude='scripts/e2e-*.mjs' \
  "$ROOT/" "$STAGING/"

# Ensure policy storage dir placeholder exists (runtime writes here)
mkdir -p "$STAGING/data/policies"
touch "$STAGING/data/policies/.gitkeep"

# Include env template (not a secret file)
cp "$ROOT/.env.example" "$STAGING/.env.example"

echo "==> Creating zip..."
rm -f "$OUT_DIR/$ZIP_NAME"
(cd "$STAGING" && zip -r "$OUT_DIR/$ZIP_NAME" . -x "*.DS_Store")

rm -rf "$STAGING"

SIZE=$(du -h "$OUT_DIR/$ZIP_NAME" | cut -f1)
echo ""
echo "Done: $OUT_DIR/$ZIP_NAME ($SIZE)"
echo ""
echo "Upload this zip in Hostinger hPanel → Node.js Apps → Upload your app files"
