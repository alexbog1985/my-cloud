# Makefile для My Cloud Backend

# Переменные
PYTHON = python3
DJANGO_MANAGE = $(PYTHON) manage.py
PIP = pip3
NPM = npm

# Проверка окружения
.PHONY: check
check:
	@echo "=== Проверка окружения ==="
	@$(PYTHON) --version
	@$(PIP) --version
	@if [ -f .env ]; then echo ".env файл найден"; else echo "ПРЕДУПРЕЖДЕНИЕ: .env файл не найден. Скопируйте .env.example и настройте переменные."; fi
	@echo "=== Переменные окружения ==="
	@if [ -f .env ]; then grep -E "^(SECRET_KEY|DEBUG|ALLOWED_HOSTS|DB_|MEDIA_ROOT|MAX_FILE_SIZE)" .env | head -10; fi

# Установка зависимостей
.PHONY: install
install:
	@echo "=== Установка зависимостей Python ==="
	$(PIP) install -r requirements.txt
	@echo "=== Установка завершена ==="

# Применение миграций
.PHONY: migrate
migrate:
	@echo "=== Применение миграций ==="
	$(DJANGO_MANAGE) migrate
	@echo "=== Миграции применены ==="

# Создание суперпользователя
.PHONY: createsuper
createsuper:
	@echo "=== Создание суперпользователя ==="
	$(DJANGO_MANAGE) createsuperuser
	@echo "=== Суперпользователь создан ==="

# Запуск сервера разработки
.PHONY: run
run:
	@echo "=== Запуск сервера разработки ==="
	$(DJANGO_MANAGE) runserver

# Запуск сервера с Gunicorn (для продакшена)
.PHONY: run-gunicorn
run-gunicorn:
	@echo "=== Запуск сервера с Gunicorn ==="
	gunicorn mycloud.wsgi:application --bind 0.0.0.0:8000 --workers 3

# Сборка статических файлов
.PHONY: collectstatic
collectstatic:
	@echo "=== Сборка статических файлов ==="
	$(DJANGO_MANAGE) collectstatic --no-input
	@echo "=== Статические файлы собраны ==="

# Сборка фронтенда
.PHONY: build-frontend
build-frontend:
	@echo "=== Сборка фронтенда ==="
	cd ../frontend && $(NPM) ci && $(NPM) run build -- --mode production
	@echo "=== Фронтенд собран ==="
	@echo "Файлы размещены в backend/mycloud/static/frontend/"

# Запуск тестов
.PHONY: test
test:
	@echo "=== Очистка media перед тестами ==="
	@rm -rf media/* 2>/dev/null || true
	@echo "=== Запуск тестов ==="
	$(DJANGO_MANAGE) test
	@echo "=== Тесты завершены ==="

# Запуск тестов с покрытием
.PHONY: test-cov
test-cov:
	@echo "=== Очистка media перед тестами ==="
	@rm -rf media/* 2>/dev/null || true
	@echo "=== Запуск тестов с покрытием ==="
	$(DJANGO_MANAGE) test --verbosity=2
	@echo "=== Тесты с покрытием завершены ==="

# Запуск flake8 (линтер)
.PHONY: lint
lint:
	@echo "=== Проверка кода с flake8 ==="
	flake8 . --exclude=migrations
	@echo "=== Проверка завершена ==="

# Форматирование кода
.PHONY: format
format:
	@echo "=== Форматирование кода ==="
	black .
	@echo "=== Код отформатирован ==="

# Запуск Docker для разработки
.PHONY: docker-up
docker-up:
	@echo "=== Запуск Docker для разработки ==="
	docker-compose -f docker-compose.dev.yml up --build
	@echo "=== Docker запущен ==="

# Остановка Docker
.PHONY: docker-down
docker-down:
	@echo "=== Остановка Docker ==="
	docker-compose -f docker-compose.dev.yml down
	@echo "=== Docker остановлен ==="

# Перезапуск Docker
.PHONY: docker-restart
docker-restart:
	@echo "=== Перезапуск Docker ==="
	docker-compose -f docker-compose.dev.yml restart
	@echo "=== Docker перезапущен ==="

# Логи Docker
.PHONY: docker-logs
docker-logs:
	@echo "=== Логи Docker ==="
	docker-compose -f docker-compose.dev.yml logs -f

# Создание миграций
.PHONY: makemigrations
makemigrations:
	@echo "=== Создание миграций ==="
	$(DJANGO_MANAGE) makemigrations
	@echo "=== Миграции созданы ==="

# Создание миграций для конкретного приложения
.PHONY: makemigrations-users
makemigrations-users:
	$(DJANGO_MANAGE) makemigrations users

.PHONY: makemigrations-files
makemigrations-files:
	$(DJANGO_MANAGE) makemigrations files

# Деплой на продакшн
.PHONY: deploy
deploy:
	@echo "=== Деплой на продакшн ==="
	make build-frontend
	make collectstatic
	$(DJANGO_MANAGE) migrate
	@echo "=== Деплой завершен ==="
	@echo "Теперь перезапустите Gunicorn или Docker контейнеры"

# Сброс базы данных
.PHONY: reset-db
reset-db:
	@echo "=== Сброс базы данных ==="
	rm -f db.sqlite3
	$(DJANGO_MANAGE) migrate
	@echo "=== База данных сброшена ==="

# Сброс базы данных с созданием суперпользователя
.PHONY: reset-db-full
reset-db-full: reset-db createsuper

# Проверка конфигурации Django
.PHONY: check-config
check-config:
	@echo "=== Проверка конфигурации Django ==="
	$(DJANGO_MANAGE) check
	@echo "=== Конфигурация OK ==="

# Помощь
.PHONY: help
help:
	@echo "Доступные команды:"
	@echo "  make check              - Проверка окружения"
	@echo "  make install            - Установка зависимостей"
	@echo "  make migrate            - Применение миграций"
	@echo "  make createsuper        - Создание суперпользователя"
	@echo "  make run                - Запуск сервера разработки"
	@echo "  make run-gunicorn       - Запуск с Gunicorn (продакшн)"
	@echo "  make collectstatic      - Сборка статических файлов"
	@echo "  make test               - Запуск тестов"
	@echo "  make test-cov           - Тесты с покрытием"
	@echo "  make lint               - Запуск flake8 (линтер)"
	@echo "  make format             - Форматирование кода black"
	@echo "  make build-frontend     - Сборка фронтенда (Vite)"
	@echo "  make docker-up          - Запуск Docker"
	@echo "  make docker-down        - Остановка Docker"
	@echo "  make docker-restart     - Перезапуск Docker"
	@echo "  make docker-logs        - Логи Docker"
	@echo "  make makemigrations     - Создание миграций"
	@echo "  make deploy             - Деплой на продакшн (сборка + миграции)"
	@echo "  make reset-db           - Сброс базы данных"
	@echo "  make reset-db-full      - Сброс с созданием суперпользователя"
	@echo "  make check-config       - Проверка конфигурации Django"
	@echo "  make help               - Показать эту справку"
