#!/usr/bin/env bash
# Compare storage + Allianz config across deployments.
# Usage:
#   ./scripts/check-deployment-health.sh
#   ./scripts/check-deployment-health.sh https://hallu.com.my https://pj-insurance.vercel.app

set -euo pipefail

if [[ $# -gt 0 ]]; then
  URLS=("$@")
else
  URLS=(https://hallu.com.my https://pj-insurance.vercel.app)
fi

fail=0

for base in "${URLS[@]}"; do
  base="${base%/}"
  echo "==> $base/api/health"
  body="$(curl -fsS "$base/api/health")" || {
    echo "    FAIL: could not reach health endpoint"
    fail=1
    continue
  }

  status="$(printf '%s' "$body" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const j=JSON.parse(d);console.log(j.status||'');})")"
  writable="$(printf '%s' "$body" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const j=JSON.parse(d);console.log(j.storage?.writable===true?'true':'false');})")"
  allianz="$(printf '%s' "$body" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const j=JSON.parse(d);console.log(j.allianzConfigured===true?'true':'false');})")"

  echo "    status=$status storage.writable=$writable allianzConfigured=$allianz"

  if [[ "$writable" != "true" ]]; then
    echo "    WARN: storage not writable — quote cache / payment verification may fail"
    fail=1
  fi
  if [[ "$status" == "degraded" ]]; then
    fail=1
  fi
done

if [[ "$fail" -ne 0 ]]; then
  echo ""
  echo "One or more checks failed (see above)."
  exit 1
fi

echo ""
echo "All targets passed storage + health checks."
