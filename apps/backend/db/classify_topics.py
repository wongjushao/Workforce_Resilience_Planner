"""Classify skills and essential_skills into the skill_topic taxonomy.

Phase 1a — rule-based matching (deterministic, fast)
Phase 1b — Ollama batch for rows still unclassified
Phase 1c — rows with topic_confidence < 0.7 are flagged as pending review

Usage (from apps/backend):
    DATABASE_URL=file:../../data/workforce.db python -m db.classify_topics --source rule
    DATABASE_URL=file:../../data/workforce.db python -m db.classify_topics --source ollama
    DATABASE_URL=file:../../data/workforce.db python -m db.classify_topics --dry-run
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sqlite3
from dataclasses import dataclass

import httpx

from db import get_db_path
from db.skill_topics import SKILL_TOPIC_TREE

REVIEW_CONFIDENCE_THRESHOLD = 0.7
DEFAULT_OLLAMA_URL = os.getenv(
    "OLLAMA_URL", "http://localhost:11434/api/generate"
)
DEFAULT_OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")

# O*NET element names (category=skill) mapped to Soft Skills.
SOFT_SKILL_NAMES = frozenset(
    {
        "Active Learning",
        "Active Listening",
        "Complex Problem Solving",
        "Coordination",
        "Critical Thinking",
        "Equipment Maintenance",
        "Equipment Selection",
        "Installation",
        "Instructing",
        "Judgment and Decision Making",
        "Learning Strategies",
        "Management of Financial Resources",
        "Management of Material Resources",
        "Management of Personnel Resources",
        "Mathematics",
        "Monitoring",
        "Negotiation",
        "Operation and Control",
        "Operations Analysis",
        "Operations Monitoring",
        "Persuasion",
        "Programming",
        "Quality Control Analysis",
        "Reading Comprehension",
        "Repairing",
        "Science",
        "Service Orientation",
        "Social Perceptiveness",
        "Speaking",
        "Systems Analysis",
        "Systems Evaluation",
        "Technology Design",
        "Time Management",
        "Troubleshooting",
        "Writing",
    }
)

# (compiled regex, sub_topic name, confidence)
NAME_TOPIC_RULES: list[tuple[re.Pattern[str], str, float]] = [
    (re.compile(r"\b(python|java\b(?!script)|c\+\+|c#|javascript|typescript|ruby|php|golang|\bgo\b|rust|swift|kotlin|perl|scala|visual basic|vb\.net|matlab|fortran|cobol)\b", re.I), "Programming", 0.95),
    (re.compile(r"\b(mysql|postgresql|postgres|oracle\b(?!\s+erp)|mongodb|redis|sqlite|mariadb|sql\s*server|db2|cassandra|dynamodb|snowflake|bigquery)\b", re.I), "Database", 0.95),
    (re.compile(r"\b(aws|amazon web services|docker|kubernetes|k8s|azure|google cloud|gcp|terraform|jenkins|ansible|puppet|chef|ci/?cd|devops|helm|openshift)\b", re.I), "Cloud & DevOps", 0.95),
    (re.compile(r"\b(excel|tableau|power\s*bi|looker|qlik|spotfire|sas\b(?!\s+software))\b", re.I), "Business Intelligence", 0.9),
    (re.compile(r"\b(sap\b|salesforce|hubspot|dynamics\s*365|workday|servicenow)\b", re.I), "CRM", 0.9),
    (re.compile(r"\b(jira|confluence|asana|trello|monday\.com|basecamp|smartsheet)\b", re.I), "Project Management", 0.85),
    (re.compile(r"\b(git\b|github|gitlab|bitbucket|svn|mercurial)\b", re.I), "Programming", 0.9),
    (re.compile(r"\b(linux|unix|windows\s*server|macos|ubuntu|centos|debian)\b", re.I), "System Design", 0.85),
    (re.compile(r"\b(selenium|junit|pytest|mocha|jest|cypress|testng)\b", re.I), "Testing & QA", 0.9),
    (re.compile(r"\b(tensorflow|pytorch|scikit-learn|keras|hugging\s*face|openai|llm|machine\s*learning)\b", re.I), "Machine Learning", 0.9),
]

CATEGORY_TOPIC_MAP: dict[str, tuple[str, float]] = {
    "Data base user interface and query software": ("Database", 0.9),
    "Data base management system software": ("Database", 0.9),
    "Data base reporting software": ("Business Intelligence", 0.9),
    "Development environment software": ("Programming", 0.9),
    "Object or component oriented development software": ("Programming", 0.9),
    "Web platform development software": ("Programming", 0.9),
    "Web page creation and editing software": ("Programming", 0.85),
    "Program testing software": ("Testing & QA", 0.9),
    "Network monitoring software": ("Networking", 0.9),
    "Network security or virtual private network VPN software": ("Security", 0.9),
    "Transaction security and virus protection software": ("Security", 0.9),
    "Operating system software": ("System Design", 0.85),
    "Enterprise resource planning ERP software": ("Operations Management", 0.9),
    "Customer relationship management CRM software": ("CRM", 0.9),
    "Accounting software": ("Finance", 0.9),
    "Financial analysis software": ("Finance", 0.9),
    "Tax preparation software": ("Finance", 0.85),
    "Human resources software": ("Customer Management", 0.85),
    "Project management software": ("Project Management", 0.9),
    "Spreadsheet software": ("Data Analysis", 0.9),
    "Presentation software": ("Data Visualization", 0.85),
    "Analytical or scientific software": ("Data Analysis", 0.85),
    "Medical software": ("Medical Technology", 0.9),
    "Computer aided design CAD software": ("Design & Modeling", 0.9),
    "Computer aided manufacturing CAM software": ("Manufacturing & Operations", 0.9),
    "Industrial control software": ("Automation & Control", 0.9),
    "Graphics or photo imaging software": ("Design & Modeling", 0.85),
    "Document management software": ("Documentation", 0.85),
    "Compliance software": ("Safety & Compliance", 0.85),
    "Materials requirements planning logistics and supply chain software": ("Supply Chain", 0.9),
    "Inventory management software": ("Inventory Management", 0.9),
    "Point of sale POS software": ("Sales", 0.85),
    "Computer based training software": ("Learning Technology", 0.9),
    "Word processing software": ("Communication", 0.8),
    "Electronic mail software": ("Communication", 0.8),
    "Office suite software": ("Communication", 0.75),
    "Calendar and scheduling software": ("Operations Management", 0.8),
    "Facilities management software": ("Operations Management", 0.8),
    "Information retrieval or search software": ("Data Analysis", 0.8),
    "Map creation software": ("Design & Modeling", 0.8),
    "Music or sound editing software": ("Content Creation", 0.8),
    "Video creation and editing software": ("Content Creation", 0.8),
    "Time accounting software": ("Finance", 0.85),
    "Expert system software": ("Data & AI", 0.8),
    "Library software": ("Research Methods", 0.75),
    "Content workflow software": ("Digital Marketing", 0.8),
    "Desktop publishing software": ("Content Creation", 0.8),
    "Configuration management software": ("Cloud & DevOps", 0.85),
    "Enterprise application integration software": ("System Design", 0.85),
    "Metadata management software": ("Data Governance", 0.8),
    "Optical character reader OCR or scanning software": ("Documentation", 0.75),
    "Charting software": ("Data Visualization", 0.85),
    "Data mining software": ("Data Analysis", 0.9),
    "Pattern design software": ("Design & Modeling", 0.85),
    "Procurement software": ("Procurement", 0.9),
    "Risk management software": ("Risk Management", 0.9),
    "Sales and marketing software": ("Digital Marketing", 0.85),
    "Helpdesk or call center software": ("Customer Success", 0.8),
    "Internet browser software": ("Networking", 0.75),
    "Cloud-based data access and sharing software": ("Cloud & DevOps", 0.85),
    "Compiler and decompiler software": ("Programming", 0.9),
    "File versioning software": ("Cloud & DevOps", 0.8),
    "Video conferencing software": ("Communication", 0.85),
    "Access software": ("Networking", 0.8),
    "Transaction server software": ("System Design", 0.85),
    "Desktop communications software": ("Communication", 0.85),
    "Geographic information system": ("Data Analysis", 0.85),
    "Instant messaging software": ("Communication", 0.85),
    "Business intelligence and data analysis software": ("Business Intelligence", 0.9),
    "Communications server software": ("Networking", 0.85),
    "Enterprise system management software": ("Cloud & DevOps", 0.85),
    "Process mapping and design software": ("Design & Modeling", 0.85),
    "Cloud-based management software": ("Cloud & DevOps", 0.85),
    "Backup or archival software": ("System Design", 0.8),
    "Application server software": ("System Design", 0.85),
    "Clustering software": ("Cloud & DevOps", 0.8),
    "Computerized maintenance management system CMMS": ("Maintenance & Reliability", 0.85),
    "Data base reporting software": ("Business Intelligence", 0.9),
    "License management software": ("Safety & Compliance", 0.75),
    "Mailing and shipping software": ("Logistics", 0.8),
    "Materials requirements planning logistics and supply chain software": ("Supply Chain", 0.9),
    "Medical equipment diagnostic software": ("Medical Technology", 0.85),
    "Mobile location based services software": ("Data Analysis", 0.75),
    "Network security and virtual private network VPN software": ("Security", 0.9),
    "Office suite software": ("Communication", 0.75),
    "Operating system software": ("System Design", 0.85),
    "Optical character reader OCR or scanning software": ("Documentation", 0.75),
    "Platform interconnectivity software": ("System Design", 0.8),
    "Portal server software": ("Networking", 0.8),
    "Project management software": ("Project Management", 0.9),
    "Spreadsheet software": ("Data Analysis", 0.9),
    "Storage networking software": ("Networking", 0.85),
    "Switch or router software": ("Networking", 0.85),
    "Tax preparation software": ("Finance", 0.85),
    "Telephone switchboard software": ("Communication", 0.75),
    "Web platform development software": ("Programming", 0.9),
    "Word processing software": ("Communication", 0.8),
}

KNOWLEDGE_TOPIC_MAP: dict[str, tuple[str, float]] = {
    "Computers and Electronics": ("Programming", 0.85),
    "Engineering and Technology": ("Engineering Fundamentals", 0.9),
    "Economics and Accounting": ("Finance", 0.9),
    "Administration and Management": ("Operations Management", 0.9),
    "Personnel and Human Resources": ("Customer Management", 0.85),
    "Sales and Marketing": ("Sales", 0.85),
    "Medicine and Dentistry": ("Clinical Knowledge", 0.9),
    "Therapy and Counseling": ("Patient Care", 0.9),
    "Biology": ("Clinical Knowledge", 0.8),
    "Chemistry": ("Research", 0.8),
    "Physics": ("Engineering Fundamentals", 0.8),
    "Mathematics": ("Statistics", 0.85),
    "Psychology": ("Research Methods", 0.8),
    "Law and Government": ("Healthcare Compliance", 0.75),
    "Public Safety and Security": ("Safety & Compliance", 0.85),
    "Production and Processing": ("Production Planning", 0.85),
    "Mechanical": ("Engineering Fundamentals", 0.85),
    "Building and Construction": ("Manufacturing & Operations", 0.85),
    "Design": ("Design & Modeling", 0.85),
    "Education and Training": ("Teaching", 0.9),
    "English Language": ("Communication", 0.85),
    "Foreign Language": ("Communication", 0.8),
    "Communications and Media": ("Digital Marketing", 0.8),
    "Customer and Personal Service": ("Customer Success", 0.85),
    "Food Production": ("Production Planning", 0.8),
    "Transportation": ("Logistics", 0.85),
    "Telecommunications": ("Networking", 0.85),
    "Geography": ("Research Methods", 0.75),
    "History and Archeology": ("Research Methods", 0.75),
    "Philosophy and Theology": ("Research Methods", 0.7),
    "Sociology and Anthropology": ("Research Methods", 0.8),
    "Fine Arts": ("Content Creation", 0.8),
    "Administrative": ("Operations Management", 0.8),
}

WORK_ACTIVITY_PATTERNS: list[tuple[re.Pattern[str], str, float]] = [
    (re.compile(r"communicat", re.I), "Communication", 0.85),
    (re.compile(r"coach", re.I), "Coaching", 0.9),
    (re.compile(r"teach|train|instruct", re.I), "Teaching", 0.9),
    (re.compile(r"lead|guid|motivat|direct subordinate", re.I), "Leadership", 0.85),
    (re.compile(r"sell|influenc", re.I), "Sales", 0.85),
    (re.compile(r"negotiat|conflict", re.I), "Negotiation", 0.85),
    (re.compile(r"plan|organiz|schedul|prioritiz", re.I), "Project Management", 0.8),
    (re.compile(r"computer", re.I), "Programming", 0.8),
    (re.compile(r"repair|maintain", re.I), "Maintenance & Reliability", 0.85),
    (re.compile(r"inspect|quality|compliance|standard", re.I), "Quality Control", 0.8),
    (re.compile(r"document|record", re.I), "Documentation", 0.85),
    (re.compile(r"analyz|process information|evaluat", re.I), "Business Analysis", 0.8),
    (re.compile(r"strateg", re.I), "Strategy", 0.85),
    (re.compile(r"team|interpersonal", re.I), "Soft Skills", 0.8),
    (re.compile(r"creativ", re.I), "Soft Skills", 0.75),
    (re.compile(r"care|assist", re.I), "Patient Care", 0.8),
    (re.compile(r"staff", re.I), "Customer Management", 0.8),
    (re.compile(r"getting information|updating.*knowledge", re.I), "Business Analysis", 0.8),
    (re.compile(r"monitoring process|monitoring and controlling", re.I), "Quality Control", 0.8),
    (re.compile(r"identifying objects", re.I), "Business Analysis", 0.75),
    (re.compile(r"estimating the quantifiable", re.I), "Business Analysis", 0.8),
    (re.compile(r"judging the qualities", re.I), "Quality Control", 0.8),
    (re.compile(r"processing information", re.I), "Business Analysis", 0.8),
    (re.compile(r"making decisions", re.I), "Soft Skills", 0.8),
    (re.compile(r"physical activit|handling and moving", re.I), "Logistics", 0.75),
    (re.compile(r"controlling machines|operating vehicles", re.I), "Automation & Control", 0.8),
    (re.compile(r"drafting|laying out|specifying technical", re.I), "Design & Modeling", 0.85),
    (re.compile(r"interpreting the meaning", re.I), "Communication", 0.85),
    (re.compile(r"working directly with the public", re.I), "Customer Success", 0.85),
    (re.compile(r"coordinating the work", re.I), "Project Management", 0.8),
    (re.compile(r"consultation and advice", re.I), "Business Analysis", 0.85),
    (re.compile(r"administrative activit", re.I), "Operations Management", 0.8),
]


@dataclass(frozen=True)
class Classification:
    topic_id: int
    topic_source: str
    topic_confidence: float


def _subtopic_names() -> list[str]:
    return [sub for subs in SKILL_TOPIC_TREE.values() for sub in subs]


def load_topic_map(conn: sqlite3.Connection) -> dict[str, int]:
    """Return sub-topic name -> id for leaf nodes only."""
    rows = conn.execute(
        "SELECT id, name FROM skill_topic WHERE parent_id IS NOT NULL"
    ).fetchall()
    return {name: topic_id for topic_id, name in rows}


def _resolve_topic(topic_name: str, topic_map: dict[str, int]) -> int | None:
    return topic_map.get(topic_name)


def classify_by_rules(
    name: str,
    category: str | None,
    *,
    table: str,
    topic_map: dict[str, int],
) -> Classification | None:
    """Return a rule-based classification, or None if no rule matched."""
    if table == "essential_skills":
        if category == "skill" and name in SOFT_SKILL_NAMES:
            topic_id = _resolve_topic("Soft Skills", topic_map)
            if topic_id is not None:
                return Classification(topic_id, "rule", 1.0)

        if category == "knowledge":
            match = KNOWLEDGE_TOPIC_MAP.get(name)
            if match:
                topic_name, confidence = match
                topic_id = _resolve_topic(topic_name, topic_map)
                if topic_id is not None:
                    return Classification(topic_id, "rule", confidence)

        if category == "work_activity":
            for pattern, topic_name, confidence in WORK_ACTIVITY_PATTERNS:
                if pattern.search(name):
                    topic_id = _resolve_topic(topic_name, topic_map)
                    if topic_id is not None:
                        return Classification(topic_id, "rule", confidence)

    if table == "skills" and category:
        match = CATEGORY_TOPIC_MAP.get(category)
        if match:
            topic_name, confidence = match
            topic_id = _resolve_topic(topic_name, topic_map)
            if topic_id is not None:
                return Classification(topic_id, "rule", confidence)

    for pattern, topic_name, confidence in NAME_TOPIC_RULES:
        if pattern.search(name):
            topic_id = _resolve_topic(topic_name, topic_map)
            if topic_id is not None:
                return Classification(topic_id, "rule", confidence)

    return None


def _build_ollama_prompt(name: str, category: str | None, subtopics: list[str]) -> str:
    category_line = f"Category: {category}\n" if category else ""
    topics_json = json.dumps(subtopics)
    return (
        "Classify this workforce skill into exactly one sub-topic from the list below.\n"
        f"Skill: {name}\n"
        f"{category_line}"
        f"Valid sub-topics: {topics_json}\n"
        'Respond with JSON only: {"sub_topic": "<name from list>", "confidence": 0.0-1.0}'
    )


def _parse_ollama_response(text: str) -> tuple[str, float] | None:
    text = text.strip()
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1:
        return None
    try:
        payload = json.loads(text[start : end + 1])
    except json.JSONDecodeError:
        return None
    sub_topic = payload.get("sub_topic")
    confidence = payload.get("confidence")
    if not isinstance(sub_topic, str) or not isinstance(confidence, (int, float)):
        return None
    return sub_topic.strip(), float(confidence)


def classify_by_ollama(
    name: str,
    category: str | None,
    *,
    topic_map: dict[str, int],
    subtopics: list[str],
    ollama_url: str = DEFAULT_OLLAMA_URL,
    ollama_model: str = DEFAULT_OLLAMA_MODEL,
    timeout: float = 120.0,
) -> Classification | None:
    prompt = _build_ollama_prompt(name, category, subtopics)
    try:
        with httpx.Client(timeout=timeout) as client:
            response = client.post(
                ollama_url,
                json={
                    "model": ollama_model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {"temperature": 0},
                },
            )
            response.raise_for_status()
    except httpx.HTTPError:
        return None

    payload = response.json()
    parsed = _parse_ollama_response(payload.get("response", ""))
    if parsed is None:
        return None

    sub_topic, confidence = parsed
    topic_id = _resolve_topic(sub_topic, topic_map)
    if topic_id is None:
        return None

    source = "pending" if confidence < REVIEW_CONFIDENCE_THRESHOLD else "ollama"
    return Classification(topic_id, source, confidence)


def _apply_classification(
    conn: sqlite3.Connection,
    table: str,
    row_id: int,
    result: Classification,
    *,
    dry_run: bool,
) -> None:
    if dry_run:
        return
    name_col = "name" if table == "essential_skills" else "skill_name"
    conn.execute(
        f"""
        UPDATE {table}
        SET skill_topic_id = ?, topic_source = ?, topic_confidence = ?
        WHERE id = ?
        """,
        (result.topic_id, result.topic_source, result.topic_confidence, row_id),
    )


def _classify_table_rules(
    conn: sqlite3.Connection,
    table: str,
    topic_map: dict[str, int],
    *,
    dry_run: bool,
) -> tuple[int, int]:
    name_col = "name" if table == "essential_skills" else "skill_name"
    rows = conn.execute(
        f"""
        SELECT id, {name_col}, category
        FROM {table}
        WHERE skill_topic_id IS NULL
        """
    ).fetchall()

    classified = 0
    for row_id, name, category in rows:
        result = classify_by_rules(name, category, table=table, topic_map=topic_map)
        if result is None:
            continue
        _apply_classification(conn, table, row_id, result, dry_run=dry_run)
        classified += 1

    return classified, len(rows) - classified


def _classify_table_ollama(
    conn: sqlite3.Connection,
    table: str,
    topic_map: dict[str, int],
    *,
    dry_run: bool,
    ollama_url: str,
    ollama_model: str,
) -> tuple[int, int, int]:
    name_col = "name" if table == "essential_skills" else "skill_name"
    rows = conn.execute(
        f"""
        SELECT id, {name_col}, category
        FROM {table}
        WHERE skill_topic_id IS NULL
        """
    ).fetchall()

    subtopics = _subtopic_names()
    classified = 0
    pending_review = 0
    for row_id, name, category in rows:
        result = classify_by_ollama(
            name,
            category,
            topic_map=topic_map,
            subtopics=subtopics,
            ollama_url=ollama_url,
            ollama_model=ollama_model,
        )
        if result is None:
            continue
        if result.topic_source == "pending":
            pending_review += 1
        _apply_classification(conn, table, row_id, result, dry_run=dry_run)
        classified += 1

    return classified, len(rows) - classified, pending_review


def classify_topics(
    conn: sqlite3.Connection,
    *,
    use_rules: bool = True,
    use_ollama: bool = False,
    dry_run: bool = False,
    ollama_url: str = DEFAULT_OLLAMA_URL,
    ollama_model: str = DEFAULT_OLLAMA_MODEL,
) -> dict[str, int]:
    """Classify unassigned rows in essential_skills and skills. Returns summary counts."""
    topic_map = load_topic_map(conn)
    summary = {
        "essential_skills_rule": 0,
        "essential_skills_ollama": 0,
        "essential_skills_remaining": 0,
        "skills_rule": 0,
        "skills_ollama": 0,
        "skills_remaining": 0,
        "pending_review": 0,
    }

    if use_rules:
        print("  Classifying with rules...")
        for table, key in (("essential_skills", "essential_skills"), ("skills", "skills")):
            classified, remaining = _classify_table_rules(
                conn, table, topic_map, dry_run=dry_run
            )
            summary[f"{key}_rule"] = classified
            summary[f"{key}_remaining"] = remaining
            print(f"    {table}: {classified} classified, {remaining} remaining")

    if use_ollama:
        print("  Classifying with Ollama...")
        for table, key in (("essential_skills", "essential_skills"), ("skills", "skills")):
            classified, remaining, pending = _classify_table_ollama(
                conn,
                table,
                topic_map,
                dry_run=dry_run,
                ollama_url=ollama_url,
                ollama_model=ollama_model,
            )
            summary[f"{key}_ollama"] = classified
            summary[f"{key}_remaining"] = remaining
            summary["pending_review"] += pending
            print(
                f"    {table}: {classified} classified, {remaining} remaining"
                + (f", {pending} flagged for review" if pending else "")
            )

    if summary["pending_review"]:
        print(
            f"  Review queue: {summary['pending_review']} rows with "
            f"confidence < {REVIEW_CONFIDENCE_THRESHOLD} (topic_source=pending)"
        )

    return summary


def main() -> None:
    parser = argparse.ArgumentParser(description="Classify skills into skill topics.")
    parser.add_argument(
        "--source",
        choices=("rule", "ollama", "all"),
        default="all",
        help="rule = rules only; ollama = LLM for unclassified rows; all = rules then ollama",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview classifications without writing to the database",
    )
    parser.add_argument(
        "--ollama-url",
        default=DEFAULT_OLLAMA_URL,
        help=f"Ollama generate endpoint (default: {DEFAULT_OLLAMA_URL})",
    )
    parser.add_argument(
        "--ollama-model",
        default=DEFAULT_OLLAMA_MODEL,
        help=f"Ollama model name (default: {DEFAULT_OLLAMA_MODEL})",
    )
    args = parser.parse_args()

    use_rules = args.source in {"rule", "all"}
    use_ollama = args.source in {"ollama", "all"}

    db_path = get_db_path()
    print(f"Database: {db_path}")
    if args.dry_run:
        print("Dry run — no writes.")

    conn = sqlite3.connect(db_path)
    try:
        conn.execute("PRAGMA foreign_keys = ON")
        classify_topics(
            conn,
            use_rules=use_rules,
            use_ollama=use_ollama,
            dry_run=args.dry_run,
            ollama_url=args.ollama_url,
            ollama_model=args.ollama_model,
        )
        if not args.dry_run:
            conn.commit()
    finally:
        conn.close()


if __name__ == "__main__":
    main()
