# Voice First — DB schema

## ER overview

```
users (1) ───< sessions (1) ───< voice_attempts
                  │
                  └───< conversations
```

A `User` owns many `Session`s. Each `Session` has many `VoiceAttempt`s
(every captured transcript event, matched or not) and many
`Conversation` rows (LLM dialog once wired).

Anonymous sessions are allowed — `Session.user_id` is nullable —
so the prototype works before account creation is implemented.

## Tables

### users

The owner of voice auth.

| col | type | notes |
|---|---|---|
| id | string(36) PK | UUID |
| email | string(255) UNIQUE | required, indexed |
| display_name | string(120) | nullable |
| voice_template | text | encrypted ECAPA-TDNN template; NULL in prototype |
| passkey_credential_id | string(512) | WebAuthn cred id, nullable |
| created_at | datetime | |
| last_login_at | datetime | nullable |

### sessions

One per browser tab / auth attempt.

| col | type | notes |
|---|---|---|
| id | string(36) PK | UUID |
| user_id | FK users.id | nullable (anon) |
| client_id | string(120) | frontend-supplied identifier |
| user_agent | string(512) | nullable |
| started_at | datetime | |
| ended_at | datetime | nullable until close |
| auth_method | string(40) | voice_phrase / passkey / mock |
| unlocked | boolean | did the user reach the app? |

### voice_attempts

Every transcript event during a session. Persist even when match fails —
data for tuning the fuzzy matcher and detecting attacks.

| col | type | notes |
|---|---|---|
| id | string(36) PK | UUID |
| session_id | FK sessions.id | required |
| transcript | text | what Web Speech heard |
| confidence | float | 0..1, nullable |
| matched | boolean | counted as the unlock phrase? |
| duration_ms | int | how long the audio was |
| created_at | datetime | |

### conversations

LLM dialog turns once a real model is wired.

| col | type | notes |
|---|---|---|
| id | string(36) PK | UUID |
| session_id | FK sessions.id | required |
| role | string(16) | user / assistant |
| content | text | the message |
| model | string(80) | which LLM produced it |
| tokens | int | nullable |
| created_at | datetime | |

## Migration path

```bash
cd backend
pip install alembic 'sqlalchemy[asyncio]' asyncpg
alembic init db/migrations
# edit db/migrations/env.py:
#   from db.models import Base
#   target_metadata = Base.metadata
alembic revision --autogenerate -m "init voice auth"
alembic upgrade head
```

Render Postgres free tier (90-day expiry) is enough for the prototype.
Production should use Standard tier or external Postgres.

## Privacy notes

- `users.voice_template` and `users.passkey_credential_id` are sensitive.
  Encrypt at rest before deploying production.
- Don't log full transcripts containing PII. Redact before storing in
  `voice_attempts.transcript`. The unlock phrase itself is fine — it's
  not secret in this design (voice is step-up, not sole credential).
- `Session.user_agent` can fingerprint a device. Strip it for analytics.
