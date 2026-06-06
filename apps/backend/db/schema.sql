PRAGMA foreign_keys = OFF;

DROP TABLE IF EXISTS at_risk_submissions;
DROP TABLE IF EXISTS intake_documents;
DROP TABLE IF EXISTS vacancy_skills;
DROP TABLE IF EXISTS employee_skills;
DROP TABLE IF EXISTS technologies;
DROP TABLE IF EXISTS alternate_titles;
DROP TABLE IF EXISTS related_occupations;
DROP TABLE IF EXISTS occupation_skills;
DROP TABLE IF EXISTS vacancies;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS skills;
DROP TABLE IF EXISTS occupations;

DROP TABLE IF EXISTS Recommendation;
DROP TABLE IF EXISTS EmployeeSkill;
DROP TABLE IF EXISTS Vacancy;
DROP TABLE IF EXISTS Skill;
DROP TABLE IF EXISTS Employee;

PRAGMA foreign_keys = ON;

CREATE TABLE occupations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  onet_code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT
);

CREATE TABLE skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  category TEXT
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

CREATE TABLE at_risk_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  current_role TEXT,
  department TEXT,
  email TEXT,
  skills TEXT,
  departure_reason TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  current_role TEXT,
  department TEXT
);

CREATE TABLE employee_skills (
  employee_id INTEGER NOT NULL,
  skill_id INTEGER NOT NULL,
  proficiency REAL,
  PRIMARY KEY (employee_id, skill_id),
  FOREIGN KEY (employee_id) REFERENCES employees (id),
  FOREIGN KEY (skill_id) REFERENCES skills (id)
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

CREATE INDEX idx_occupation_skills_occupation_id ON occupation_skills (occupation_id);
CREATE INDEX idx_occupation_skills_skill_id ON occupation_skills (skill_id);
CREATE INDEX idx_related_occupations_occupation_id ON related_occupations (occupation_id);
CREATE INDEX idx_alternate_titles_occupation_id ON alternate_titles (occupation_id);
CREATE INDEX idx_technologies_occupation_id ON technologies (occupation_id);
CREATE INDEX idx_employee_skills_employee_id ON employee_skills (employee_id);
CREATE INDEX idx_vacancy_skills_vacancy_id ON vacancy_skills (vacancy_id);
