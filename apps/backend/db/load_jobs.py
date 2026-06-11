"""Load scraped job JSON from data/src into vacancies and vacancy_skills.

Reads the ETL output (default: data/src/jobs.json), cleans each record,
matches required skills against the existing skills table, and only links
skills when a similar or exact catalog match is found.

Usage (from apps/backend):
    python -m db.load_jobs
    python -m db.load_jobs --src ../../data/src/jobs.json
"""

from __future__ import annotations

import argparse
import json
import re
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from db import get_db_path
from db.migrate import apply_migrations
from db.skill_matching import SkillMatch, load_skill_catalog, match_skills_for_vacancy

DEFAULT_JOBS_JSON = Path(__file__).resolve().parents[3] / "data" / "src" / "jobs.json"

_COMPANY_ALIASES = {
    "jpmorgan": "JPMorgan",
    "jp morgan": "JPMorgan",
    "ppg": "PPG",
}


def _connect() -> sqlite3.Connection:
    db_path = get_db_path()
    Path(db_path).parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(db_path)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def _clean_text(value: Any, *, max_length: int | None = None) -> str | None:
    if value is None:
        return None
    cleaned = re.sub(r"\s+", " ", str(value)).strip()
    if not cleaned:
        return None
    if max_length is not None and len(cleaned) > max_length:
        return cleaned[:max_length].rstrip()
    return cleaned


def _normalize_company(value: Any) -> str | None:
    cleaned = _clean_text(value)
    if not cleaned:
        return None
    return _COMPANY_ALIASES.get(cleaned.lower(), cleaned)


def clean_job(job: dict[str, Any]) -> dict[str, Any] | None:
    title = _clean_text(job.get("title") or job.get("role"), max_length=255)
    if not title:
        return None

    department = _clean_text(job.get("department"), max_length=255)
    if department and len(department) > 120:
        department = None

    apply_url = _clean_text(job.get("apply_url"), max_length=2048)
    required_skills = job.get("required_skills")
    if required_skills is None:
        skill_values: list[str] = []
    elif isinstance(required_skills, list):
        skill_values = [str(item) for item in required_skills if item]
    else:
        skill_values = [str(required_skills)]

    return {
        "title": title,
        "department": department,
        "company": _normalize_company(job.get("company")),
        "location": _clean_text(job.get("location"), max_length=255),
        "description": _clean_text(job.get("description"), max_length=4000),
        "employment_type": _clean_text(job.get("employment_type"), max_length=64),
        "remote_status": _clean_text(job.get("remote_status"), max_length=64),
        "apply_url": apply_url,
        "source_url": _clean_text(job.get("source_url"), max_length=2048),
        "required_skills": skill_values,
    }


def parse_jobs_payload(payload: Any) -> list[dict[str, Any]]:
    if isinstance(payload, list):
        return payload
    if isinstance(payload, dict):
        jobs = payload.get("jobs")
        if isinstance(jobs, list):
            return jobs
    raise ValueError("Expected JSON object with a 'jobs' array or a top-level jobs array.")


def _vacancy_exists(connection: sqlite3.Connection, apply_url: str | None, job: dict[str, Any]) -> bool:
    if apply_url:
        row = connection.execute(
            "SELECT id FROM vacancies WHERE apply_url = ?",
            (apply_url,),
        ).fetchone()
        return row is not None

    row = connection.execute(
        """
        SELECT id
        FROM vacancies
        WHERE title = ?
          AND IFNULL(company, '') = IFNULL(?, '')
          AND IFNULL(department, '') = IFNULL(?, '')
        """,
        (job["title"], job.get("company"), job.get("department")),
    ).fetchone()
    return row is not None


def _insert_vacancy(
    connection: sqlite3.Connection,
    job: dict[str, Any],
    *,
    scraped_at: str,
) -> int:
    cursor = connection.execute(
        """
        INSERT INTO vacancies (
          title, department, company, apply_url, location, description,
          employment_type, remote_status, source_url, scraped_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            job["title"],
            job.get("department"),
            job.get("company"),
            job.get("apply_url"),
            job.get("location"),
            job.get("description"),
            job.get("employment_type"),
            job.get("remote_status"),
            job.get("source_url"),
            scraped_at,
        ),
    )
    return cursor.lastrowid


def _link_vacancy_skills(
    connection: sqlite3.Connection,
    vacancy_id: int,
    matches: list[SkillMatch],
) -> int:
    linked = 0
    for index, match in enumerate(matches):
        weight = max(1.0 - (index * 0.05), 0.5)
        connection.execute(
            """
            INSERT INTO vacancy_skills (vacancy_id, skill_id, weight)
            VALUES (?, ?, ?)
            ON CONFLICT(vacancy_id, skill_id) DO UPDATE SET
              weight = MAX(vacancy_skills.weight, excluded.weight)
            """,
            (vacancy_id, match.skill_id, weight),
        )
        linked += 1
    return linked


def load_jobs_from_json(
    path: Path,
    *,
    similarity_threshold: float = 0.82,
) -> dict[str, Any]:
    if not path.exists():
        return {
            "source": str(path),
            "status": "skipped",
            "reason": "jobs_json_not_found",
            "inserted_vacancies": 0,
            "matched_skills": 0,
        }

    payload = json.loads(path.read_text(encoding="utf-8"))
    raw_jobs = parse_jobs_payload(payload)
    scraped_at = datetime.now(timezone.utc).isoformat()

    connection = _connect()
    try:
        apply_migrations(connection)

        catalog = load_skill_catalog(connection)
        if not catalog.exact_index:
            raise RuntimeError(
                "Skills catalog is empty. Run `python -m db.ingest` before loading jobs."
            )

        stats = {
            "source": str(path),
            "status": "loaded",
            "input_jobs": len(raw_jobs),
            "inserted_vacancies": 0,
            "skipped_existing": 0,
            "skipped_invalid": 0,
            "matched_skills": 0,
            "unmatched_skill_candidates": 0,
            "vacancies_without_skills": 0,
        }
        for raw_job in raw_jobs:
            cleaned = clean_job(raw_job)
            if cleaned is None:
                stats["skipped_invalid"] += 1
                continue

            if _vacancy_exists(connection, cleaned.get("apply_url"), cleaned):
                stats["skipped_existing"] += 1
                continue

            matches = match_skills_for_vacancy(
                connection,
                cleaned.get("required_skills") or [],
                catalog,
                threshold=similarity_threshold,
            )
            candidate_count = len(cleaned.get("required_skills") or [])
            stats["unmatched_skill_candidates"] += max(candidate_count - len(matches), 0)

            vacancy_id = _insert_vacancy(connection, cleaned, scraped_at=scraped_at)
            stats["inserted_vacancies"] += 1

            linked = _link_vacancy_skills(connection, vacancy_id, matches)
            stats["matched_skills"] += linked
            if linked == 0:
                stats["vacancies_without_skills"] += 1

        connection.commit()
        return stats
    finally:
        connection.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Load scraped jobs JSON into the database.")
    parser.add_argument(
        "--src",
        default=str(DEFAULT_JOBS_JSON),
        help="Path to jobs JSON (default: data/src/jobs.json)",
    )
    parser.add_argument(
        "--similarity-threshold",
        type=float,
        default=0.82,
        help="Minimum similarity score for fuzzy skill matching (default: 0.82)",
    )
    args = parser.parse_args()

    stats = load_jobs_from_json(
        Path(args.src),
        similarity_threshold=args.similarity_threshold,
    )
    print(json.dumps(stats, indent=2))


if __name__ == "__main__":
    main()
