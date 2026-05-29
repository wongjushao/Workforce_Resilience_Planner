import sqlite3

from db import get_db_path


def seed(connection: sqlite3.Connection) -> None:
    existing = connection.execute("SELECT COUNT(*) FROM Employee").fetchone()[0]
    if existing > 0:
        return

    python_skill_id = connection.execute(
        "INSERT INTO Skill (name) VALUES (?)",
        ("Python",),
    ).lastrowid
    angular_skill_id = connection.execute(
        "INSERT INTO Skill (name) VALUES (?)",
        ("Angular",),
    ).lastrowid
    analytics_skill_id = connection.execute(
        "INSERT INTO Skill (name) VALUES (?)",
        ("People Analytics",),
    ).lastrowid

    alice_id = connection.execute(
        """
        INSERT INTO Employee (name, email, risk_score)
        VALUES (?, ?, ?)
        """,
        ("Alice Tan", "alice@company.com", 0.82),
    ).lastrowid
    ben_id = connection.execute(
        """
        INSERT INTO Employee (name, email, risk_score)
        VALUES (?, ?, ?)
        """,
        ("Ben Lim", "ben@company.com", 0.73),
    ).lastrowid

    connection.executemany(
        """
        INSERT INTO EmployeeSkill (employee_id, skill_id, proficiency)
        VALUES (?, ?, ?)
        """,
        [
            (alice_id, python_skill_id, 86),
            (alice_id, analytics_skill_id, 79),
            (ben_id, angular_skill_id, 82),
        ],
    )

    same_role_id = connection.execute(
        """
        INSERT INTO Vacancy (title, path, match_score)
        VALUES (?, ?, ?)
        """,
        ("HR Analyst (Internal)", "same_role", 88.0),
    ).lastrowid
    cross_role_id = connection.execute(
        """
        INSERT INTO Vacancy (title, path, match_score)
        VALUES (?, ?, ?)
        """,
        ("Workforce Planning Specialist", "cross_role", 74.0),
    ).lastrowid

    connection.executemany(
        """
        INSERT INTO Recommendation (employee_id, vacancy_id, status)
        VALUES (?, ?, ?)
        """,
        [
            (alice_id, same_role_id, "sent"),
            (ben_id, cross_role_id, "proposed"),
        ],
    )
