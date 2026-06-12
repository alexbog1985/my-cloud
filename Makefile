.PHONY: migrate run build-frontend deploy test lint format install install-frontend env-check setup

migrate:
	@echo "Применение миграций..."
	cd ./backend && python manage.py migrate

run:
	@echo "Запуск Django сервера..."
	cd ./backend && python manage.py runserver

build-frontend:
	@echo "Сборка фронтенда..."
	cd ./frontend && npm run build

install-frontend:
	@echo "Установка зависимостей фронтенда..."
	cd ./frontend && npm install

install:
	@echo "Установка зависимостей Python..."
	cd ./backend && pip install -r requirements.txt
	@echo "Установка зависимостей фронтенда..."
	cd ./frontend && npm install
	@echo "Установка pre-commit хуков..."
	pre-commit install

env-check:
	@echo "Проверка .env файла..."
	@test -f backend/.env || (echo "❌ Файл backend/.env не найден!" && echo "Создайте файл из .env.example: cp backend/.env.example backend/.env" && exit 1)
	@echo "✅ .env файл найден"

setup: install install-frontend env-check
	@echo "Настройка проекта завершена"

deploy: build-frontend migrate
	@echo "Деплой завершен!"

test:
	@echo "Запуск тестов..."
	cd ./backend && python manage.py test
	cd ./frontend && npm test

lint:
	@echo "Запуск линтинга..."
	cd ./frontend && npm run lint

format:
	@echo "Форматирование кода..."
	black ./backend/files ./backend/users ./backend/mycloud
	isort ./backend/files ./backend/users ./backend/mycloud