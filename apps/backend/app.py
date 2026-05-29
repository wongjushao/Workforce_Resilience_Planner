import os
import sqlite3
from collections import defaultdict

from flask import Flask, jsonify
from flask_cors import CORS

from db import get_db_path

app = Flask(__name__)
CORS(app)


def query(sql: str, params: tuple = ()) -> list[sqlite3.Row]:
    connection = sqlite3.connect(get_db_path())
    connection.row_factory = sqlite3.Row
    try:
        cursor = connection.execute(sql, params)
        return cursor.fetchall()
    finally:
        connection.close()


@app.get("/health")
def health_check():
    return jsonify({"status": "ok"})


@app.get("/api/employees")
def list_employees():
    employees = query(
        "SELECT id, name, email, risk_score FROM Employee ORDER BY risk_score DESC"
    )
    skills = query(
        """
        SELECT es.employee_id, s.id AS skill_id, s.name AS skill_name, es.proficiency
        FROM EmployeeSkill es
        JOIN Skill s ON s.id = es.skill_id
        ORDER BY es.employee_id, s.name
        """
    )

    skills_by_employee: dict[int, list[dict]] = defaultdict(list)
    for row in skills:
        skills_by_employee[row["employee_id"]].append(
            {
                "id": row["skill_id"],
                "name": row["skill_name"],
                "proficiency": row["proficiency"],
            }
        )

    return jsonify(
        [
            {
                "id": employee["id"],
                "name": employee["name"],
                "email": employee["email"],
                "riskScore": employee["risk_score"],
                "skills": skills_by_employee[employee["id"]],
            }
            for employee in employees
        ]
    )


@app.get("/api/vacancies")
def list_vacancies():
    vacancies = query(
        "SELECT id, title, path, match_score FROM Vacancy ORDER BY match_score DESC"
    )

    return jsonify(
        [
            {
                "id": vacancy["id"],
                "title": vacancy["title"],
                "path": vacancy["path"],
                "matchScore": vacancy["match_score"],
            }
            for vacancy in vacancies
        ]
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=True)
