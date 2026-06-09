"""Hierarchical skill topic taxonomy seed data."""

from __future__ import annotations

import sqlite3

SKILL_TOPIC_TREE: dict[str, list[str]] = {
    "Computer Science / IT": [
        "Programming",
        "Database",
        "Cloud & DevOps",
        "Security",
        "Networking",
        "Testing & QA",
        "Data & AI",
        "System Design",
    ],
    "Engineering": [
        "Engineering Fundamentals",
        "Design & Modeling",
        "Manufacturing & Operations",
        "Materials & Processes",
        "Quality Engineering",
        "Safety & Compliance",
        "Automation & Control",
        "Maintenance & Reliability",
    ],
    "Business & Management": [
        "Business Analysis",
        "Finance",
        "Strategy",
        "Operations Management",
        "Project Management",
        "Risk Management",
        "Procurement",
        "Customer Management",
    ],
    "Sales & Marketing": [
        "Sales",
        "Negotiation",
        "Market Research",
        "Digital Marketing",
        "Brand Management",
        "Customer Success",
        "Content Creation",
        "CRM",
    ],
    "Data & Analytics": [
        "Statistics",
        "Data Analysis",
        "Data Visualization",
        "Business Intelligence",
        "Machine Learning",
        "Research Methods",
        "Data Governance",
    ],
    "Manufacturing & Supply Chain": [
        "Production Planning",
        "Inventory Management",
        "Supply Chain",
        "Logistics",
        "Lean Manufacturing",
        "Quality Control",
        "Vendor Management",
    ],
    "Healthcare": [
        "Clinical Knowledge",
        "Patient Care",
        "Medical Technology",
        "Healthcare Compliance",
        "Documentation",
        "Diagnosis Support",
        "Research",
    ],
    "Education & Training": [
        "Teaching",
        "Curriculum Design",
        "Assessment",
        "Facilitation",
        "Learning Technology",
        "Coaching",
    ],
    "General / Cross-functional": [
        "Soft Skills",
        "Communication",
        "Leadership",
    ],
}


def seed_skill_topics(conn: sqlite3.Connection) -> dict[str, int]:
    """Insert the topic tree and return a name -> id map for all nodes."""
    topic_to_id: dict[str, int] = {}

    for domain, subtopics in SKILL_TOPIC_TREE.items():
        cursor = conn.execute(
            "INSERT OR IGNORE INTO skill_topic (name, parent_id) VALUES (?, NULL)",
            (domain,),
        )
        if cursor.rowcount:
            domain_id = cursor.lastrowid
        else:
            domain_id = conn.execute(
                "SELECT id FROM skill_topic WHERE name = ? AND parent_id IS NULL",
                (domain,),
            ).fetchone()[0]
        topic_to_id[domain] = domain_id

        for subtopic in subtopics:
            cursor = conn.execute(
                "INSERT OR IGNORE INTO skill_topic (name, parent_id) VALUES (?, ?)",
                (subtopic, domain_id),
            )
            if cursor.rowcount:
                subtopic_id = cursor.lastrowid
            else:
                subtopic_id = conn.execute(
                    "SELECT id FROM skill_topic WHERE name = ? AND parent_id = ?",
                    (subtopic, domain_id),
                ).fetchone()[0]
            topic_to_id[subtopic] = subtopic_id

    print(f"  skill_topic: {len(topic_to_id)} nodes")
    return topic_to_id
