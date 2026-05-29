#!/usr/bin/env bash
# Real-Time-Tax — TRIGGER_DEPLOY (mirrors DEP Highlighter / proto_a Free-Deploy pattern).
# Redeploys the EXISTING Render service. One-time service creation is a dashboard step (see FREE_DEPLOY.md).
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$HERE"
[[ -f .deploy.env ]] && { set -a; source .deploy.env; set +a; }

if [[ -n "${RENDER_DEPLOY_HOOK_URL:-}" ]]; then
  echo "[hook] POST Render deploy hook…"
  curl -fsS -X POST "${RENDER_DEPLOY_HOOK_URL}"; echo; echo "[ok] build queued (1-3 min)."
elif [[ -n "${RENDER_API_KEY:-}" && -n "${RENDER_SERVICE_ID:-}" ]]; then
  echo "[api] POST deploy for ${RENDER_SERVICE_ID}…"
  curl -fsS -X POST "https://api.render.com/v1/services/${RENDER_SERVICE_ID}/deploys" \
    -H "Authorization: Bearer ${RENDER_API_KEY}" -H "Content-Type: application/json" -d '{}' >/dev/null
  echo "[ok] deploy triggered."
else
  echo "[info] No .deploy.env hook/key — but render.yaml has autoDeploy:true,"
  echo "       so 'git push origin main' already deploys once the service exists."
fi

BASE="${APP_URL:-https://realtime-tax-app.onrender.com}"
echo "[health] GET ${BASE%/}/"
curl -fsS --connect-timeout 15 --max-time 45 -o /dev/null -w "HTTP %{http_code}\n" "${BASE%/}/" \
  && echo "[ok] reachable." || { echo "[warn] not reachable yet (may be building)."; exit 1; }
