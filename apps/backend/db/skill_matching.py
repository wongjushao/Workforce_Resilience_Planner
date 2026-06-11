"""Match free-text skill labels against the skills catalog."""

from __future__ import annotations

import re
import sqlite3
from dataclasses import dataclass
from difflib import SequenceMatcher
from typing import Iterable


MIN_SKILL_NAME_LENGTH = 3
MIN_SUBSTRING_SKILL_NAME_LENGTH = 5
DEFAULT_SIMILARITY_THRESHOLD = 0.82

_NOISE_PATTERNS = (
    r"employee benefits",
    r"explore location",
    r"apply now",
    r"save job",
    r"get notified",
    r"sign up to receive",
    r"enter email address",
    r"by checking this box",
    r"privacy policy",
    r"terms of use",
    r"glassdoor\.com",
    r"ppg values your feedback",
    r"benefits will be discussed",
    r"#li-",
    r"prime success factors",
    r"individual success factors",
)


@dataclass(frozen=True)
class SkillMatch:
    skill_id: int
    skill_name: str
    raw_text: str
    match_type: str
    score: float


def normalize_skill_text(value: str) -> str:
    cleaned = re.sub(r"\s+", " ", (value or "").strip())
    cleaned = re.sub(r"^[•\-*\u2022\d.)]+\s*", "", cleaned)
    cleaned = cleaned.strip(" ,;.")
    return cleaned


def is_noise_skill(value: str) -> bool:
    lowered = value.lower()
    if len(lowered) < MIN_SKILL_NAME_LENGTH:
        return True
    if len(lowered) > 180:
        return True
    return any(re.search(pattern, lowered) for pattern in _NOISE_PATTERNS)


def split_skill_candidates(raw_values: Iterable[str]) -> list[str]:
    candidates: list[str] = []
    seen: set[str] = set()

    for raw in raw_values:
        text = normalize_skill_text(raw)
        if not text or is_noise_skill(text):
            continue

        parts = re.split(r"[,\n;|/]+", text)
        if len(parts) == 1:
            parts = [text]

        for part in parts:
            candidate = normalize_skill_text(part)
            if not candidate or is_noise_skill(candidate):
                continue
            key = candidate.lower()
            if key in seen:
                continue
            seen.add(key)
            candidates.append(candidate)

    return candidates


@dataclass
class SkillCatalog:
    exact_index: dict[str, tuple[int, str]]
    by_first_char: dict[str, list[tuple[int, str]]]


def load_skill_catalog(connection: sqlite3.Connection) -> SkillCatalog:
    rows = connection.execute("SELECT id, skill_name FROM skills").fetchall()
    exact_index: dict[str, tuple[int, str]] = {}
    by_first_char: dict[str, list[tuple[int, str]]] = {}

    for row in rows:
        skill_id = row["id"]
        skill_name = row["skill_name"]
        exact_index[skill_name.lower()] = (skill_id, skill_name)
        first_char = skill_name[:1].lower()
        by_first_char.setdefault(first_char, []).append((skill_id, skill_name))

    return SkillCatalog(exact_index=exact_index, by_first_char=by_first_char)


def _similarity(left: str, right: str) -> float:
    return SequenceMatcher(None, left.lower(), right.lower()).ratio()


def _substring_match(
    connection: sqlite3.Connection,
    candidate: str,
) -> SkillMatch | None:
    row = connection.execute(
        """
        SELECT id, skill_name
        FROM skills
        WHERE lower(?) LIKE '%' || lower(skill_name) || '%'
          AND length(skill_name) >= ?
        ORDER BY length(skill_name) DESC
        LIMIT 1
        """,
        (candidate, MIN_SUBSTRING_SKILL_NAME_LENGTH),
    ).fetchone()
    if row is None:
        return None

    skill_name = row["skill_name"]
    if len(skill_name) < 8 and not re.search(
        rf"\b{re.escape(skill_name)}\b",
        candidate,
        flags=re.IGNORECASE,
    ):
        return None

    return SkillMatch(
        skill_id=row["id"],
        skill_name=row["skill_name"],
        raw_text=candidate,
        match_type="substring",
        score=len(row["skill_name"]) / max(len(candidate), 1),
    )


def _similarity_match(
    candidate: str,
    catalog: SkillCatalog,
    *,
    threshold: float,
) -> SkillMatch | None:
    first_char = candidate[:1].lower()
    pool = catalog.by_first_char.get(first_char, [])
    if not pool:
        return None

    best_match: SkillMatch | None = None
    for skill_id, skill_name in pool:
        score = _similarity(candidate, skill_name)
        if score >= threshold and (best_match is None or score > best_match.score):
            best_match = SkillMatch(
                skill_id=skill_id,
                skill_name=skill_name,
                raw_text=candidate,
                match_type="similar",
                score=score,
            )
    return best_match


def find_best_skill_match(
    connection: sqlite3.Connection,
    raw_text: str,
    catalog: SkillCatalog,
    *,
    threshold: float = DEFAULT_SIMILARITY_THRESHOLD,
) -> SkillMatch | None:
    candidate = normalize_skill_text(raw_text)
    if not candidate or is_noise_skill(candidate):
        return None

    exact = catalog.exact_index.get(candidate.lower())
    if exact is not None:
        skill_id, skill_name = exact
        return SkillMatch(
            skill_id=skill_id,
            skill_name=skill_name,
            raw_text=candidate,
            match_type="exact",
            score=1.0,
        )

    substring = _substring_match(connection, candidate)
    if substring is not None:
        return substring

    return _similarity_match(candidate, catalog, threshold=threshold)


def match_skills_for_vacancy(
    connection: sqlite3.Connection,
    raw_values: Iterable[str],
    catalog: SkillCatalog,
    *,
    threshold: float = DEFAULT_SIMILARITY_THRESHOLD,
) -> list[SkillMatch]:
    matched: list[SkillMatch] = []
    seen_skill_ids: set[int] = set()

    for candidate in split_skill_candidates(raw_values):
        result = find_best_skill_match(
            connection,
            candidate,
            catalog,
            threshold=threshold,
        )
        if result is None or result.skill_id in seen_skill_ids:
            continue
        seen_skill_ids.add(result.skill_id)
        matched.append(result)

    return matched
