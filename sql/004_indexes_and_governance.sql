-- Indexes, auditing helpers, row-level security, and dashboard views.
-- Target DB: PostgreSQL 14+

BEGIN;

CREATE SCHEMA IF NOT EXISTS mart;

-- -----------------------------
-- Audit timestamp trigger helper
-- -----------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- -----------------------------
-- Indexes (reference)
-- -----------------------------
CREATE INDEX IF NOT EXISTS idx_ref_occupation_titles_job_title
  ON ref.occupation_titles (job_title);

CREATE INDEX IF NOT EXISTS idx_ref_occupation_element_scores_lookup
  ON ref.occupation_element_scores (onet_soc_code, element_id, source_domain);

CREATE INDEX IF NOT EXISTS idx_ref_related_occupations_from_code
  ON ref.related_occupations (onet_soc_code, relatedness_tier);

-- -----------------------------
-- Indexes (operational)
-- -----------------------------
CREATE INDEX IF NOT EXISTS idx_ops_employees_department
  ON ops.employees (department_id, employment_status);

CREATE INDEX IF NOT EXISTS idx_ops_employee_skill_profile
  ON ops.employee_skill_profile (employee_id, element_id);

CREATE INDEX IF NOT EXISTS idx_ops_vacancies_source_status_code
  ON ops.vacancies (source, status, onet_soc_code);

CREATE INDEX IF NOT EXISTS idx_ops_layoff_risk_scores_employee
  ON ops.layoff_risk_scores (employee_id, created_at DESC);

-- -----------------------------
-- Indexes (decision loop)
-- -----------------------------
CREATE INDEX IF NOT EXISTS idx_decision_match_runs_employee
  ON decision.match_runs (employee_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_decision_recommendations_match_status
  ON decision.recommendations (match_run_id, status);

CREATE INDEX IF NOT EXISTS idx_decision_upskill_plans_employee_status
  ON decision.upskill_plans (employee_id, status);

CREATE INDEX IF NOT EXISTS idx_decision_skill_gap_graph_employee
  ON decision.skill_gap_graph_edges (employee_id, to_element_id);

-- -----------------------------
-- Updated_at triggers
-- -----------------------------
DROP TRIGGER IF EXISTS trg_set_updated_at_departments ON ops.departments;
CREATE TRIGGER trg_set_updated_at_departments
BEFORE UPDATE ON ops.departments
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_employees ON ops.employees;
CREATE TRIGGER trg_set_updated_at_employees
BEFORE UPDATE ON ops.employees
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_employee_skill_profile ON ops.employee_skill_profile;
CREATE TRIGGER trg_set_updated_at_employee_skill_profile
BEFORE UPDATE ON ops.employee_skill_profile
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_vacancies ON ops.vacancies;
CREATE TRIGGER trg_set_updated_at_vacancies
BEFORE UPDATE ON ops.vacancies
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_matching_thresholds ON decision.matching_thresholds;
CREATE TRIGGER trg_set_updated_at_matching_thresholds
BEFORE UPDATE ON decision.matching_thresholds
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_redeployments ON decision.redeployments;
CREATE TRIGGER trg_set_updated_at_redeployments
BEFORE UPDATE ON decision.redeployments
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_upskill_plans ON decision.upskill_plans;
CREATE TRIGGER trg_set_updated_at_upskill_plans
BEFORE UPDATE ON decision.upskill_plans
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------
-- Row-level security
-- -----------------------------
ALTER TABLE ops.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops.employee_skill_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops.layoff_risk_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision.manager_review ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision.upskill_plans ENABLE ROW LEVEL SECURITY;

-- These policies expect app roles such as: hr_admin, hr_analyst.
DROP POLICY IF EXISTS p_hr_admin_all_employees ON ops.employees;
CREATE POLICY p_hr_admin_all_employees
ON ops.employees
FOR ALL
TO hr_admin
USING (TRUE)
WITH CHECK (TRUE);

DROP POLICY IF EXISTS p_hr_analyst_read_employees ON ops.employees;
CREATE POLICY p_hr_analyst_read_employees
ON ops.employees
FOR SELECT
TO hr_analyst
USING (TRUE);

DROP POLICY IF EXISTS p_hr_admin_all_recommendations ON decision.recommendations;
CREATE POLICY p_hr_admin_all_recommendations
ON decision.recommendations
FOR ALL
TO hr_admin
USING (TRUE)
WITH CHECK (TRUE);

DROP POLICY IF EXISTS p_hr_analyst_read_recommendations ON decision.recommendations;
CREATE POLICY p_hr_analyst_read_recommendations
ON decision.recommendations
FOR SELECT
TO hr_analyst
USING (TRUE);

-- -----------------------------
-- Dashboard materialized views
-- -----------------------------
CREATE MATERIALIZED VIEW IF NOT EXISTS mart.vw_employee_risk_and_options
AS
SELECT
  e.employee_id,
  e.employee_no,
  e.full_name,
  e.current_title,
  d.department_name,
  rs.risk_score,
  rs.risk_level,
  mr.match_run_id,
  mr.chosen_path,
  r.recommendation_id,
  r.fit_score,
  r.status AS recommendation_status,
  up.plan_id AS upskill_plan_id,
  up.gap_score
FROM ops.employees e
LEFT JOIN ops.departments d ON d.department_id = e.department_id
LEFT JOIN LATERAL (
  SELECT lrs.*
  FROM ops.layoff_risk_scores lrs
  WHERE lrs.employee_id = e.employee_id
  ORDER BY lrs.created_at DESC
  LIMIT 1
) rs ON TRUE
LEFT JOIN LATERAL (
  SELECT m.*
  FROM decision.match_runs m
  WHERE m.employee_id = e.employee_id
  ORDER BY m.created_at DESC
  LIMIT 1
) mr ON TRUE
LEFT JOIN decision.recommendations r ON r.match_run_id = mr.match_run_id
LEFT JOIN LATERAL (
  SELECT p.*
  FROM decision.upskill_plans p
  WHERE p.employee_id = e.employee_id
  ORDER BY p.created_at DESC
  LIMIT 1
) up ON TRUE;

CREATE MATERIALIZED VIEW IF NOT EXISTS mart.vw_skill_gaps_by_department
AS
SELECT
  d.department_name,
  s.to_element_id AS target_element_id,
  el.element_name AS target_element_name,
  COUNT(*) AS gap_count,
  AVG(s.gap_weight) AS avg_gap_weight
FROM decision.skill_gap_graph_edges s
JOIN ops.employees e ON e.employee_id = s.employee_id
LEFT JOIN ops.departments d ON d.department_id = e.department_id
LEFT JOIN ref.elements el ON el.element_id = s.to_element_id
GROUP BY d.department_name, s.to_element_id, el.element_name;

COMMIT;
