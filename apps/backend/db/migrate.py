"""Database migration version control.

Migrations live in db/migrations/ as numbered SQL files:
  0001_initial_schema.sql
  0002_add_example_column.sql

Applied versions are tracked in the schema_migrations table.

Usage (from apps/backend):
    DATABASE_URL=file:../../data/workforce.db python -m db.migrate
    DATABASE_URL=file:../../data/workforce.db python -m db.migrate --status
    DATABASE_URL=file:../../data/workforce.db python -m db.migrate --reset
"""

from __future__ import annotations

import argparse
import re
import sqlite3
from dataclasses import dataclass
from pathlib import Path

from db import get_db_path

MIGRATIONS_DIR = Path(__file__).parent / "migrations"
MIGRATION_FILENAME_PATTERN = re.compile(r"^(\d+)_(.+)\.sql$")

SCHEMA_MIGRATIONS_DDL = """
CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);
"""


@dataclass(frozen=True)
class Migration:
    version: str
    description: str
    path: Path


def _connect() -> sqlite3.Connection:
    db_path = get_db_path()
    Path(db_path).parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(db_path)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def _ensure_migration_table(connection: sqlite3.Connection) -> None:
    connection.executescript(SCHEMA_MIGRATIONS_DDL)


def discover_migrations() -> list[Migration]:
    migrations: list[Migration] = []
    for path in sorted(MIGRATIONS_DIR.glob("*.sql")):
        match = MIGRATION_FILENAME_PATTERN.match(path.name)
        if not match:
            raise ValueError(
                f"Invalid migration filename '{path.name}'. "
                "Expected format: 0001_description.sql"
            )
        migrations.append(
            Migration(
                version=match.group(1),
                description=match.group(2),
                path=path,
            )
        )
    migrations.sort(key=lambda migration: int(migration.version))
    return migrations


def get_applied_versions(connection: sqlite3.Connection) -> set[str]:
    _ensure_migration_table(connection)
    rows = connection.execute("SELECT version FROM schema_migrations").fetchall()
    return {row["version"] for row in rows}


def apply_migrations(connection: sqlite3.Connection | None = None) -> list[str]:
    """Apply all pending migrations. Returns applied version strings."""
    owns_connection = connection is None
    if owns_connection:
        connection = _connect()

    applied_now: list[str] = []
    try:
        _ensure_migration_table(connection)
        applied_versions = get_applied_versions(connection)
        pending = [
            migration
            for migration in discover_migrations()
            if migration.version not in applied_versions
        ]

        for migration in pending:
            sql = migration.path.read_text()
            connection.executescript(sql)
            connection.execute(
                """
                INSERT INTO schema_migrations (version, description)
                VALUES (?, ?)
                """,
                (migration.version, migration.description),
            )
            applied_now.append(migration.version)

        if applied_now:
            connection.commit()
    finally:
        if owns_connection and connection is not None:
            connection.close()

    return applied_now


def ensure_migrations() -> None:
    """Apply pending migrations. Safe to call on app startup."""
    apply_migrations()


def migration_status() -> list[dict]:
    connection = _connect()
    try:
        _ensure_migration_table(connection)
        applied = {
            row["version"]: row
            for row in connection.execute(
                "SELECT version, description, applied_at FROM schema_migrations"
            ).fetchall()
        }
        status = []
        for migration in discover_migrations():
            row = applied.get(migration.version)
            status.append(
                {
                    "version": migration.version,
                    "description": migration.description,
                    "filename": migration.path.name,
                    "applied": row is not None,
                    "appliedAt": row["applied_at"] if row else None,
                }
            )
        return status
    finally:
        connection.close()


def reset_database() -> None:
    """Delete the database file so migrations can be replayed from scratch."""
    db_path = Path(get_db_path())
    if db_path.exists():
        db_path.unlink()


def main() -> None:
    parser = argparse.ArgumentParser(description="Run database migrations.")
    parser.add_argument(
        "--status",
        action="store_true",
        help="Show migration status and exit.",
    )
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Delete the database file and re-apply all migrations.",
    )
    args = parser.parse_args()

    if args.status:
        for entry in migration_status():
            state = "applied" if entry["applied"] else "pending"
            applied_at = f" at {entry['appliedAt']}" if entry["appliedAt"] else ""
            print(
                f"[{state}] {entry['version']} {entry['description']}"
                f" ({entry['filename']}){applied_at}"
            )
        return

    if args.reset:
        reset_database()

    applied = apply_migrations()
    if applied:
        print(f"Applied migrations: {', '.join(applied)}")
    else:
        print("Database is up to date.")


if __name__ == "__main__":
    main()
