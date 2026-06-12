"""
intake.py  –  Document upload & employee-parsing pipeline.

Supports:
  - CSV  : one row per employee, flexible header aliases
  - PDF  : heuristic block-based field extraction
  - DOCX : same heuristic extraction on paragraph text
  - DOC  : stored only (binary format; text extraction not supported)

All parsed employees are written to the `employees`, `employee_skills`, and
`at_risk_submissions` tables and linked back to the originating
`intake_documents` row via document_id.
"""

import csv
import io
import re
import sqlite3
import uuid
from pathlib import Path

from db import get_db_path

ALLOWED_EXTENSIONS = {".csv", ".pdf", ".doc", ".docx"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
EXTRACTED_TEXT_LIMIT = 8000

# ---------------------------------------------------------------------------
# CSV column aliases  (lower-case alias → canonical field name)
# ---------------------------------------------------------------------------
_CSV_ALIASES: dict[str, str] = {
    # name
    "name": "name",
    "full name": "name",
    "full_name": "name",
    "employee name": "name",
    "employee_name": "name",
    # age
    "age": "age",
    # gender
    "gender": "gender",
    # email
    "email": "email",
    "email address": "email",
    "email_address": "email",
    # phone
    "phone": "phone",
    "phone number": "phone",
    "phone_number": "phone",
    "mobile": "phone",
    # department
    "department": "department",
    "dept": "department",
    # current_role
    "current_role": "current_role",
    "current role": "current_role",
    "role": "current_role",
    "job title": "current_role",
    "job_title": "current_role",
    "position": "current_role",
    "title": "current_role",
    # current_role_id
    "current_role_id": "current_role_id",
    "role_id": "current_role_id",
    # submission_department
    "submission_department": "submission_department",
    # document_id (used to override if explicitly provided)
    "document_id": "document_id",
    # experience
    "experience": "experience",
    "years of experience": "experience",
    "years_of_experience": "experience",
    "experience (years)": "experience",
    "exp": "experience",
    # skills
    "skills": "skills",
    "skill set": "skills",
    "skill_set": "skills",
    "skills_raw": "skills",
    # departure_reason
    "departure_reason": "departure_reason",
    "departure reason": "departure_reason",
    "reason": "departure_reason",
    "risk reason": "departure_reason",
    "risk_reason": "departure_reason",
    "termination reason": "departure_reason",
    "termination_reason": "departure_reason",
    # performance
    "performance": "performance",
    "performance score": "performance",
    "performance_score": "performance",
    "perf": "performance",
    "rating": "performance",
    # risk_score (informational)
    "risk_score": "risk_score",
    "risk score": "risk_score",
    "risk": "risk_score",
    "layoff risk": "risk_score",
    "layoff_risk": "risk_score",
    # peer_review
    "peer_review": "peer_review",
    "peer review": "peer_review",
    "feedback": "peer_review",
    # manager_comment
    "manager_comment": "manager_comment",
    "manager comment": "manager_comment",
    "manager feedback": "manager_comment",
    "manager notes": "manager_comment",
}


def _normalise_header(raw: str) -> str:
    return _CSV_ALIASES.get(raw.strip().lower(), raw.strip().lower())


# ---------------------------------------------------------------------------
# Connection / path helpers
# ---------------------------------------------------------------------------

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


# ---------------------------------------------------------------------------
# Text extraction
# ---------------------------------------------------------------------------

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
    row_count = max(len(rows) - 1, 0)
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
    paragraphs = [p.text for p in document.paragraphs if p.text.strip()]
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


# ---------------------------------------------------------------------------
# Document upload (saves file + preview to intake_documents)
# ---------------------------------------------------------------------------

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


# ---------------------------------------------------------------------------
# Skill helpers
# ---------------------------------------------------------------------------

def _optional_int(value, field_name: str) -> int | None:
    if value is None or value == "":
        return None
    try:
        return int(value)
    except (TypeError, ValueError) as error:
        raise ValueError(f"{field_name} must be an integer.") from error


def _parse_skills(value) -> list[tuple[str, float]]:
    """Parse a skills value (string, list of dicts) → [(name, proficiency)]."""
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
            try:
                parsed.append((name, float(item.get("proficiency", 3))))
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


def _resolve_skill_id(connection: sqlite3.Connection, skill_name: str) -> int | None:
    row = connection.execute(
        "SELECT id FROM skills WHERE lower(skill_name) = lower(?)",
        (skill_name,),
    ).fetchone()
    if row is not None:
        return row["id"]
    return None


def _save_employee_skills(
    connection: sqlite3.Connection,
    employee_id: int,
    skills: list[tuple[str, float]],
) -> None:
    for skill_name, proficiency in skills:
        skill_id = _resolve_skill_id(connection, skill_name)
        if skill_id is None:
            continue
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


# ---------------------------------------------------------------------------
# Occupation resolution
# ---------------------------------------------------------------------------

def _resolve_occupation_id(connection: sqlite3.Connection, role_text: str) -> int | None:
    """Best-effort match of a free-text role string to an occupation id."""
    if not role_text:
        return None
    role_text = role_text.strip()
    # Exact
    row = connection.execute(
        "SELECT id FROM occupations WHERE lower(title) = lower(?)",
        (role_text,),
    ).fetchone()
    if row:
        return row["id"]
    # Partial
    row = connection.execute(
        "SELECT id FROM occupations WHERE lower(title) LIKE ? LIMIT 1",
        (f"%{role_text.lower()}%",),
    ).fetchone()
    if row:
        return row["id"]
    # Alternate titles
    row = connection.execute(
        """
        SELECT o.id FROM alternate_titles at
        JOIN occupations o ON o.id = at.occupation_id
        WHERE lower(at.title) LIKE ? LIMIT 1
        """,
        (f"%{role_text.lower()}%",),
    ).fetchone()
    if row:
        return row["id"]
    return None


def _get_or_create_fallback_occupation(connection: sqlite3.Connection) -> int:
    """Return a catch-all occupation id for unrecognised roles."""
    row = connection.execute(
        "SELECT id FROM occupations WHERE onet_code = 'UNKNOWN' LIMIT 1"
    ).fetchone()
    if row:
        return row["id"]
    cursor = connection.execute(
        """
        INSERT OR IGNORE INTO occupations (onet_code, title, description)
        VALUES (
          'UNKNOWN',
          'Unclassified / Pending Review',
          'Role imported from HR document; not yet matched to O*NET taxonomy.'
        )
        """
    )
    connection.commit()
    if cursor.lastrowid:
        return cursor.lastrowid
    return connection.execute(
        "SELECT id FROM occupations WHERE onet_code = 'UNKNOWN'"
    ).fetchone()["id"]


# ---------------------------------------------------------------------------
# Row-level employee upsert  (used by both CSV and text-block parsers)
# ---------------------------------------------------------------------------

def _upsert_employee_from_row(
    connection: sqlite3.Connection,
    row: dict,
    document_id: int,
) -> dict | None:
    """
    Insert-or-update one employee from a parsed row dict, then create a
    linked at_risk_submissions record.  Returns a summary dict or None to skip.
    """
    name = (row.get("name") or "").strip()
    if not name:
        return None

    role_text = (row.get("current_role") or "").strip()
    departure_reason = (row.get("departure_reason") or "").strip() or "Imported from document"
    department = row.get("department") or None

    # Current Role resolution: prioritize current_role_id if provided
    occupation_id = None
    raw_role_id = row.get("current_role_id")
    if raw_role_id and str(raw_role_id).strip().isdigit():
        target_id = int(str(raw_role_id).strip())
        exists = connection.execute("SELECT id FROM occupations WHERE id = ?", (target_id,)).fetchone()
        if exists:
            occupation_id = target_id
            
    if occupation_id is None and role_text:
        occupation_id = _resolve_occupation_id(connection, role_text)
        
    if occupation_id is None:
        occupation_id = _get_or_create_fallback_occupation(connection)

    def _safe_int(val: str | None) -> int | None:
        if not val:
            return None
        try:
            return int(float(val))
        except (TypeError, ValueError):
            return None

    age = _safe_int(row.get("age"))
    experience = _safe_int(row.get("experience"))
    performance = _safe_int(row.get("performance"))
    gender = row.get("gender") or None
    email = row.get("email") or None
    phone = row.get("phone") or None

    # Upsert employee — match on email first, then name+role
    existing = None
    if email:
        existing = connection.execute(
            "SELECT id FROM employees WHERE lower(email) = lower(?) LIMIT 1",
            (email,),
        ).fetchone()
    if existing is None:
        existing = connection.execute(
            "SELECT id FROM employees WHERE lower(name) = lower(?) AND current_role_id = ? LIMIT 1",
            (name, occupation_id),
        ).fetchone()

    if existing:
        employee_id = existing["id"]
        connection.execute(
            """
            UPDATE employees
            SET age        = COALESCE(?, age),
                gender     = COALESCE(?, gender),
                email      = COALESCE(?, email),
                phone      = COALESCE(?, phone),
                department = COALESCE(?, department),
                experience = COALESCE(?, experience)
            WHERE id = ?
            """,
            (age, gender, email, phone, department, experience, employee_id),
        )
    else:
        cursor = connection.execute(
            """
            INSERT INTO employees
              (name, age, gender, email, phone, department, current_role_id, experience)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (name, age, gender, email, phone, department, occupation_id, experience),
        )
        employee_id = cursor.lastrowid

    # Skills
    skills = _parse_skills(row.get("skills") or "")
    if skills:
        _save_employee_skills(connection, employee_id, skills)

    # Create submission record
    sub_dept = (row.get("submission_department") or "").strip() or department
    override_doc_id_raw = row.get("document_id")
    final_doc_id = document_id
    if override_doc_id_raw and str(override_doc_id_raw).strip().isdigit():
        final_doc_id = int(str(override_doc_id_raw).strip())

    connection.execute(
        """
        INSERT INTO at_risk_submissions
          (employee_id, departure_reason, department, performance, document_id)
        VALUES (?, ?, ?, ?, ?)
        """,
        (employee_id, departure_reason, sub_dept, performance, final_doc_id),
    )

    return {"employeeId": employee_id, "name": name}


# ---------------------------------------------------------------------------
# File-format parsers  (return list[dict] with canonical field names)
# ---------------------------------------------------------------------------

def _parse_employees_from_csv(file_bytes: bytes) -> list[dict]:
    """Parse CSV bytes into employee row dicts using flexible header aliases."""
    try:
        text = file_bytes.decode("utf-8-sig")
    except UnicodeDecodeError:
        text = file_bytes.decode("latin-1")

    reader = csv.DictReader(io.StringIO(text))
    if reader.fieldnames is None:
        return []

    employees = []
    for raw_row in reader:
        row: dict[str, str] = {
            _normalise_header(k): (v or "").strip()
            for k, v in raw_row.items()
            if k is not None
        }
        if not row.get("name") and not row.get("current_role"):
            continue
        employees.append(row)
    return employees


_FIELD_RE = re.compile(
    r"^(?P<key>[A-Za-z _/\(\)]+?)\s*:\s*(?P<value>.+)$",
    re.MULTILINE,
)


def _parse_employees_from_text(text: str) -> list[dict]:
    """
    Heuristic block extractor for PDF / DOCX free-form text.

    Splits on:
      - Double (or more) blank lines
      - Lines consisting solely of dashes (--- separator used by DOCX generator)

    Each resulting block is scanned for "Key: Value" lines.
    """
    # Normalise --- separator lines into block boundaries
    normalised = re.sub(r"\n\s*-{3,}\s*\n", "\n\n", text)

    blocks = re.split(r"\n\s*\n", normalised.strip())
    employees = []
    for block in blocks:
        matches = _FIELD_RE.findall(block)
        if not matches:
            continue
        row: dict[str, str] = {}
        for raw_key, raw_val in matches:
            canonical = _normalise_header(raw_key.strip())
            row[canonical] = raw_val.strip()
        if row.get("name") or row.get("current_role"):
            employees.append(row)
    return employees


# ---------------------------------------------------------------------------
# Orchestrator: parse a stored intake document → employees
# ---------------------------------------------------------------------------

def parse_document_employees(document_id: int) -> dict:
    """
    Read the stored file for intake_document `document_id`, parse employee
    records from it, create/update employees + at_risk_submissions rows, and
    stamp the intake_document with parse results.

    Returns: {"documentId": int, "parsed": int, "errors": list[str]}
    """
    connection = get_connection()
    try:
        doc = connection.execute(
            "SELECT * FROM intake_documents WHERE id = ?",
            (document_id,),
        ).fetchone()
        if doc is None:
            raise ValueError(f"Document {document_id} not found.")

        stored_path = Path(doc["stored_path"])
        if not stored_path.exists():
            raise ValueError(f"Stored file not found: {stored_path}")

        file_bytes = stored_path.read_bytes()
        file_type = (doc["file_type"] or "").lower()

        if file_type == "csv":
            rows = _parse_employees_from_csv(file_bytes)
        elif file_type == "pdf":
            text = extract_pdf_text(file_bytes) or ""
            rows = _parse_employees_from_text(text)
        elif file_type == "docx":
            text = extract_docx_text(file_bytes) or ""
            rows = _parse_employees_from_text(text)
        else:
            # .doc  — stored only, extraction not supported
            rows = []

        parsed_count = 0
        parse_errors: list[str] = []

        for i, row in enumerate(rows, start=1):
            try:
                result = _upsert_employee_from_row(connection, row, document_id)
                if result is not None:
                    parsed_count += 1
            except Exception as exc:  # noqa: BLE001
                parse_errors.append(f"Row {i} ({row.get('name', '?')}): {exc}")

        # Stamp intake_document with parse results
        connection.execute(
            """
            UPDATE intake_documents
            SET parsed_employees_count = ?,
                parse_error = ?,
                parsed_at   = datetime('now'),
                status      = ?
            WHERE id = ?
            """,
            (
                parsed_count,
                "; ".join(parse_errors) if parse_errors else None,
                "parsed" if parsed_count > 0 else "parse_failed",
                document_id,
            ),
        )
        connection.commit()

        return {
            "documentId": document_id,
            "parsed": parsed_count,
            "errors": parse_errors,
        }
    finally:
        connection.close()


# ---------------------------------------------------------------------------
# Manual single-employee submission
# ---------------------------------------------------------------------------

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
    departure_reason = (
        payload.get("departureReason") or payload.get("departure_reason") or ""
    ).strip()
    performance = _optional_int(payload.get("performance"), "Performance")
    document_id = _optional_int(
        payload.get("documentId") or payload.get("document_id"),
        "Document",
    )
    submission_department = (
        payload.get("submissionDepartment")
        or payload.get("submission_department")
        or payload.get("department")
        or ""
    ).strip() or None
    existing_employee_id = payload.get("employeeId") or payload.get("employee_id")

    if not departure_reason:
        raise ValueError("Departure reason is required.")

    skills = _parse_skills(
        payload.get("skills") or payload.get("skillsRaw") or payload.get("skills_raw") or ""
    )
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


# ---------------------------------------------------------------------------
# List / query
# ---------------------------------------------------------------------------

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


# ---------------------------------------------------------------------------
# Row serialisers
# ---------------------------------------------------------------------------

def document_row_to_dict(row: sqlite3.Row) -> dict:
    d = {
        "id": row["id"],
        "originalFilename": row["original_filename"],
        "fileType": row["file_type"],
        "fileSize": row["file_size"],
        "extractedText": row["extracted_text"],
        "rowCount": row["row_count"],
        "status": row["status"],
        "createdAt": row["created_at"],
    }
    # Columns added in migration 0003 – safe fallback for older rows
    for col, key in [
        ("parsed_employees_count", "parsedEmployeesCount"),
        ("parse_error", "parseError"),
        ("parsed_at", "parsedAt"),
    ]:
        try:
            d[key] = row[col]
        except IndexError:
            d[key] = None
    return d


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
