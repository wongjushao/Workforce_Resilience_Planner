-- Migration: 0003_intake_parse_tracking
-- Track employee-parsing state on intake_documents.

ALTER TABLE intake_documents ADD COLUMN parsed_employees_count INTEGER;
ALTER TABLE intake_documents ADD COLUMN parse_error TEXT;
ALTER TABLE intake_documents ADD COLUMN parsed_at TEXT;
