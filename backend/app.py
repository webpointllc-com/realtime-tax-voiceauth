"""
Voice First — backend mock API.

This is a placeholder. All endpoints return scaffolded responses.
When the real LLM is wired, replace the body of `converse()` (see docstring).
See db/schema.md for the data model and db/models.py for SQLAlchemy templates.
"""

from datetime import datetime
from uuid import uuid4
from typing import Optional

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="Voice First Backend",
    version="0.1.0-mock",
    description="Mock backend for the voice unlock prototype. Real LLM not wired.",
)

# CORS — tighten allow_origins before production. Public prototype today.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Models ──────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str
    version: str
    llm_provider: str
    db_connected: bool


class SessionStartRequest(BaseModel):
    client_id: Optional[str] = None
    user_agent: Optional[str] = None


class SessionStartResponse(BaseModel):
    session_id: str
    started_at: str
    challenge_phrase: str


class ConverseRequest(BaseModel):
    session_id: str
    text: str
    confidence: Optional[float] = None


class ConverseResponse(BaseModel):
    reply: str
    intent: str
    should_unlock: bool
    model: str


# ─── Routes ──────────────────────────────────────────────────────────────────

@app.get("/api/health", response_model=HealthResponse)
async def health():
    """Wake-up ping. Frontend hits this on load to warm cold starts."""
    return HealthResponse(
        status="ok",
        version="0.1.0-mock",
        llm_provider="placeholder",
        db_connected=False,
    )


@app.post("/api/session/start", response_model=SessionStartResponse)
async def session_start(req: SessionStartRequest):
    """
    Open a voice auth session.
    TODO: persist to `sessions` table once db is wired (see db/models.py).
    """
    return SessionStartResponse(
        session_id=str(uuid4()),
        started_at=datetime.utcnow().isoformat() + "Z",
        challenge_phrase="my voice is my password",
    )


@app.post("/api/converse", response_model=ConverseResponse)
async def converse(req: ConverseRequest):
    """
    Receive a transcript from the frontend.

    ┌──────────────────────────────────────────────────────────────────────┐
    │  LLM SWAP-IN POINT — replace the body below to wire a real model.    │
    ├──────────────────────────────────────────────────────────────────────┤
    │                                                                      │
    │  Self-hosted Ollama (production target):                             │
    │      import httpx                                                    │
    │      async with httpx.AsyncClient() as client:                       │
    │          r = await client.post(                                      │
    │              OLLAMA_URL + "/api/generate",                           │
    │              json={"model": "llama3.2:1b", "prompt": req.text,       │
    │                    "stream": False},                                 │
    │              timeout=60.0,                                           │
    │          )                                                           │
    │      reply = r.json()["response"]                                    │
    │                                                                      │
    │  Anthropic API (cheap demo path):                                    │
    │      from anthropic import AsyncAnthropic                            │
    │      client = AsyncAnthropic(api_key=os.environ["ANTHROPIC_API_KEY"])│
    │      msg = await client.messages.create(                             │
    │          model="claude-haiku-4-5-20251001",                          │
    │          max_tokens=200,                                             │
    │          messages=[{"role": "user", "content": req.text}],           │
    │      )                                                               │
    │      reply = msg.content[0].text                                     │
    │                                                                      │
    │  Contract: return ConverseResponse{reply, intent, should_unlock,     │
    │  model}. The frontend doesn't care about the internals.              │
    │                                                                      │
    └──────────────────────────────────────────────────────────────────────┘
    """

    normalized_pre = req.text.lower().strip()
    _is_unlock_pre = ("voice" in normalized_pre) and ("password" in normalized_pre)

    # ── LLM swap-in (dormant until ANTHROPIC_API_KEY present in env) ──────────
    _api_key = os.environ.get("ANTHROPIC_API_KEY")
    if _api_key:
        try:
            from anthropic import AsyncAnthropic
            _client = AsyncAnthropic(api_key=_api_key)
            _msg = await _client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=200,
                messages=[{"role": "user", "content": req.text}],
            )
            return ConverseResponse(
                reply=_msg.content[0].text,
                intent="unlock" if _is_unlock_pre else "chat",
                should_unlock=_is_unlock_pre,
                model="claude-haiku-4-5",
            )
        except Exception:
            pass  # any failure -> fall through to mock (never break the demo)

    # Mock detection: if the transcript contains the unlock phrase, signal unlock.
    normalized = req.text.lower().strip()
    is_unlock = ("voice" in normalized) and ("password" in normalized)

    if is_unlock:
        return ConverseResponse(
            reply="Voice recognized. Welcome back.",
            intent="unlock",
            should_unlock=True,
            model="placeholder-mock",
        )

    return ConverseResponse(
        reply=f"[mock] received: '{req.text[:80]}'",
        intent="echo",
        should_unlock=False,
        model="placeholder-mock",
    )


# ─── Local dev entrypoint ────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
