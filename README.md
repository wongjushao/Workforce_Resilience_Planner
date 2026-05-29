# Workforce Resilience Planner

Clean monorepo structure using:

- `Angular` for frontend
- `Flask` for API
- `SQLite` as the database

## Project structure

```text
apps/
  backend/      # Flask API, SQLite schema, and seed scripts
  frontend/     # Angular app
data/           # SQLite database file
docs/           # Existing project docs
sql/            # Existing SQL drafts
```

## Prerequisites

- Docker + Docker Compose

## Run everything

```bash
docker compose up --build
```

Services:

- Frontend: [http://localhost:4200](http://localhost:4200)
- Backend API: [http://localhost:5000](http://localhost:5000)
- Health check: [http://localhost:5000/health](http://localhost:5000/health)

## What starts automatically

1. `db-setup` creates the SQLite schema and seeds sample data.
2. `backend` starts Flask app on port `5000`.
3. `frontend` starts Angular dev server on port `4200`.

## Useful commands

```bash
# stop all services
docker compose down

# rebuild from scratch
docker compose down -v
docker compose up --build

# initialize database locally (from apps/backend)
DATABASE_URL=file:../../data/workforce.db python -m db.init
```
