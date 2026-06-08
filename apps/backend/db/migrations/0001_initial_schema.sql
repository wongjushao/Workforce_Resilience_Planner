-- Migration: 0001_initial_schema
-- Baseline schema for Workforce Resilience Planner.

PRAGMA foreign_keys = OFF;

DROP TABLE IF EXISTS Recommendation;
DROP TABLE IF EXISTS EmployeeSkill;
DROP TABLE IF EXISTS Vacancy;
DROP TABLE IF EXISTS Skill;
DROP TABLE IF EXISTS Employee;

PRAGMA foreign_keys = ON;

CREATE TABLE skill_topic (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL
);

CREATE TABLE skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  other_name TEXT,
  category TEXT,
  skill_topic_id INTEGER NOT NULL,
  FOREIGN KEY (skill_topic_id) REFERENCES skill_topic (id)
);

CREATE TABLE occupations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  onet_code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT
);

CREATE TABLE occupation_skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  occupation_id INTEGER NOT NULL,
  skill_id INTEGER NOT NULL,
  source TEXT,
  scale_type TEXT,
  score REAL,
  FOREIGN KEY (occupation_id) REFERENCES occupations (id),
  FOREIGN KEY (skill_id) REFERENCES skills (id)
);

CREATE TABLE related_occupations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  occupation_id INTEGER NOT NULL,
  related_occupation_id INTEGER NOT NULL,
  tier TEXT,
  FOREIGN KEY (occupation_id) REFERENCES occupations (id),
  FOREIGN KEY (related_occupation_id) REFERENCES occupations (id)
);

CREATE TABLE alternate_titles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  occupation_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  FOREIGN KEY (occupation_id) REFERENCES occupations (id)
);

CREATE TABLE technologies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  occupation_id INTEGER NOT NULL,
  technology_name TEXT,
  category TEXT,
  hot_technology INTEGER,
  in_demand INTEGER,
  FOREIGN KEY (occupation_id) REFERENCES occupations (id)
);

CREATE TABLE intake_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  original_filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  stored_path TEXT NOT NULL,
  file_size INTEGER,
  extracted_text TEXT,
  row_count INTEGER,
  status TEXT NOT NULL DEFAULT 'received',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  age INTEGER,
  gender TEXT,
  email TEXT,
  phone TEXT,
  department TEXT,
  current_role_id INTEGER NOT NULL,
  experience INTEGER,
  FOREIGN KEY (current_role_id) REFERENCES occupations (id)
);

CREATE TABLE employee_skills (
  employee_id INTEGER NOT NULL,
  skill_id INTEGER NOT NULL,
  proficiency REAL,
  PRIMARY KEY (employee_id, skill_id),
  FOREIGN KEY (employee_id) REFERENCES employees (id),
  FOREIGN KEY (skill_id) REFERENCES skills (id)
);

CREATE TABLE at_risk_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  departure_reason TEXT NOT NULL,
  department TEXT,
  performance INTEGER,
  document_id INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (employee_id) REFERENCES employees (id),
  FOREIGN KEY (document_id) REFERENCES intake_documents (id)
);

CREATE TABLE vacancies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  department TEXT,
  company TEXT
);

CREATE TABLE vacancy_skills (
  vacancy_id INTEGER NOT NULL,
  skill_id INTEGER NOT NULL,
  weight REAL,
  PRIMARY KEY (vacancy_id, skill_id),
  FOREIGN KEY (vacancy_id) REFERENCES vacancies (id),
  FOREIGN KEY (skill_id) REFERENCES skills (id)
);

CREATE INDEX idx_skills_skill_topic_id ON skills (skill_topic_id);
CREATE INDEX idx_occupation_skills_occupation_id ON occupation_skills (occupation_id);
CREATE INDEX idx_occupation_skills_skill_id ON occupation_skills (skill_id);
CREATE INDEX idx_related_occupations_occupation_id ON related_occupations (occupation_id);
CREATE INDEX idx_alternate_titles_occupation_id ON alternate_titles (occupation_id);
CREATE INDEX idx_technologies_occupation_id ON technologies (occupation_id);
CREATE INDEX idx_employees_current_role_id ON employees (current_role_id);
CREATE INDEX idx_at_risk_submissions_employee_id ON at_risk_submissions (employee_id);
CREATE INDEX idx_employee_skills_employee_id ON employee_skills (employee_id);
CREATE INDEX idx_vacancy_skills_vacancy_id ON vacancy_skills (vacancy_id);
