# ============================================
# Этап 1: Development (для локальной разработки)
# ============================================
FROM python:3.12-slim AS development

WORKDIR /app

# Установка системных зависимостей
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Создание пользователя для запуска (безопасность)
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Копирование зависимостей
COPY backend/requirements.txt .

# Установка Python зависимостей
RUN pip install --no-cache-dir -r requirements.txt

# Копирование кода
COPY --chown=appuser:appgroup backend/ .

# Volume для медиа
VOLUME ["/app/media"]

USER appuser

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]


# ============================================
# Этап 2: Production (для продакшена)
# ============================================
FROM python:3.12-slim AS production

WORKDIR /app

# Установка системных зависимостей
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Создание пользователя для запуска (безопасность)
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Копирование зависимостей
COPY backend/requirements.txt .

# Установка Python зависимостей
RUN pip install --no-cache-dir -r requirements.txt

# Копирование кода
COPY --chown=appuser:appgroup backend/ .

# Volume для медиа
VOLUME ["/app/media"]

USER appuser

EXPOSE 8000

CMD ["gunicorn", "mycloud.wsgi:application", "--bind", "0.0.0.0:8000"]
