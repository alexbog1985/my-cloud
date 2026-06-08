#!/bin/bash
# wait-for-db.sh

# Ждем пока PostgreSQL будет готов принимать соединения
until pg_isready -h ${DB_HOST} -p ${DB_PORT}; do
  echo "Waiting for database..."
  sleep 1
done

# Проверяем режим запуска
if [ "${PRODUCTION}" = "true" ]; then
  echo "Starting in PRODUCTION mode with Gunicorn..."
  # Применяем миграции
  python manage.py migrate
  # Запускаем Gunicorn для продакшна
  exec gunicorn mycloud.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers ${GUNICORN_WORKERS:-2} \
    --worker-class ${GUNICORN_WORKER_CLASS:-uvicorn.workers.UvicornWorker} \
    --threads ${GUNICORN_THREADS:-2} \
    --timeout ${GUNICORN_TIMEOUT:-30} \
    --keep-alive ${GUNICORN_KEEP_ALIVE:-5} \
    --access-logfile - \
    --error-logfile -
else
  echo "Starting in DEVELOPMENT mode..."
  # Применяем миграции
  echo "Applying migrations..."
  python manage.py migrate
  # Запускаем Django development server
  exec python -u manage.py runserver 0.0.0.0:8000
fi
