"""ETL pipeline for company job scraping.

Extract: scrape job listings from configured company homepages.
Transform: normalize records and deduplicate by apply_url.
Load: write combined JSON output (and optionally print to stdout).

Usage:
  python scripts/etl_pipeline.py --headless --out output/jobs.json
  python scripts/etl_pipeline.py --stdout --headless
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional

from playwright.sync_api import sync_playwright

from company_job_scraper import (
    Source,
    load_sources_from_file,
    scrape_company,
)


DEFAULT_SOURCES = Path(__file__).resolve().parent / "company_sources.txt"
DEFAULT_OUTPUT = Path(__file__).resolve().parents[1] / "data" / "src" / "jobs.json"


def _normalize_company_name(name: Optional[str]) -> Optional[str]:
    if not name:
        return None
    cleaned = name.strip()
    aliases = {
        "jpmorgan": "JPMorgan",
        "jp morgan": "JPMorgan",
        "ppg": "PPG",
    }
    return aliases.get(cleaned.lower(), cleaned)


def transform_jobs(jobs: List[Dict]) -> List[Dict]:
    """Normalize job records and remove duplicates."""
    seen_urls: set[str] = set()
    transformed: List[Dict] = []

    for job in jobs:
        apply_url = (job.get("apply_url") or "").strip()
        if apply_url and apply_url in seen_urls:
            continue
        if apply_url:
            seen_urls.add(apply_url)

        normalized = dict(job)
        normalized["company"] = _normalize_company_name(job.get("company"))
        transformed.append(normalized)

    return transformed


def summarize_by_company(jobs: List[Dict], sources: List[Source]) -> List[Dict]:
    counts: Dict[str, int] = {}
    for job in jobs:
        company = job.get("company") or "Unknown"
        counts[company] = counts.get(company, 0) + 1

    summary: List[Dict] = []
    for source in sources:
        company = _normalize_company_name(source.company) or source.company
        summary.append(
            {
                "company": company,
                "source_url": source.url,
                "job_count": counts.get(company, 0),
                "status": "ok" if counts.get(company, 0) > 0 else "no_jobs_found",
            }
        )
    return summary


def extract_jobs(
    sources: List[Source],
    *,
    max_jobs: int,
    headless: bool,
) -> List[Dict]:
    all_jobs: List[Dict] = []

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=headless)
        try:
            for source in sources:
                page = browser.new_page()
                try:
                    company_jobs = scrape_company(page, source, max_jobs=max_jobs)
                    all_jobs.extend(company_jobs)
                except Exception as exc:
                    print(f"[{source.company}] Failed: {exc}", file=sys.stderr)
                finally:
                    page.close()
        finally:
            browser.close()

    return all_jobs


def build_payload(
    jobs: List[Dict],
    sources: List[Source],
    *,
    sources_file: str,
) -> Dict:
    return {
        "pipeline": "job-scraper-etl",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "sources_file": sources_file,
        "companies": summarize_by_company(jobs, sources),
        "job_count": len(jobs),
        "jobs": jobs,
    }


def load_json(path: str, payload: Dict) -> None:
    output_path = Path(path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Run the job-scraper ETL pipeline for configured companies."
    )
    parser.add_argument(
        "--sources-file",
        default=str(DEFAULT_SOURCES),
        help="File with `Company | URL` entries (default: scripts/company_sources.txt)",
    )
    parser.add_argument(
        "--out",
        default=str(DEFAULT_OUTPUT),
        help="Output JSON path (default: data/src/jobs.json)",
    )
    parser.add_argument(
        "--max-jobs",
        type=int,
        default=100,
        help="Maximum jobs to collect per company (default: 100)",
    )
    parser.add_argument(
        "--headless",
        action="store_true",
        help="Run browser headless",
    )
    parser.add_argument(
        "--stdout",
        action="store_true",
        help="Print JSON payload to stdout after the pipeline completes",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    sources = load_sources_from_file(args.sources_file)
    if not sources:
        print("No company sources found.", file=sys.stderr)
        return 1

    print(f"Extracting jobs from {len(sources)} company source(s)...", file=sys.stderr)
    raw_jobs = extract_jobs(sources, max_jobs=args.max_jobs, headless=args.headless)
    jobs = transform_jobs(raw_jobs)
    payload = build_payload(jobs, sources, sources_file=args.sources_file)

    load_json(args.out, payload)
    print(f"Loaded {payload['job_count']} jobs to {args.out}", file=sys.stderr)

    if args.stdout:
        json.dump(payload, sys.stdout, ensure_ascii=False, indent=2)
        sys.stdout.write("\n")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
