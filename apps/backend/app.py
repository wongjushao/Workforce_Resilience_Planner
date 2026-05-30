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
        """
        SELECT id, name, current_role, department
        FROM employees
        ORDER BY name
        """
    )
    skills = query(
        """
        SELECT es.employee_id, s.id AS skill_id, s.name AS skill_name, es.proficiency
        FROM employee_skills es
        JOIN skills s ON s.id = es.skill_id
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
                "currentRole": employee["current_role"],
                "department": employee["department"],
                "skills": skills_by_employee[employee["id"]],
            }
            for employee in employees
        ]
    )


@app.get("/api/vacancies")
def list_vacancies():
    vacancies = query(
        """
        SELECT id, title, department, company
        FROM vacancies
        ORDER BY title
        """
    )
    skills = query(
        """
        SELECT vs.vacancy_id, s.id AS skill_id, s.name AS skill_name, vs.weight
        FROM vacancy_skills vs
        JOIN skills s ON s.id = vs.skill_id
        ORDER BY vs.vacancy_id, vs.weight DESC
        """
    )

    skills_by_vacancy: dict[int, list[dict]] = defaultdict(list)
    for row in skills:
        skills_by_vacancy[row["vacancy_id"]].append(
            {
                "id": row["skill_id"],
                "name": row["skill_name"],
                "weight": row["weight"],
            }
        )

    return jsonify(
        [
            {
                "id": vacancy["id"],
                "title": vacancy["title"],
                "department": vacancy["department"],
                "company": vacancy["company"],
                "skills": skills_by_vacancy[vacancy["id"]],
            }
            for vacancy in vacancies
        ]
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=True)
