"""Database setup for CEE Hypervisor backend.

This is a minimal SQLAlchemy configuration that:
- Reads the database URL from the `DATABASE_URL` environment variable, falling back to a local SQLite file.
- Exposes `engine`, `SessionLocal`, and `Base` for use in the app.
- Provides `init_db()` which can be called on startup.

Currently there are no ORM models defined, so `init_db()` is effectively a no-op,
but it keeps the application startup consistent and can be extended later.
"""

from __future__ import annotations

import os
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session


DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./cee.db")

# SQLite needs a special flag when used in multithreaded environments.
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """Yield a database session for FastAPI dependencies.

    Example usage in endpoints:

        from fastapi import Depends
        from app.core.database import get_db

        @router.get("/items")
        def list_items(db: Session = Depends(get_db)):
            ...
    """

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Initialize the database schema.

    For now this simply creates all tables for models registered with `Base`.
    Since the current codebase does not define ORM models yet, this is effectively
    a no-op but keeps the startup logic intact and ready for future extensions.
    """

    # Import models here when they appear, e.g.:
    # from app import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
