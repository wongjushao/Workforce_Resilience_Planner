"""Ingest the O*NET XLSX files from the project `data/src/` folder into SQLite.

This performs a clean rebuild of the reference tables: it resets the database,
replays migrations, and then loads all source data.

Usage (from apps/backend):
    DATABASE_URL=file:../../data/workforce.db python -m db.ingest
    # optional custom source folder:
    python -m db.ingest --src /path/to/src
    # rule-based topic classification only (default):
    python -m db.ingest --skip-ollama
    # rules + Ollama for unclassified skills:
    python -m db.ingest --classify
"""

import argparse
import sqlite3
from pathlib import Path

import pandas as pd

from db import get_db_path
from db.classify_topics import classify_topics
from db.migrate import apply_migrations, reset_database
from db.skill_topics import seed_skill_topics

# Project root is four levels up: apps/backend/db/ingest.py -> repo root.
DEFAULT_SRC = Path(__file__).resolve().parents[3] / "data" / "src"

# Files whose rows are (occupation, element, score) measurements.
# (filename, source label, O*NET element category)
ELEMENT_FILES = [
    ("Essential Skills.xlsx", "essential_skills", "skill"),
    ("Transferable Skills.xlsx", "transferable_skills", "skill"),
    ("Knowledge.xlsx", "knowledge", "knowledge"),
    ("Work Activities.xlsx", "work_activities", "work_activity"),
]


def _clean(value):
    """Convert pandas NaN/NaT to None and strip strings."""
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    if isinstance(value, str):
        value = value.strip()
        return value or None
    return value


def _to_bool(value) -> int | None:
    value = _clean(value)
    if value is None:
        return None
    return 1 if str(value).strip().upper() in {"Y", "YES", "TRUE", "1"} else 0


def _read(src: Path, filename: str) -> pd.DataFrame:
    path = src / filename
    if not path.exists():
        raise FileNotFoundError(f"Expected source file not found: {path}")
    return pd.read_excel(path)


def load_occupations(conn: sqlite3.Connection, src: Path) -> dict[str, int]:
    df = _read(src, "Occupation Data.xlsx")
    rows = []
    for _, r in df.iterrows():
        code = _clean(r["O*NET-SOC Code"])
        if code is None:
            continue
        rows.append((code, _clean(r["Title"]), _clean(r["Description"])))

    conn.executemany(
        "INSERT OR IGNORE INTO occupations (onet_code, title, description) VALUES (?, ?, ?)",
        rows,
    )
    code_to_id = {
        code: oid
        for oid, code in conn.execute("SELECT id, onet_code FROM occupations")
    }
    print(f"  occupations: {len(code_to_id)}")
    return code_to_id


def load_essential_skills(conn: sqlite3.Connection, src: Path) -> dict[str, int]:
    """Collect distinct O*NET element names across all element files."""
    seen: dict[str, tuple[str, str | None]] = {}
    for filename, _source, category in ELEMENT_FILES:
        df = _read(src, filename)
        for name in df["Element Name"].dropna().unique():
            name = name.strip()
            if name and name not in seen:
                seen[name] = (category, None)

    conn.executemany(
        """
        INSERT OR IGNORE INTO essential_skills
          (name, other_name, category, skill_topic_id, topic_source, topic_confidence)
        VALUES (?, ?, ?, NULL, NULL, NULL)
        """,
        [(name, other_name, category) for name, (category, other_name) in seen.items()],
    )
    name_to_id = {
        name: sid for sid, name in conn.execute("SELECT id, name FROM essential_skills")
    }
    print(f"  essential_skills: {len(name_to_id)}")
    return name_to_id


def load_occupation_skills(
    conn: sqlite3.Connection,
    src: Path,
    code_to_id: dict[str, int],
    name_to_id: dict[str, int],
) -> None:
    total = 0
    for filename, source, _category in ELEMENT_FILES:
        df = _read(src, filename)
        rows = []
        for _, r in df.iterrows():
            occ_id = code_to_id.get(_clean(r["O*NET-SOC Code"]))
            skill_id = name_to_id.get(_clean(r["Element Name"]))
            if occ_id is None or skill_id is None:
                continue
            score = _clean(r["Data Value"])
            rows.append(
                (
                    occ_id,
                    skill_id,
                    source,
                    _clean(r["Scale Name"]),
                    float(score) if score is not None else None,
                )
            )
        conn.executemany(
            """
            INSERT INTO occupation_skills
              (occupation_id, skill_id, source, scale_type, score)
            VALUES (?, ?, ?, ?, ?)
            """,
            rows,
        )
        total += len(rows)
    print(f"  occupation_skills: {total}")


