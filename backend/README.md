# Voice First — backend

Tiny FastAPI scaffold. Returns mock responses. Real LLM swap-in
documented in `app.py::converse()`.

## Endpoints

| route | purpose |
|---|---|
| `GET  /api/health` | Wake-up ping. Frontend hits this on load. |
| `POST /api/session/start` | Open a session, get a `session_id`. |
| `POST /api/converse` | Send a transcript, receive a reply. **LLM swap-in here.** |

## Local dev

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
# → http://localhost:8000/docs (Swagger UI)
```

## Deploy

Configured as a Render Web Service in `../render.yaml`. Auto-deploys on
push to `main`. Free tier sleeps after 15 min idle (~30s cold start).
The frontend calls `/api/health` on page load to wake it up before the
user has a chance to notice.

## LLM swap-in

`app.py::converse()` is the only place where the LLM lives. The docstring
has two ready-to-paste patterns:

1. **Self-hosted Ollama** — production target. Needs ≥1 GB RAM, so won't
   fit on Render free tier (512 MB). Plan: dedicated hardware or paid tier.
2. **Anthropic API (Haiku)** — cheap demo path (~$0.001 per query). Drop-in
   today if you want real responses before Ollama hardware lands.

Replace the body of `converse()`. Keep the `ConverseResponse` shape.
Frontend, db schema, deploy config — none of it changes.

## Database

`db/models.py` defines `users`, `sessions`, `voice_attempts`,
`conversations`. Not connected yet. See `db/schema.md` for the design
and migration path.

When ready: `alembic init`, point `env.py` at `Base.metadata`, generate
the initial migration, `alembic upgrade head` against Render Postgres.

## Scaling beyond this scaffold

- **Security contract:** See `../docs/API_SECURITY_CONTRACT.md` for the
  planned voice/PIN auth endpoints, env placeholders, adapter interfaces, mock
  mode, migration path, and test checklist.
- **Auth:** WebAuthn / passkey is the primary credential; voice is step-up.
  Add a `/api/auth/register` and `/api/auth/verify` endpoint pair when
  account creation enters the UX.
- **Biometric:** `users.voice_template` holds the encrypted ECAPA-TDNN
  template once you wire real voice biometrics. The phrase match is just
  the demo layer on top.
- **Multi-tenant:** Add `tenant_id` foreign keys to `users` and `sessions`
  before the second customer signs up.
