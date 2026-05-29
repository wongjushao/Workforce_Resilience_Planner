PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS Employee (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  risk_score REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS Skill (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS EmployeeSkill (
  employee_id INTEGER NOT NULL,
  skill_id INTEGER NOT NULL,
  proficiency INTEGER NOT NULL,
  PRIMARY KEY (employee_id, skill_id),
  FOREIGN KEY (employee_id) REFERENCES Employee(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES Skill(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Vacancy (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  path TEXT NOT NULL,
  match_score REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS Recommendation (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  vacancy_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'proposed',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (employee_id) REFERENCES Employee(id) ON DELETE CASCADE,
  FOREIGN KEY (vacancy_id) REFERENCES Vacancy(id) ON DELETE CASCADE
);
