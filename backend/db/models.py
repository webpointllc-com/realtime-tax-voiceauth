"""
SQLAlchemy models — voice auth + sessions + conversations.

Not deployed yet. When ready:
    pip install alembic sqlalchemy[asyncio] asyncpg
    alembic init backend/db/migrations
    alembic revision --autogenerate -m "init voice auth"
    alembic upgrade head

See schema.md for ER diagram + design notes.
"""

import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


def _uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    """The owner of voice auth. Email is the unique identity."""

    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    display_name = Column(String(120), nullable=True)

    # Encrypted voice biometric template (ECAPA-TDNN or similar) — NULL until
    # the real biometric is wired. Prototype runs phrase-only matching.
    voice_template = Column(Text, nullable=True)

    # WebAuthn / passkey credential id once that's wired.
    passkey_credential_id = Column(String(512), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_login_at = Column(DateTime, nullable=True)

    sessions = relationship("Session", back_populates="user")


class Session(Base):
    """One per browser tab / auth attempt. Anonymous sessions allowed."""

    __tablename__ = "sessions"

    id = Column(String(36), primary_key=True, default=_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    client_id = Column(String(120), nullable=True)
    user_agent = Column(String(512), nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    ended_at = Column(DateTime, nullable=True)
    auth_method = Column(String(40), nullable=True)  # voice_phrase|passkey|mock
    unlocked = Column(Boolean, default=False, nullable=False)

    user = relationship("User", back_populates="sessions")
    attempts = relationship("VoiceAttempt", back_populates="session")
    messages = relationship("Conversation", back_populates="session")


class VoiceAttempt(Base):
    """Each captured transcript event during a session."""

    __tablename__ = "voice_attempts"

    id = Column(String(36), primary_key=True, default=_uuid)
    session_id = Column(String(36), ForeignKey("sessions.id"), nullable=False)
    transcript = Column(Text, nullable=False)
    confidence = Column(Float, nullable=True)  # 0..1
    matched = Column(Boolean, default=False, nullable=False)
    duration_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    session = relationship("Session", back_populates="attempts")


class Conversation(Base):
    """LLM dialog turns once a real LLM is wired."""

    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True, default=_uuid)
    session_id = Column(String(36), ForeignKey("sessions.id"), nullable=False)
    role = Column(String(16), nullable=False)  # user | assistant
    content = Column(Text, nullable=False)
    model = Column(String(80), nullable=True)
    tokens = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    session = relationship("Session", back_populates="messages")
