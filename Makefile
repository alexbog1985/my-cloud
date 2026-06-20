# Makefile для проекта My Cloud (в корне)

.PHONY: help
help:
	@echo "Доступные команды:"
	@echo "  make backend.migrate        - Применение миграций"
	@echo "  make backend.run            - Запуск сервера Django"
	@echo "  make backend.test           - Запуск тестов"
	@echo "  make frontend.build         - Сборка фронтенда"
	@echo "  make deploy                 - Сборка и запуск в продакшене"
	@echo "  make dev                    - Запуск в режиме разработки"

# --- Backend команды ---

.PHONY: backend.migrate
backend.migrate:
	@echo "Применение миграций..."
	cd backend && python manage.py migrate

.PHONY: backend.run
backend.run:
	@echo "Запуск сервера Django..."
	cd backend && python manage.py runserver

.PHONY: backend.test
backend.test:
	@echo "Запуск тестов..."
	cd backend && python manage.py test

.PHONY: backend.install
backend.install:
	@echo "Установка зависимостей backend..."
	cd backend && pip install -r requirements.txt

# --- Frontend команды ---

.PHONY: frontend.install
frontend.install:
	@echo "Установка зависимостей frontend..."
	cd frontend && npm install

.PHONY: frontend.dev
frontend.dev:
	@echo "Запуск frontend в режиме разработки..."
	cd frontend && npm run dev

.PHONY: frontend.build
frontend.build:
	@echo "Сборка frontend..."
	cd frontend && npm run build

# --- Dev режим (backend + frontend) ---

.PHONY: dev
dev:
	@echo "Запуск в режиме разработки..."
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:5173"
	@echo "Для продакшена используйте: make deploy"
	python -m http.server 8080 & cd frontend && npm run dev

# --- Deploy (продакшен) ---

.PHONY: deploy
deploy:
	@echo "Сборка для продакшена..."
	@echo "1. Сборка frontend..."
	cd frontend && npm run build
	@echo "2. Сборка статических файлов..."
	cd backend && python manage.py collectstatic --noinput
	@echo "Готово! Теперь запустите gunicorn: gunicorn mycloud.wsgi:application --bind 0.0.0.0:8000"