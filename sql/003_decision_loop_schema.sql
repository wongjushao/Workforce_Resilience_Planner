-- Decision loop and recommendation workflow schema.
-- Target DB: PostgreSQL 14+

BEGIN;

CREATE SCHEMA IF NOT EXISTS decision;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'match_path') THEN
    CREATE TYPE decision.match_path AS ENUM ('same_role', 'cross_role', 'partner_role', 'upskill');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'recommendation_status') THEN
    CREATE TYPE decision.recommendation_status AS ENUM ('proposed', 'sent', 'accepted', 'rejected', 'expired');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'review_decision') THEN
    CREATE TYPE decision.review_decision AS ENUM ('accept', 'reject');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'upskill_status') THEN
    CREATE TYPE decision.upskill_status AS ENUM ('draft', 'active', 'completed', 'cancelled');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS decision.matching_thresholds (
  threshold_id BIGSERIAL PRIMARY KEY,
  threshold_set_name TEXT NOT NULL,
  same_role_min NUMERIC(5,2) NOT NULL CHECK (same_role_min >= 0 AND same_role_min <= 100),
  cross_role_min NUMERIC(5,2) NOT NULL CHECK (cross_role_min >= 0 AND cross_role_min <= 100),
  partner_min NUMERIC(5,2) NOT NULL CHECK (partner_min >= 0 AND partner_min <= 100),
  effective_from TIMESTAMPTZ NOT NULL,
  effective_to TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT
);

CREATE TABLE IF NOT EXISTS decision.match_runs (
  match_run_id BIGSERIAL PRIMARY KEY,
  employee_id BIGINT NOT NULL REFERENCES ops.employees(employee_id) ON DELETE CASCADE,
  risk_score_id BIGINT REFERENCES ops.layoff_risk_scores(risk_score_id),
  threshold_id BIGINT REFERENCES decision.matching_thresholds(threshold_id),
  algorithm_version TEXT NOT NULL,
  same_role_score NUMERIC(5,2),
  cross_role_score NUMERIC(5,2),
  partner_score NUMERIC(5,2),
  chosen_path decision.match_path NOT NULL,
  explainability_json JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT
);

CREATE TABLE IF NOT EXISTS decision.match_candidates (
  match_candidate_id BIGSERIAL PRIMARY KEY,
  match_run_id BIGINT NOT NULL REFERENCES decision.match_runs(match_run_id) ON DELETE CASCADE,
  candidate_rank INTEGER NOT NULL CHECK (candidate_rank > 0),
  candidate_type decision.match_path NOT NULL,
  vacancy_id BIGINT REFERENCES ops.vacancies(vacancy_id),
  target_onet_soc_code TEXT REFERENCES ref.occupations(onet_soc_code),
  fit_score NUMERIC(5,2) NOT NULL CHECK (fit_score >= 0 AND fit_score <= 100),
  reasons_json JSONB NOT NULL DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (match_run_id, candidate_rank)
);

CREATE TABLE IF NOT EXISTS decision.portfolio_documents (
  portfolio_id BIGSERIAL PRIMARY KEY,
  match_run_id BIGINT NOT NULL REFERENCES decision.match_runs(match_run_id) ON DELETE CASCADE,
  employee_id BIGINT NOT NULL REFERENCES ops.employees(employee_id) ON DELETE CASCADE,
  generated_by_system BOOLEAN NOT NULL DEFAULT TRUE,
  portfolio_json JSONB NOT NULL,
  employee_approved BOOLEAN NOT NULL DEFAULT FALSE,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT
);

CREATE TABLE IF NOT EXISTS decision.recommendations (
  recommendation_id BIGSERIAL PRIMARY KEY,
  match_run_id BIGINT NOT NULL REFERENCES decision.match_runs(match_run_id) ON DELETE CASCADE,
  vacancy_id BIGINT REFERENCES ops.vacancies(vacancy_id),
  portfolio_id BIGINT REFERENCES decision.portfolio_documents(portfolio_id),
  recommendation_type decision.match_path NOT NULL,
  fit_score NUMERIC(5,2) NOT NULL CHECK (fit_score >= 0 AND fit_score <= 100),
  explainability_json JSONB NOT NULL DEFAULT '{}'::JSONB,
  status decision.recommendation_status NOT NULL DEFAULT 'proposed',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT
);

CREATE TABLE IF NOT EXISTS decision.manager_review (
  review_id BIGSERIAL PRIMARY KEY,
  recommendation_id BIGINT NOT NULL UNIQUE REFERENCES decision.recommendations(recommendation_id) ON DELETE CASCADE,
  manager_id BIGINT NOT NULL REFERENCES ops.employees(employee_id),
  decision decision.review_decision NOT NULL,
  notes TEXT,
  missing_skills_json JSONB NOT NULL DEFAULT '[]'::JSONB,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT
);

CREATE TABLE IF NOT EXISTS decision.redeployments (
  redeployment_id BIGSERIAL PRIMARY KEY,
  employee_id BIGINT NOT NULL REFERENCES ops.employees(employee_id),
  recommendation_id BIGINT NOT NULL UNIQUE REFERENCES decision.recommendations(recommendation_id),
  new_vacancy_id BIGINT REFERENCES ops.vacancies(vacancy_id),
  transfer_effective_date DATE NOT NULL,
  redeployment_type decision.match_path NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT
);

CREATE TABLE IF NOT EXISTS decision.upskill_plans (
  plan_id BIGSERIAL PRIMARY KEY,
  employee_id BIGINT NOT NULL REFERENCES ops.employees(employee_id),
  source_match_run_id BIGINT REFERENCES decision.match_runs(match_run_id),
  target_onet_soc_code TEXT REFERENCES ref.occupations(onet_soc_code),
  gap_score NUMERIC(5,2) NOT NULL CHECK (gap_score >= 0 AND gap_score <= 100),
  plan_json JSONB NOT NULL DEFAULT '{}'::JSONB,
  status decision.upskill_status NOT NULL DEFAULT 'draft',
  start_date DATE,
  target_completion_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT
);

CREATE TABLE IF NOT EXISTS decision.skill_gap_graph_edges (
  edge_id BIGSERIAL PRIMARY KEY,
  plan_id BIGINT REFERENCES decision.upskill_plans(plan_id) ON DELETE CASCADE,
  match_run_id BIGINT REFERENCES decision.match_runs(match_run_id) ON DELETE CASCADE,
  employee_id BIGINT NOT NULL REFERENCES ops.employees(employee_id) ON DELETE CASCADE,
  from_element_id TEXT REFERENCES ref.elements(element_id),
  to_element_id TEXT NOT NULL REFERENCES ref.elements(element_id),
  gap_weight NUMERIC(8,4) NOT NULL CHECK (gap_weight >= 0),
  source TEXT NOT NULL DEFAULT 'manager_feedback',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT
);

COMMIT;
