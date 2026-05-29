import os


def get_db_path() -> str:
    database_url = os.getenv("DATABASE_URL", "file:/app/data/workforce.db")
    if database_url.startswith("file:"):
        return database_url.removeprefix("file:")
    return database_url
