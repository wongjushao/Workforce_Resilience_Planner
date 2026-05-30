import sqlite3

from db import get_db_path


def seed(connection: sqlite3.Connection) -> None:
    existing = connection.execute("SELECT COUNT(*) FROM employees").fetchone()[0]
    if existing > 0:
        return

    hr_analyst_id = connection.execute(
        """
        INSERT INTO occupations (onet_code, title, description)
        VALUES (?, ?, ?)
        """,
        (
            "13-1071.00",
            "Human Resources Specialists",
            "Recruit, screen, interview, or place individuals within an organization.",
        ),
    ).lastrowid
    workforce_planner_id = connection.execute(
        """
        INSERT INTO occupations (onet_code, title, description)
        VALUES (?, ?, ?)
        """,
        (
            "13-1081.00",
            "Logisticians",
            "Analyze and coordinate an organization's supply chain.",
        ),
    ).lastrowid

    python_skill_id = connection.execute(
        "INSERT INTO skills (name, category) VALUES (?, ?)",
        ("Python", "technical"),
    ).lastrowid
    angular_skill_id = connection.execute(
        "INSERT INTO skills (name, category) VALUES (?, ?)",
        ("Angular", "technical"),
    ).lastrowid
    analytics_skill_id = connection.execute(
        "INSERT INTO skills (name, category) VALUES (?, ?)",
        ("People Analytics", "analytical"),
    ).lastrowid

    connection.executemany(
        """
        INSERT INTO occupation_skills
          (occupation_id, skill_id, source, scale_type, score)
        VALUES (?, ?, ?, ?, ?)
        """,
        [
            (hr_analyst_id, python_skill_id, "essential_skills", "importance", 4.2),
            (hr_analyst_id, analytics_skill_id, "essential_skills", "importance", 4.5),
            (workforce_planner_id, analytics_skill_id, "knowledge", "level", 3.8),
        ],
    )

    connection.execute(
        """
        INSERT INTO related_occupations
          (occupation_id, related_occupation_id, tier)
        VALUES (?, ?, ?)
        """,
        (hr_analyst_id, workforce_planner_id, "medium"),
    )

    connection.execute(
        """
        INSERT INTO alternate_titles (occupation_id, title)
        VALUES (?, ?)
        """,
        (hr_analyst_id, "HR Analyst"),
    )

    connection.execute(
        """
        INSERT INTO technologies
          (occupation_id, technology_name, category, hot_technology, in_demand)
        VALUES (?, ?, ?, ?, ?)
        """,
        (hr_analyst_id, "Microsoft Excel", "office", 1, 1),
    )

    alice_id = connection.execute(
        """
        INSERT INTO employees (name, current_role, department)
        VALUES (?, ?, ?)
        """,
        ("Alice Tan", "HR Analyst", "People Operations"),
    ).lastrowid
    ben_id = connection.execute(
        """
        INSERT INTO employees (name, current_role, department)
        VALUES (?, ?, ?)
        """,
        ("Ben Lim", "Frontend Developer", "Engineering"),
    ).lastrowid

    connection.executemany(
        """
        INSERT INTO employee_skills (employee_id, skill_id, proficiency)
        VALUES (?, ?, ?)
        """,
        [
            (alice_id, python_skill_id, 0.86),
            (alice_id, analytics_skill_id, 0.79),
            (ben_id, angular_skill_id, 0.82),
        ],
    )

    same_role_id = connection.execute(
        """
        INSERT INTO vacancies (title, department, company)
        VALUES (?, ?, ?)
        """,
        ("HR Analyst (Internal)", "People Operations", "Acme Corp"),
    ).lastrowid
    cross_role_id = connection.execute(
        """
        INSERT INTO vacancies (title, department, company)
        VALUES (?, ?, ?)
        """,
        ("Workforce Planning Specialist", "Strategy", "Acme Corp"),
    ).lastrowid

    connection.executemany(
        """
        INSERT INTO vacancy_skills (vacancy_id, skill_id, weight)
        VALUES (?, ?, ?)
        """,
        [
            (same_role_id, analytics_skill_id, 0.9),
            (same_role_id, python_skill_id, 0.7),
            (cross_role_id, analytics_skill_id, 0.85),
        ],
    )
