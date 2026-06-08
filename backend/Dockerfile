# ============================================
# Этап 1: Builder (для сборки зависимостей)
# ============================================
FROM python:3.12-slim AS builder

WORKDIR /build

# Установка системных зависимостей для сборки
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Копирование зависимостей
COPY backend/requirements.txt .

# Установка зависимостей с кэшированием
RUN pip install --no-cache-dir -r requirements.txt


# ============================================
# Этап 2: Development (для локальной разработки)
# ============================================
FROM python:3.12-slim AS development

WORKDIR /app

# Установка системных зависимостей
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Копирование зависимостей из builder
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
ENV PATH=/usr/local/bin:$PATH
ENV PYTHONPATH=/usr/local/lib/python3.12/site-packages:$PYTHONPATH

# Создание пользователя для запуска (безопасность)
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Копирование кода
COPY --chown=appuser:appgroup backend/ .

# Volume для медиа
VOLUME ["/app/media"]

# HEALTHCHECK (проверка через pg_isready, так как Django еще не запущен)
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD pg_isready -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} || exit 1

USER appuser

EXPOSE 8000

# Скрипт ожидания готовности БД (после USER appuser)
COPY --chmod=755 backend/wait-for-db.sh /wait-for-db.sh

CMD ["/wait-for-db.sh"]


# ============================================
# Этап 3: Production (для продакшена)
# ============================================
FROM python:3.12-slim AS production

WORKDIR /app

# Установка системных зависимостей
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Копирование зависимостей из builder
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
ENV PATH=/usr/local/bin:$PATH
ENV PYTHONPATH=/usr/local/lib/python3.12/site-packages:$PYTHONPATH

# Создание пользователя для запуска (безопасность)
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Копирование кода
COPY --chown=appuser:appgroup backend/ .

# Volume для медиа
VOLUME ["/app/media"]

# HEALTHCHECK (проверка через pg_isready, так как Django еще не запущен)
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD pg_isready -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} || exit 1

USER appuser

EXPOSE 8000

# Установка gunicorn для продакшна
RUN pip install --no-cache-dir gunicorn uvicorn

# Скрипт ожидания готовности БД (после USER appuser)
COPY --chmod=755 backend/wait-for-db.sh /wait-for-db.sh

# По умолчанию запускаем в продакшн-режиме через Gunicorn
CMD ["/wait-for-db.sh"]
