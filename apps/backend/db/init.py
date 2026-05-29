import sqlite3
from pathlib import Path

from db import get_db_path
from db.seed import seed

SCHEMA_PATH = Path(__file__).parent / "schema.sql"


def init_db() -> None:
    db_path = get_db_path()
    Path(db_path).parent.mkdir(parents=True, exist_ok=True)

    connection = sqlite3.connect(db_path)
    try:
        connection.executescript(SCHEMA_PATH.read_text())
        seed(connection)
        connection.commit()
    finally:
        connection.close()


if __name__ == "__main__":
    init_db()
