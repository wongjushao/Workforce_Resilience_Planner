-- Reference schema for O*NET XLSX ingestion and canonicalized occupation data.
-- Target DB: PostgreSQL 14+

BEGIN;

CREATE SCHEMA IF NOT EXISTS stg;
CREATE SCHEMA IF NOT EXISTS ref;

-- -----------------------------
-- Staging tables (raw XLSX shape)
-- -----------------------------

CREATE TABLE IF NOT EXISTS stg.occupation_data (
  onet_soc_code TEXT,
  title TEXT,
  description TEXT,
  source_file TEXT NOT NULL,
  source_release TEXT NOT NULL,
  loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stg.job_titles (
  onet_soc_code TEXT,
  title TEXT,
  job_title TEXT,
  short_title TEXT,
  sources TEXT,
  source_file TEXT NOT NULL,
  source_release TEXT NOT NULL,
  loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stg.essential_skills (
  onet_soc_code TEXT,
  title TEXT,
  element_id TEXT,
  element_name TEXT,
  scale_id TEXT,
  scale_name TEXT,
  data_value NUMERIC(8,4),
  n INTEGER,
  standard_error NUMERIC(10,6),
  lower_ci_bound NUMERIC(8,4),
  upper_ci_bound NUMERIC(8,4),
  recommend_suppress TEXT,
  source_file TEXT NOT NULL,
  source_release TEXT NOT NULL,
  loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stg.transferable_skills (
  onet_soc_code TEXT,
  title TEXT,
  element_id TEXT,
  element_name TEXT,
  scale_id TEXT,
  scale_name TEXT,
  data_value NUMERIC(8,4),
  n INTEGER,
  standard_error NUMERIC(10,6),
  lower_ci_bound NUMERIC(8,4),
  upper_ci_bound NUMERIC(8,4),
  recommend_suppress TEXT,
  source_file TEXT NOT NULL,
  source_release TEXT NOT NULL,
  loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stg.knowledge (
  onet_soc_code TEXT,
  title TEXT,
  element_id TEXT,
  element_name TEXT,
  scale_id TEXT,
  scale_name TEXT,
  data_value NUMERIC(8,4),
  n INTEGER,
  standard_error NUMERIC(10,6),
  lower_ci_bound NUMERIC(8,4),
  upper_ci_bound NUMERIC(8,4),
  recommend_suppress TEXT,
  source_file TEXT NOT NULL,
  source_release TEXT NOT NULL,
  loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stg.work_activities (
  onet_soc_code TEXT,
  title TEXT,
  element_id TEXT,
  element_name TEXT,
  scale_id TEXT,
  scale_name TEXT,
  data_value NUMERIC(8,4),
  n INTEGER,
  standard_error NUMERIC(10,6),
  lower_ci_bound NUMERIC(8,4),
  upper_ci_bound NUMERIC(8,4),
  recommend_suppress TEXT,
  source_file TEXT NOT NULL,
  source_release TEXT NOT NULL,
  loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stg.software_skills (
  onet_soc_code TEXT,
  title TEXT,
  workplace_example TEXT,
  element_id TEXT,
  element_name TEXT,
  hot_technology TEXT,
  in_demand TEXT,
  source_file TEXT NOT NULL,
  source_release TEXT NOT NULL,
  loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stg.related_occupations (
  onet_soc_code TEXT,
  title TEXT,
  related_onet_soc_code TEXT,
  related_title TEXT,
  relatedness_tier TEXT,
  index_value NUMERIC(8,4),
  source_file TEXT NOT NULL,
  source_release TEXT NOT NULL,
  loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------
-- Canonical reference tables
-- -----------------------------

CREATE TABLE IF NOT EXISTS ref.occupations (
  onet_soc_code TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  source_file TEXT NOT NULL,
  source_release TEXT NOT NULL,
  loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ref.occupation_titles (
  occupation_title_id BIGSERIAL PRIMARY KEY,
  onet_soc_code TEXT NOT NULL REFERENCES ref.occupations(onet_soc_code),
  job_title TEXT NOT NULL,
  short_title TEXT,
  source TEXT,
  source_file TEXT NOT NULL,
  source_release TEXT NOT NULL,
  loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ref.elements (
  element_id TEXT PRIMARY KEY,
  element_name TEXT NOT NULL,
  element_type TEXT NOT NULL CHECK (
    element_type IN ('skill', 'knowledge', 'software', 'activity', 'context')
  ),
  source_file TEXT NOT NULL,
  source_release TEXT NOT NULL,
  loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ref.occupation_element_scores (
  onet_soc_code TEXT NOT NULL REFERENCES ref.occupations(onet_soc_code),
  element_id TEXT NOT NULL REFERENCES ref.elements(element_id),
  scale_id TEXT NOT NULL,
  scale_name TEXT,
  data_value NUMERIC(8,4) NOT NULL,
  n INTEGER,
  std_error NUMERIC(10,6),
  ci_low NUMERIC(8,4),
  ci_high NUMERIC(8,4),
  source_domain TEXT NOT NULL CHECK (
    source_domain IN ('essential_skills', 'transferable_skills', 'knowledge', 'work_activities')
  ),
  source_file TEXT NOT NULL,
  source_release TEXT NOT NULL,
  loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (onet_soc_code, element_id, scale_id, source_domain)
);

CREATE TABLE IF NOT EXISTS ref.occupation_software_examples (
  onet_soc_code TEXT NOT NULL REFERENCES ref.occupations(onet_soc_code),
  element_id TEXT NOT NULL REFERENCES ref.elements(element_id),
  workplace_example TEXT NOT NULL,
  hot_technology BOOLEAN,
  in_demand BOOLEAN,
  source_file TEXT NOT NULL,
  source_release TEXT NOT NULL,
  loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (onet_soc_code, element_id, workplace_example)
);

CREATE TABLE IF NOT EXISTS ref.related_occupations (
  onet_soc_code TEXT NOT NULL REFERENCES ref.occupations(onet_soc_code),
  related_onet_soc_code TEXT NOT NULL REFERENCES ref.occupations(onet_soc_code),
  relatedness_tier TEXT NOT NULL,
  index_value NUMERIC(8,4),
  source_file TEXT NOT NULL,
  source_release TEXT NOT NULL,
  loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (onet_soc_code, related_onet_soc_code)
);

COMMIT;
