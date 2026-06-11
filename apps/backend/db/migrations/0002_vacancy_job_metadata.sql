-- Migration: 0002_vacancy_job_metadata
-- Add scraped job metadata to vacancies for dedup and display.

ALTER TABLE vacancies ADD COLUMN apply_url TEXT;
ALTER TABLE vacancies ADD COLUMN location TEXT;
ALTER TABLE vacancies ADD COLUMN description TEXT;
ALTER TABLE vacancies ADD COLUMN employment_type TEXT;
ALTER TABLE vacancies ADD COLUMN remote_status TEXT;
ALTER TABLE vacancies ADD COLUMN source_url TEXT;
ALTER TABLE vacancies ADD COLUMN scraped_at TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_vacancies_apply_url
  ON vacancies (apply_url)
  WHERE apply_url IS NOT NULL;
