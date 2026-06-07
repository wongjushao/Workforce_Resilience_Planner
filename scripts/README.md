Quick job-scraper using the generic Playwright scraper

Prereqs

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r scripts/requirements.txt
playwright install
```

Run the generic scraper with a file containing company names and homepage URLs:

```bash
python scripts/company_job_scraper.py --sources-file scripts/company_jobs_.example.txt --out results.json --out-csv results.csv
```

The old PPG entrypoint still works, but it now wraps the generic scraper:

```bash
python scripts/ppg_scraper.py --out ppg_jobs.json --out-csv ppg_jobs.csv
```

Notes
- Use `Company Name | https://example.com` entries for better output labels.
- The scraper discovers careers pages, then job links, then extracts `role`, `department`, `company`, and `required_skills`.
- `scripts/job_scraper.py` now falls back to the Playwright scraper when the graph imports fail, unless you pass `--force-graph`.
- Some sites block scraping or lazy-load jobs; consider authenticated sessions, longer waits, or per-site tweaks.

---

Command-line convenience
------------------------

We've added a top-level `script.sh` wrapper and an improved `run_company_scraper.sh` helper to run the Playwright-based scraper for multiple companies.

Quick examples:

- Dry-run (verify commands):
```bash
./script.sh scripts/job_scraper_companies_example.txt --out-dir /tmp/scrape_outputs --dry-run
```

- Real run (headless):
```bash
./script.sh tmp/ppg_source.txt --out-dir tmp/scrape_outputs --headless
```


Troubleshooting:
- If you see `Discovered 0 candidate job links`, the homepage likely points to a marketing careers page with heavy JS rendering; try running without `--headless` or increasing timeouts.
- For sites with heavy JS or bot protection, run without `--headless` to observe browser behavior, or increase timeouts in `company_job_scraper.py`.

