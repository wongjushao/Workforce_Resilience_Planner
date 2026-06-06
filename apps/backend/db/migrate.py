import sqlite3

from db import get_db_path

INTAKE_TABLES_SQL = """
CREATE TABLE IF NOT EXISTS intake_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  original_filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  stored_path TEXT NOT NULL,
  file_size INTEGER,
  extracted_text TEXT,
  row_count INTEGER,
  status TEXT NOT NULL DEFAULT 'received',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS at_risk_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  current_role TEXT,
  department TEXT,
  email TEXT,
  skills TEXT,
  departure_reason TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
"""


def ensure_intake_tables() -> None:
    connection = sqlite3.connect(get_db_path())
    try:
        connection.executescript(INTAKE_TABLES_SQL)
        connection.commit()
    finally:
        connection.close()
