# Real-Time-Tax — Free Deploy (DEP Highlighter pattern)

## Step 1 — Create the services ONCE (dashboard; only the account owner can)
Render Dashboard -> **Blueprints -> New Blueprint** -> connect `workplace-technologies/realtime-tax` -> **Apply**.
Reads root `render.yaml` and creates **realtime-tax-app** (frontend) + **realtime-tax-api** (backend).
Then set `ANTHROPIC_API_KEY` on `realtime-tax-api` (Settings -> Environment) for real responses.

## Step 2 — From then on it auto-deploys
`render.yaml` has `autoDeploy: true`, so **every `git push origin main` deploys automatically.**

## Step 3 (optional) — Force a redeploy without a code change
`cp deploy/.deploy.env.example deploy/.deploy.env`, paste your Deploy Hook URL, then `./deploy/TRIGGER_DEPLOY.sh`.
