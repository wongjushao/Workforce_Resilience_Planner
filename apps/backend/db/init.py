from db.migrate import apply_migrations


def init_db() -> None:
    apply_migrations()


if __name__ == "__main__":
    init_db()
