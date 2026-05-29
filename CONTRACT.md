# Prototype C API Contract

Prototype C uses provider interfaces and can run in either mock mode or backend-ready mode.

## Canonical frontend env

- Preferred: `VITE_API_BASE_URL`
- Backward-compatible fallback: `VITE_API_BASE`

If neither is set, Prototype C uses mock providers and remains fully usable.

## HTTP contract pointer

When `VITE_API_BASE_URL` is configured, frontend providers call:

- `GET /api/health`
- `POST /api/session/start`
- `POST /api/converse`

Canonical backend scaffold and response shape live at:

- `../backend/app.py`
- `../backend/README.md`

## Provider seam locations

- `src/providers/contracts.ts`
- `src/providers/httpProviders.ts`
- `src/providers/mockProviders.ts`
