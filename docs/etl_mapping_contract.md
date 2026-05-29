# O*NET XLSX ETL Mapping Contract

This contract defines how each XLSX maps into staging (`stg`) and canonical (`ref`) tables.

## Global Ingestion Rules

- Source release for this dataset: `30.3`.
- Every ingested row must include:
  - `source_file` (exact XLSX filename),
  - `source_release` (e.g. `30.3`),
  - `loaded_at` (ingestion timestamp).
- Load order:
  1. `stg.*` raw load with original columns.
  2. Deduplicate and normalize into `ref.*`.
- Key normalization:
  - Trim all text fields.
  - Preserve O*NET codes exactly as strings (do not cast to numeric).
  - Convert booleans from `Y/N`, `Yes/No`, or `TRUE/FALSE` into PostgreSQL boolean.

## File To Staging Mapping

### `Occupation Data.xlsx`
- Sheet: `Occupation Data`
- Target: `stg.occupation_data`
- Column map:
  - `O*NET-SOC Code` -> `onet_soc_code`
  - `Title` -> `title`
  - `Description` -> `description`

### `Job Titles.xlsx`
- Sheet: `Job Titles`
- Target: `stg.job_titles`
- Column map:
  - `O*NET-SOC Code` -> `onet_soc_code`
  - `Title` -> `title`
  - `Job Title` -> `job_title`
  - `Short Title` -> `short_title`
  - `Source(s)` -> `sources`

### `Essential Skills.xlsx`
- Sheet: `Essential Skills`
- Target: `stg.essential_skills`
- Column map:
  - `O*NET-SOC Code` -> `onet_soc_code`
  - `Title` -> `title`
  - `Element ID` -> `element_id`
  - `Element Name` -> `element_name`
  - `Scale ID` -> `scale_id`
  - `Scale Name` -> `scale_name`
  - `Data Value` -> `data_value`
  - `N` -> `n`
  - `Standard Error` -> `standard_error`
  - `Lower CI Bound` -> `lower_ci_bound`
  - `Upper CI Bound` -> `upper_ci_bound`
  - `Recommend Suppress` -> `recommend_suppress`

### `Transferable Skills.xlsx`
- Sheet: `Transferable Skills`
- Target: `stg.transferable_skills`
- Same column mapping as `Essential Skills.xlsx`.

### `Knowledge.xlsx`
- Sheet: `Knowledge`
- Target: `stg.knowledge`
- Same column mapping as `Essential Skills.xlsx`.

### `Work Activities.xlsx`
- Sheet: `Work Activities`
- Target: `stg.work_activities`
- Same column mapping as `Essential Skills.xlsx`.

### `Software Skills.xlsx`
- Sheet: `Software Skills`
- Target: `stg.software_skills`
- Column map:
  - `O*NET-SOC Code` -> `onet_soc_code`
  - `Title` -> `title`
  - `Workplace Example` -> `workplace_example`
  - `Element ID` -> `element_id`
  - `Element Name` -> `element_name`
  - `Hot Technology` -> `hot_technology`
  - `In Demand` -> `in_demand`

### `Related Occupations.xlsx`
- Sheet: `Related Occupations`
- Target: `stg.related_occupations`
- Column map:
  - `O*NET-SOC Code` -> `onet_soc_code`
  - `Title` -> `title`
  - `Related O*NET-SOC Code` -> `related_onet_soc_code`
  - `Related Title` -> `related_title`
  - `Relatedness Tier` -> `relatedness_tier`
  - `Index` -> `index_value`

## Staging To Canonical Rules

## `ref.occupations`
- Source: `stg.occupation_data`
- Key: `onet_soc_code`
- Rule: keep latest `loaded_at` per `onet_soc_code`.

## `ref.occupation_titles`
- Source: `stg.job_titles`
- Rule: distinct by (`onet_soc_code`, `job_title`, `source_release`).

## `ref.elements`
- Sources:
  - `stg.essential_skills` -> `element_type='skill'`
  - `stg.transferable_skills` -> `element_type='skill'`
  - `stg.knowledge` -> `element_type='knowledge'`
  - `stg.work_activities` -> `element_type='activity'`
  - `stg.software_skills` -> `element_type='software'`
- Rule: upsert by `element_id`; prefer most recent non-null `element_name`.

## `ref.occupation_element_scores`
- Sources and `source_domain`:
  - `stg.essential_skills` -> `essential_skills`
  - `stg.transferable_skills` -> `transferable_skills`
  - `stg.knowledge` -> `knowledge`
  - `stg.work_activities` -> `work_activities`
- PK: (`onet_soc_code`, `element_id`, `scale_id`, `source_domain`)
- Rule: numeric parsing failures go to reject log.

## `ref.occupation_software_examples`
- Source: `stg.software_skills`
- Rule:
  - `hot_technology` and `in_demand` converted to boolean.
  - Distinct by (`onet_soc_code`, `element_id`, `workplace_example`).

## `ref.related_occupations`
- Source: `stg.related_occupations`
- PK: (`onet_soc_code`, `related_onet_soc_code`)

## Validation Checks

- No orphan occupation links:
  - all `stg.*.onet_soc_code` should resolve to `ref.occupations`.
- Duplicate key checks for each canonical PK.
- Null checks:
  - `ref.occupations.title` not null,
  - `ref.elements.element_name` not null,
  - `ref.occupation_element_scores.data_value` not null.

## Reject Logging Recommendation

Create a shared reject table for failed rows:

- `stg.ingest_rejects`
  - `reject_id BIGSERIAL`
  - `source_file TEXT`
  - `sheet_name TEXT`
  - `source_release TEXT`
  - `error_code TEXT`
  - `error_detail TEXT`
  - `raw_row_json JSONB`
  - `created_at TIMESTAMPTZ`

This ensures traceability when source formats change in future O*NET releases.
