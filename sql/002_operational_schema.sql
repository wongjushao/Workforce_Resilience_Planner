-- Operational HR schema for redeployment workflow.
-- Target DB: PostgreSQL 14+

BEGIN;

CREATE SCHEMA IF NOT EXISTS ops;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employment_status') THEN
    CREATE TYPE ops.employment_status AS ENUM ('active', 'at_risk', 'redeployed', 'separated');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vacancy_source') THEN
    CREATE TYPE ops.vacancy_source AS ENUM ('internal', 'partner');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'record_status') THEN
    CREATE TYPE ops.record_status AS ENUM ('draft', 'open', 'closed', 'archived');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'risk_level') THEN
    CREATE TYPE ops.risk_level AS ENUM ('low', 'medium', 'high', 'critical');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS ops.departments (
  department_id BIGSERIAL PRIMARY KEY,
  department_code TEXT UNIQUE,
  department_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT
);

CREATE TABLE IF NOT EXISTS ops.employees (
  employee_id BIGSERIAL PRIMARY KEY,
  employee_no TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  department_id BIGINT REFERENCES ops.departments(department_id),
  manager_id BIGINT REFERENCES ops.employees(employee_id),
  current_title TEXT,
  current_onet_soc_code TEXT REFERENCES ref.occupations(onet_soc_code),
  employment_status ops.employment_status NOT NULL DEFAULT 'active',
  consent_flag BOOLEAN NOT NULL DEFAULT FALSE,
  hire_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT
);

CREATE TABLE IF NOT EXISTS ops.employee_skill_profile (
  employee_id BIGINT NOT NULL REFERENCES ops.employees(employee_id) ON DELETE CASCADE,
  element_id TEXT NOT NULL REFERENCES ref.elements(element_id),
  proficiency NUMERIC(5,2) NOT NULL CHECK (proficiency >= 0 AND proficiency <= 100),
  evidence_source TEXT NOT NULL,
  confidence NUMERIC(5,2) CHECK (confidence >= 0 AND confidence <= 100),
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT,
  PRIMARY KEY (employee_id, element_id)
);

CREATE TABLE IF NOT EXISTS ops.vacancies (
  vacancy_id BIGSERIAL PRIMARY KEY,
  source ops.vacancy_source NOT NULL,
  employer_name TEXT NOT NULL,
  title TEXT NOT NULL,
  onet_soc_code TEXT REFERENCES ref.occupations(onet_soc_code),
  department_id BIGINT REFERENCES ops.departments(department_id),
  location_text TEXT,
  required_json JSONB NOT NULL DEFAULT '{}'::JSONB,
  preferred_json JSONB NOT NULL DEFAULT '{}'::JSONB,
  status ops.record_status NOT NULL DEFAULT 'open',
  posted_at TIMESTAMPTZ,
  closes_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT
);

CREATE TABLE IF NOT EXISTS ops.layoff_signal_runs (
  signal_run_id BIGSERIAL PRIMARY KEY,
  source_name TEXT NOT NULL,
  source_type TEXT NOT NULL,
  signal_payload_json JSONB NOT NULL DEFAULT '{}'::JSONB,
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT
);

CREATE TABLE IF NOT EXISTS ops.layoff_signals (
  signal_id BIGSERIAL PRIMARY KEY,
  signal_run_id BIGINT NOT NULL REFERENCES ops.layoff_signal_runs(signal_run_id) ON DELETE CASCADE,
  employee_id BIGINT REFERENCES ops.employees(employee_id),
  department_id BIGINT REFERENCES ops.departments(department_id),
  signal_type TEXT NOT NULL,
  signal_value NUMERIC(10,4),
  signal_weight NUMERIC(8,4),
  signal_json JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT
);

CREATE TABLE IF NOT EXISTS ops.risk_model_runs (
  risk_run_id BIGSERIAL PRIMARY KEY,
  algorithm_version TEXT NOT NULL,
  model_name TEXT NOT NULL,
  run_params_json JSONB NOT NULL DEFAULT '{}'::JSONB,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT
);

CREATE TABLE IF NOT EXISTS ops.layoff_risk_scores (
  risk_score_id BIGSERIAL PRIMARY KEY,
  risk_run_id BIGINT NOT NULL REFERENCES ops.risk_model_runs(risk_run_id),
  employee_id BIGINT NOT NULL REFERENCES ops.employees(employee_id) ON DELETE CASCADE,
  risk_score NUMERIC(6,4) NOT NULL CHECK (risk_score >= 0 AND risk_score <= 1),
  risk_level ops.risk_level NOT NULL,
  reason_codes_json JSONB NOT NULL DEFAULT '[]'::JSONB,
  explanation_json JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT,
  UNIQUE (risk_run_id, employee_id)
);

COMMIT;
