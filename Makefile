# Makefile for Workforce Resilience Planner
# Usage: make <target>

.PHONY: up setup down restart build logs status clean fclean db-shell backend-shell frontend-shell help

# Default target
help:
	@echo "Available targets:"
	@echo "  up          - Start backend and frontend (preserves existing database)"
	@echo "  setup       - One-time DB init: scrape jobs, ingest O*NET data, load vacancies"
	@echo "  down        - Stop all services"
	@echo "  restart     - Restart backend and frontend"
	@echo "  build       - Rebuild images without starting"
	@echo "  logs        - Tail logs from all services"
	@echo "  status      - Show container status"
	@echo "  clean       - Stop containers and remove volumes (preserves database file)"
	@echo "  fclean      - Full cleanup: remove ALL containers, volumes, images, networks, build cache (DANGER)"
	@echo "  db-shell    - Open SQLite shell inside db-setup container"
	@echo "  backend-shell - Open bash inside backend container"
	@echo "  frontend-shell - Open sh inside frontend container"

up:
	docker compose up -d backend frontend

setup:
	docker compose --profile setup up --build etl-pipeline db-setup job-load

down:
	docker compose --profile setup down

restart:
	docker compose down
	docker compose up -d --build backend frontend

build:
	docker compose build

logs:
	docker compose logs -f

status:
	docker compose ps

# Clean: stops containers, removes volumes (including named volumes), orphans
clean:
	docker compose down -v --remove-orphans
	docker system prune -f

# Full nuclear clean: destroys everything Docker on the system (containers, volumes, images, networks, build cache)
fclean:
	@echo "WARNING: This will remove ALL Docker containers, volumes, images, networks, and build cache."
	@echo "Are you sure? Type 'yes' to continue."
	@read answer; if [ "$$answer" != "yes" ]; then echo "Aborted."; exit 1; fi
	@docker stop $$(docker ps -aq) 2>/dev/null || true
	@docker rm $$(docker ps -aq) 2>/dev/null || true
	@docker system prune -a --volumes -f

# Shell access
db-shell:
	docker compose exec db-setup sqlite3 /app/data/workforce.db

backend-shell:
	docker compose exec backend bash

frontend-shell:
	docker compose exec frontend sh