def load_related_occupations(
    conn: sqlite3.Connection, src: Path, code_to_id: dict[str, int]
) -> None:
    df = _read(src, "Related Occupations.xlsx")
    rows = []
    skipped = 0
    for _, r in df.iterrows():
        occ_id = code_to_id.get(_clean(r["O*NET-SOC Code"]))
        related_id = code_to_id.get(_clean(r["Related O*NET-SOC Code"]))
        if occ_id is None or related_id is None:
            skipped += 1
            continue
        rows.append((occ_id, related_id, _clean(r["Relatedness Tier"])))
    conn.executemany(
        """
        INSERT INTO related_occupations
          (occupation_id, related_occupation_id, tier)
        VALUES (?, ?, ?)
        """,
        rows,
    )
    note = f" (skipped {skipped} unmatched)" if skipped else ""
    print(f"  related_occupations: {len(rows)}{note}")


def load_alternate_titles(
    conn: sqlite3.Connection, src: Path, code_to_id: dict[str, int]
) -> None:
    df = _read(src, "Job Titles.xlsx")
    rows = []
    for _, r in df.iterrows():
        occ_id = code_to_id.get(_clean(r["O*NET-SOC Code"]))
        title = _clean(r["Job Title"])
        if occ_id is None or title is None:
            continue
        rows.append((occ_id, title))
    conn.executemany(
        "INSERT INTO alternate_titles (occupation_id, title) VALUES (?, ?)",
        rows,
    )
    print(f"  alternate_titles: {len(rows)}")


def load_software_skills(conn: sqlite3.Connection, src: Path) -> dict[str, int]:
    """Deduplicate Workplace Example values into the global skills catalog."""
    df = _read(src, "Software Skills.xlsx")
    seen: dict[str, str | None] = {}
    for _, r in df.iterrows():
        skill_name = _clean(r["Workplace Example"])
        if skill_name is None:
            continue
        if skill_name not in seen:
            seen[skill_name] = _clean(r["Element Name"])

    conn.executemany(
        """
        INSERT OR IGNORE INTO skills
          (skill_name, category, skill_topic_id, topic_source, topic_confidence)
        VALUES (?, ?, NULL, NULL, NULL)
        """,
        [(skill_name, category) for skill_name, category in seen.items()],
    )
    name_to_id = {
        name: sid
        for sid, name in conn.execute("SELECT id, skill_name FROM skills")
    }
    print(f"  skills: {len(name_to_id)}")
    return name_to_id


def load_occupation_technologies(
    conn: sqlite3.Connection,
    src: Path,
    code_to_id: dict[str, int],
    name_to_id: dict[str, int],
) -> None:
    df = _read(src, "Software Skills.xlsx")
    rows = []
    skipped = 0
    for _, r in df.iterrows():
        occ_id = code_to_id.get(_clean(r["O*NET-SOC Code"]))
        skill_id = name_to_id.get(_clean(r["Workplace Example"]))
        if occ_id is None or skill_id is None:
            skipped += 1
            continue
        rows.append(
            (
                occ_id,
                skill_id,
                _to_bool(r["Hot Technology"]),
                _to_bool(r["In Demand"]),
            )
        )
    conn.executemany(
        """
        INSERT OR IGNORE INTO occupation_technologies
          (occupation_id, skill_id, hot_technology, in_demand)
        VALUES (?, ?, ?, ?)
        """,
        rows,
    )
    note = f" (skipped {skipped} unmatched)" if skipped else ""
    print(f"  occupation_technologies: {len(rows)}{note}")


def ingest(src: Path, *, use_ollama: bool = False) -> None:
    db_path = get_db_path()
    Path(db_path).parent.mkdir(parents=True, exist_ok=True)
    print(f"Source folder: {src}")
    print(f"Database:      {db_path}")

    reset_database()
    apply_migrations()

    conn = sqlite3.connect(db_path)
    try:
        conn.execute("PRAGMA foreign_keys = ON")

        print("Seeding skill topics...")
        seed_skill_topics(conn)

        print("Loading O*NET data...")
        code_to_id = load_occupations(conn, src)
        essential_name_to_id = load_essential_skills(conn, src)
        load_occupation_skills(conn, src, code_to_id, essential_name_to_id)
        load_related_occupations(conn, src, code_to_id)
        load_alternate_titles(conn, src, code_to_id)

        software_name_to_id = load_software_skills(conn, src)
        load_occupation_technologies(conn, src, code_to_id, software_name_to_id)

        print("Classifying skill topics...")
        classify_topics(conn, use_rules=True, use_ollama=use_ollama)

        conn.commit()
        print("Done.")
    finally:
        conn.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest O*NET XLSX files into SQLite.")
    parser.add_argument(
        "--src",
        type=Path,
        default=DEFAULT_SRC,
        help=f"Folder containing the XLSX files (default: {DEFAULT_SRC})",
    )
    parser.add_argument(
        "--classify",
        action="store_true",
        help="Run Ollama classification after rule-based matching (requires local Ollama)",
    )
    parser.add_argument(
        "--skip-ollama",
        action="store_true",
        help="Rule-based topic classification only (default behaviour)",
    )
    args = parser.parse_args()
    use_ollama = args.classify and not args.skip_ollama
    ingest(args.src, use_ollama=use_ollama)


if __name__ == "__main__":
    main()
