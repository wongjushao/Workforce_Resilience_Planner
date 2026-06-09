import os
import sqlite3
from collections import defaultdict

from flask import Flask, jsonify, request
from flask_cors import CORS

from db import get_db_path
from db.migrate import ensure_migrations
import intake

app = Flask(__name__)
CORS(app)

ensure_migrations()


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


@app.post("/api/intake/documents")
def upload_intake_document():
    if "file" not in request.files:
        return jsonify({"error": "No file provided. Use form field name 'file'."}), 400

    uploaded_file = request.files["file"]
    if not uploaded_file.filename:
        return jsonify({"error": "No file selected."}), 400

    try:
        file_bytes = uploaded_file.read()
        record = intake.save_document_upload(uploaded_file.filename, file_bytes)
        return jsonify(record), 201
    except ValueError as error:
        return jsonify({"error": str(error)}), 400


@app.get("/api/intake/documents")
def list_intake_documents():
    return jsonify(intake.list_document_uploads())


@app.post("/api/intake/employees")
def submit_at_risk_employee():
    payload = request.get_json(silent=True) or {}
    try:
        record = intake.save_manual_submission(payload)
        return jsonify(record), 201
    except ValueError as error:
        return jsonify({"error": str(error)}), 400


@app.get("/api/intake/employees")
def list_at_risk_employees():
    return jsonify(intake.list_manual_submissions())


@app.get("/api/employees")
def list_employees():
    employees = query(
        """
        SELECT
          e.id,
          e.name,
          e.age,
          e.gender,
          e.email,
          e.phone,
          e.department,
          e.experience,
          e.current_role_id,
          o.title AS current_role
        FROM employees e
        JOIN occupations o ON o.id = e.current_role_id
        ORDER BY e.name
        """
    )
    skills = query(
        """
        SELECT es.employee_id, s.id AS skill_id, s.skill_name, es.proficiency
        FROM employee_skills es
        JOIN skills s ON s.id = es.skill_id
        ORDER BY es.employee_id, s.skill_name
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
                "age": employee["age"],
                "gender": employee["gender"],
                "email": employee["email"],
                "phone": employee["phone"],
                "department": employee["department"],
                "experience": employee["experience"],
                "currentRoleId": employee["current_role_id"],
                "currentRole": employee["current_role"],
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
        SELECT vs.vacancy_id, s.id AS skill_id, s.skill_name, vs.weight
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
