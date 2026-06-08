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


def save_manual_submission(payload: dict) -> dict:
    employee_id = payload.get("employeeId") or payload.get("employee_id")
    departure_reason = (payload.get("departureReason") or payload.get("departure_reason") or "").strip()
    performance = payload.get("performance")
    document_id = payload.get("documentId") or payload.get("document_id")

    if employee_id is None:
        raise ValueError("Employee id is required.")
    try:
        employee_id = int(employee_id)
    except (TypeError, ValueError) as error:
        raise ValueError("Employee id must be an integer.") from error
    if not departure_reason:
        raise ValueError("Departure reason is required.")
    if performance is not None:
        try:
            performance = int(performance)
        except (TypeError, ValueError) as error:
            raise ValueError("Performance must be an integer.") from error
    if document_id is not None:
        try:
            document_id = int(document_id)
        except (TypeError, ValueError) as error:
            raise ValueError("Document id must be an integer.") from error

    connection = get_connection()
    try:
        employee = connection.execute(
            "SELECT id FROM employees WHERE id = ?",
            (employee_id,),
        ).fetchone()
        if employee is None:
            raise ValueError(f"Employee {employee_id} was not found.")

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
                (payload.get("department") or "").strip() or None,
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
        "employeeName": row["employee_name"],
        "currentRole": row["current_role"],
        "department": row["department"],
        "performance": row["performance"],
        "documentId": row["document_id"],
        "departureReason": row["departure_reason"],
        "createdAt": row["created_at"],
    }
