import csv
import io
import sqlite3
import uuid
from pathlib import Path

from db import get_db_path

ALLOWED_EXTENSIONS = {".csv", ".pdf", ".doc", ".docx"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
EXTRACTED_TEXT_LIMIT = 8000


def get_uploads_dir() -> Path:
    db_path = Path(get_db_path())
    uploads_dir = db_path.parent / "uploads"
    uploads_dir.mkdir(parents=True, exist_ok=True)
    return uploads_dir


def get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(get_db_path())
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def _truncate_text(text: str | None, limit: int = EXTRACTED_TEXT_LIMIT) -> str | None:
    if text is None:
        return None
    text = text.strip()
    if not text:
        return None
    if len(text) <= limit:
        return text
    return text[:limit] + "\n...[truncated]"


def extract_csv_preview(file_bytes: bytes) -> tuple[str | None, int | None]:
    try:
        text = file_bytes.decode("utf-8-sig")
    except UnicodeDecodeError:
        text = file_bytes.decode("latin-1")

    reader = csv.reader(io.StringIO(text))
    rows = list(reader)
    if not rows:
        return None, 0

    preview_lines = []
    for row in rows[:5]:
        preview_lines.append(", ".join(row))
    preview = "\n".join(preview_lines)
    row_count = max(len(rows) - 1, 0) if rows else 0
    return _truncate_text(preview), row_count


def extract_pdf_text(file_bytes: bytes) -> str | None:
    from pypdf import PdfReader

    reader = PdfReader(io.BytesIO(file_bytes))
    pages = []
    for page in reader.pages[:20]:
        pages.append(page.extract_text() or "")
    return _truncate_text("\n".join(pages))


def extract_docx_text(file_bytes: bytes) -> str | None:
    from docx import Document

    document = Document(io.BytesIO(file_bytes))
    paragraphs = [paragraph.text for paragraph in document.paragraphs if paragraph.text.strip()]
    return _truncate_text("\n".join(paragraphs))


def extract_document_content(filename: str, file_bytes: bytes) -> tuple[str | None, int | None]:
    extension = Path(filename).suffix.lower()
    if extension == ".csv":
        return extract_csv_preview(file_bytes)
    if extension == ".pdf":
        return extract_pdf_text(file_bytes), None
    if extension == ".docx":
        return extract_docx_text(file_bytes), None
    if extension == ".doc":
        return (
            "Legacy .doc files are stored but text extraction requires .docx format.",
            None,
        )
    return None, None


def save_document_upload(filename: str, file_bytes: bytes) -> dict:
    extension = Path(filename).suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise ValueError(
            f"Unsupported file type '{extension}'. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise ValueError("File exceeds the 10 MB upload limit.")

    extracted_text, row_count = extract_document_content(filename, file_bytes)

    stored_name = f"{uuid.uuid4().hex}{extension}"
    stored_path = get_uploads_dir() / stored_name
    stored_path.write_bytes(file_bytes)

    connection = get_connection()
    try:
        cursor = connection.execute(
            """
            INSERT INTO intake_documents
              (original_filename, file_type, stored_path, file_size, extracted_text, row_count, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                filename,
                extension.lstrip("."),
                str(stored_path),
                len(file_bytes),
                extracted_text,
                row_count,
                "received",
            ),
        )
        connection.commit()
        document_id = cursor.lastrowid
        row = connection.execute(
            "SELECT * FROM intake_documents WHERE id = ?",
            (document_id,),
        ).fetchone()
        return document_row_to_dict(row)
    finally:
        connection.close()


def _optional_int(value, field_name: str) -> int | None:
    if value is None or value == "":
        return None
    try:
        return int(value)
    except (TypeError, ValueError) as error:
        raise ValueError(f"{field_name} must be an integer.") from error


def _parse_skills(value) -> list[tuple[str, float]]:
    if value is None or value == "":
        return []
    if isinstance(value, list):
        parsed: list[tuple[str, float]] = []
        for item in value:
            if not isinstance(item, dict):
                continue
            name = (item.get("name") or "").strip()
            if not name:
                continue
            proficiency = item.get("proficiency", 3)
            try:
                parsed.append((name, float(proficiency)))
            except (TypeError, ValueError):
                parsed.append((name, 3.0))
        return parsed

    raw = str(value).strip()
    if not raw:
        return []

    parsed = []
    for part in raw.split(","):
        part = part.strip()
        if not part:
            continue
        if ":" in part:
            name, proficiency_raw = part.split(":", 1)
        else:
            name, proficiency_raw = part, "3"
        name = name.strip()
        if not name:
            continue
        try:
            proficiency = float(proficiency_raw.strip())
        except ValueError:
            proficiency = 3.0
        parsed.append((name, proficiency))
    return parsed


def _resolve_skill_id(connection: sqlite3.Connection, skill_name: str) -> int:
    row = connection.execute(
        "SELECT id FROM skills WHERE lower(skill_name) = lower(?)",
        (skill_name,),
    ).fetchone()
    if row is not None:
        return row["id"]

    cursor = connection.execute(
        "INSERT INTO skills (skill_name, topic_source) VALUES (?, 'manual')",
        (skill_name,),
    )
    return cursor.lastrowid


def _save_employee_skills(
    connection: sqlite3.Connection,
    employee_id: int,
    skills: list[tuple[str, float]],
) -> None:
    for skill_name, proficiency in skills:
        skill_id = _resolve_skill_id(connection, skill_name)
        connection.execute(
            """
            INSERT INTO employee_skills (employee_id, skill_id, proficiency)
            VALUES (?, ?, ?)
            ON CONFLICT(employee_id, skill_id) DO UPDATE SET
              proficiency = excluded.proficiency
            """,
            (employee_id, skill_id, proficiency),
        )


def _save_employee_skills_from_payload(
    connection: sqlite3.Connection,
    employee_id: int,
    payload: dict,
) -> None:
    raw = payload.get("skills") or payload.get("skillsRaw") or payload.get("skills_raw") or ""
    skills = _parse_skills(raw)
    if skills:
        _save_employee_skills(connection, employee_id, skills)


def _resolve_employee_id(connection: sqlite3.Connection, payload: dict) -> int:
    employee_id = payload.get("employeeId") or payload.get("employee_id")
    if employee_id is not None:
        try:
            employee_id = int(employee_id)
        except (TypeError, ValueError) as error:
            raise ValueError("Employee id must be an integer.") from error
        employee = connection.execute(
            "SELECT id FROM employees WHERE id = ?",
            (employee_id,),
        ).fetchone()
        if employee is None:
            raise ValueError(f"Employee {employee_id} was not found.")
        return employee_id

    name = (payload.get("name") or "").strip()
    current_role_id = _optional_int(
        payload.get("currentRoleId") or payload.get("current_role_id"),
        "Current role",
    )
    if not name:
        raise ValueError("Name is required.")
    if current_role_id is None:
        raise ValueError("Current role is required.")

    occupation = connection.execute(
        "SELECT id FROM occupations WHERE id = ?",
        (current_role_id,),
    ).fetchone()
    if occupation is None:
        raise ValueError(f"Occupation {current_role_id} was not found.")

    age = _optional_int(payload.get("age"), "Age")
    experience = _optional_int(payload.get("experience"), "Experience")
    gender = (payload.get("gender") or "").strip() or None
    email = (payload.get("email") or "").strip() or None
    phone = (payload.get("phone") or "").strip() or None
    department = (payload.get("department") or "").strip() or None

    cursor = connection.execute(
        """
        INSERT INTO employees
          (name, age, gender, email, phone, department, current_role_id, experience)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (name, age, gender, email, phone, department, current_role_id, experience),
    )
    employee_id = cursor.lastrowid
    _save_employee_skills_from_payload(connection, employee_id, payload)
    return employee_id


def save_manual_submission(payload: dict) -> dict:
    departure_reason = (payload.get("departureReason") or payload.get("departure_reason") or "").strip()
    performance = _optional_int(payload.get("performance"), "Performance")
    document_id = _optional_int(
        payload.get("documentId") or payload.get("document_id"),
        "Document",
    )
    submission_department = (payload.get("submissionDepartment") or payload.get("submission_department") or payload.get("department") or "").strip() or None
    existing_employee_id = payload.get("employeeId") or payload.get("employee_id")

    if not departure_reason:
        raise ValueError("Departure reason is required.")

    skills = _parse_skills(payload.get("skills") or payload.get("skillsRaw") or payload.get("skills_raw") or "")
    if existing_employee_id is None and not skills:
        raise ValueError("At least one employee skill is required.")

    connection = get_connection()
    try:
        employee_id = _resolve_employee_id(connection, payload)

        if existing_employee_id is not None and skills:
            _save_employee_skills(connection, employee_id, skills)

        if document_id is not None:
            document = connection.execute(
                "SELECT id FROM intake_documents WHERE id = ?",
                (document_id,),
            ).fetchone()
            if document is None:
                raise ValueError(f"Document {document_id} was not found.")

        cursor = connection.execute(
            """
            INSERT INTO at_risk_submissions
              (employee_id, departure_reason, department, performance, document_id)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                employee_id,
                departure_reason,
                submission_department,
                performance,
                document_id,
            ),
        )
        connection.commit()
        submission_id = cursor.lastrowid
        row = connection.execute(
            """
            SELECT
              ars.*,
              e.name AS employee_name,
              o.title AS current_role
            FROM at_risk_submissions ars
            JOIN employees e ON e.id = ars.employee_id
            JOIN occupations o ON o.id = e.current_role_id
            WHERE ars.id = ?
            """,
            (submission_id,),
        ).fetchone()
        return submission_row_to_dict(row)
    finally:
        connection.close()


def list_document_uploads() -> list[dict]:
    connection = get_connection()
    try:
        rows = connection.execute(
            """
            SELECT *
            FROM intake_documents
            ORDER BY datetime(created_at) DESC
            """
        ).fetchall()
        return [document_row_to_dict(row) for row in rows]
    finally:
        connection.close()


def list_manual_submissions() -> list[dict]:
    connection = get_connection()
    try:
        rows = connection.execute(
            """
            SELECT
              ars.*,
              e.name AS employee_name,
              o.title AS current_role
            FROM at_risk_submissions ars
            JOIN employees e ON e.id = ars.employee_id
            JOIN occupations o ON o.id = e.current_role_id
            ORDER BY datetime(ars.created_at) DESC
            """
        ).fetchall()
        return [submission_row_to_dict(row) for row in rows]
    finally:
        connection.close()


def document_row_to_dict(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "originalFilename": row["original_filename"],
        "fileType": row["file_type"],
        "fileSize": row["file_size"],
        "extractedText": row["extracted_text"],
        "rowCount": row["row_count"],
        "status": row["status"],
        "createdAt": row["created_at"],
    }


def submission_row_to_dict(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "employeeId": row["employee_id"],
        "name": row["employee_name"],
        "employeeName": row["employee_name"],
        "currentRole": row["current_role"],
        "department": row["department"],
        "performance": row["performance"],
        "documentId": row["document_id"],
        "departureReason": row["departure_reason"],
        "source": "manual",
        "createdAt": row["created_at"],
    }
