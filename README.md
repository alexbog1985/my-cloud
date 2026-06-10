# My Cloud - Облачное хранилище

Дипломный проект по профессии «Fullstack-разработчик на Python».

## Описание проекта

My Cloud — это веб-приложение для облачного хранилища файлов. Приложение позволяет пользователям загружать, хранить, управлять файлами, а также предоставлять доступ к ним другим пользователям через специальные ссылки.

## Технологии

### Бэкенд
- **Python** 3.12+
- **Django** 6.0.5
- **Django REST Framework** 3.17.1
- **JWT Authentication** (rest_framework_simplejwt) 5.5.1
- **PostgreSQL** 15+ (или SQLite для разработки)
- **python-decouple** 3.8 — управление переменными окружения

### Фронтенд
- **React** 19.2.5
- **Redux Toolkit** 2.11.2 — управление состоянием
- **React Router** 7.15.0 — маршрутизация
- **Vite** 8.0.10 — сборщик проекта
- **Bootstrap** 5.3.8 — UI фрейворк
- **Axios** 1.16.0 — HTTP клиент

## Структура проекта

```
my-cloud/
├── backend/              # Бэкенд на Django
│   ├── mycloud/          # Основные настройки проекта
│   ├── users/            # Приложение для управления пользователями
│   ├── files/            # Приложение для работы с файлами
│   ├── media/            # Файлы пользователей (генерируется)
│   ├── static/           # Статические файлы (генерируется)
│   ├── manage.py         # Управление Django проектом
│   ├── requirements.txt  # Зависимости Python
│   ├── .env.example      # Пример конфигурации (в репозитории)
│   ├── .env              # Реальная конфигурация (не в репозитории)
│   ├── .dockerignore     # Исключения для Docker
│   ├── Dockerfile        # Docker конфигурация
│   ├── docker-compose.dev.yml    # Docker для разработки
│   ├── docker-compose.prod.yml   # Docker для продакшена
│   └── Makefile          # Утилиты для разработки
├── frontend/             # Фронтенд на React
│   ├── src/              # Исходный код
│   ├── dist/             # Сборка для продакшена (генерируется)
│   ├── package.json      # Зависимости Node.js
│   └── vite.config.js    # Конфигурация Vite
├── docs/                 # Документация
│   └── deploy-reg.md     # Инструкция по деплою на reg.ru
└── README.md             # Документация
```

**Примечание по безопасности:**
- `.env` файл содержит чувствительные данные (пароли, секретные ключи) и **не должен** попадать в репозиторий
- `.env.example` содержит примеры настроек и **должен** быть в репозитории для помощи другим разработчикам

## Сборка фронтенда

Фронтенд собирается через Vite и интегрируется с Django static files:

```bash
cd frontend
npm run build
```

Создастся директория `dist/` со статическими файлами.

**Примечание:** Для интеграции с Django используйте `make build-frontend` в директории `backend/`, которая автоматически собирает фронтенд в `backend/mycloud/static/frontend/`.

## Быстрый старт

### Предварительные требования

- Python 3.12+
- Node.js 18+
- PostgreSQL 15+ (или SQLite для разработки)
- Docker 20+ (для Docker-версии)
- Git

### Установка и запуск (разработка)

#### 1. Клонирование репозитория

```bash
git clone <URL_репозитория>
cd my-cloud
```

#### 2. Настройка бэкенда

```bash
cd backend

# Создание виртуального окружения
python -m venv venv
source venv/bin/activate  # Для Windows: venv\Scripts\activate

# Установка зависимостей
pip install -r requirements.txt

# Создание .env файла из шаблона
cp .env.example .env
# Отредактируйте .env файл с настройками (см. ниже)
```

**Примечание:** Файл `.env.example` содержит примеры всех настроек для PostgreSQL, Django, CORS и других компонентов. Реальный `.env` файл исключен из репозитория (`.gitignore`) для безопасности. Всегда используйте `.env.example` как шаблон при настройке проекта.

#### 2.1. Обязательные переменные окружения

В файле `.env` должны быть указаны следующие переменные:

```env
# ============================================
# Django Security Settings
# ============================================
# Секретный ключ Django (используйте сильный случайный ключ в продакшене)
# Для генерации: python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
SECRET_KEY=your-secret-key-change-in-production

# Режим отладки (True для разработки, False для продакшена)
DEBUG=True

# Список разрешённых хостов (через запятую)
# Для разработки: localhost,127.0.0.1
# Для продакшена: mycloud.example.com,www.mycloud.example.com
ALLOWED_HOSTS=localhost,127.0.0.1


# ============================================
# Database (PostgreSQL)
# ============================================
# Движок базы данных
# Для разработки можно использовать: django.db.backends.sqlite3
DB_ENGINE=django.db.backends.postgresql

# Имя базы данных
DB_NAME=mycloud

# Пользователь базы данных
DB_USER=postgres

# Пароль базы данных
DB_PASSWORD=yourpassword

# Хост базы данных
# Для Docker: db (имя сервиса в docker-compose)
# Для локальной разработки: localhost
DB_HOST=localhost

# Порт базы данных
DB_PORT=5432


# ============================================
# Media Files (Загруженные файлы пользователей)
# ============================================
# Абсолютный путь к директории медиафайлов
# Для Docker: /app/media
# Для локальной разработки: /absolute/path/to/my-cloud/backend/media
MEDIA_ROOT=/absolute/path/to/my-cloud/backend/media


# ============================================
# File Upload Settings
# ============================================
# Максимальный размер файла в мегабайтах (по умолчанию 100MB)
MAX_FILE_SIZE=100


# ============================================
# CORS (Cross-Origin Resource Sharing)
# ============================================
# Разрешённые источники для CORS (через запятую)
# Для разработки: http://localhost:5173,http://127.0.0.1:5173
# Для продакшена: https://mycloud.example.com
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173


# ============================================
# CSRF Trust (для продакшена)
# ============================================
# Разрешённые источники для CSRF защиты (через запятую)
# Для продакшена: https://mycloud.example.com
CSRF_TRUSTED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

#### 3. Создание базы данных и миграций

```bash
# Применение миграций
python manage.py migrate

# Создание суперпользователя (администратора)
python manage.py createsuperuser

# Запуск сервера
python manage.py runserver
```

Бэкенд будет доступен по адресу: `http://localhost:8000`

#### 4. Использование Makefile (рекомендуется)

В проекте есть Makefile с полезными командами для разработки:

```bash
cd backend

# Применение миграций
make migrate

# Запуск сервера разработки
make run

# Запуск тестов
make test

# Сборка статических файлов
make collectstatic

# Форматирование кода
make format

# Проверка кода (flake8)
make lint

# Сборка фронтенда
make build-frontend

# Запуск Docker
make docker-up

# Помощь по командам
make help
```

**Команда `build-frontend`:**

Команда собирает фронтенд через Vite и размещает статические файлы в `backend/mycloud/static/frontend/` для интеграции с Django. После сборки фронтенда запустите `make collectstatic` для копирования файлов в `static/`.

#### 5. Сборка фронтенда для продакшена

```bash
cd ../frontend

# Сборка фронтенда (создает папку dist/)
npm run build
```

**Примечание:** Сборка фронтенда включена в Makefile команду `make build-frontend`, которая автоматически собирает фронтенд в директорию `backend/mycloud/static/frontend/` для интеграции с Django.

#### 6. Логирование

В проекте настроено логирование Django с выводом в консоль:

- **Формат:** `[YYYY-MM-DD HH:MM:SS] LEVEL logger_name: message`
- **Уровень:** DEBUG (для разработки)
- **Вывод:** stderr (для удобства Docker)

Логи включают:
- Дата и время события
- Уровень важности (DEBUG, INFO, WARNING, ERROR)
- Имя логгера
- Сообщение

#### 6. Настройка и запуск фронтенда

```bash
cd ../frontend

# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev
```

Фронтенд будет доступен по адресу: `http://localhost:5173`

### Проверка конфигурации разработки

После установки проверьте настройки:

```bash
# Проверка .env файла
cd backend
cat .env

# Проверка Django конфигурации
python manage.py check

# Проверка статических файлов
python manage.py collectstatic --check
```

### Установка и запуск (продакшн)

#### 1. Сборка фронтенда

```bash
cd frontend
npm run build
```

Создастся директория `dist/` со статическими файлами.

**Примечание:** Для интеграции с Django используйте `make build-frontend` в директории `backend/`, которая автоматически собирает фронтенд в `backend/mycloud/static/frontend/`.

#### 2. Сборка и запуск (простой способ через Makefile)

```bash
cd backend

# Сборка фронтенда и настройка статических файлов
make build-frontend

# Сборка статических файлов Django
make collectstatic

# Применение миграций
make migrate

# Запуск сервера
make run
```

Все файлы (frontend + backend) будут доступны на `http://localhost:8000`.

#### 3. Запуск с помощью Gunicorn (рекомендуемый вариант)

```bash
# Установка Gunicorn (если не установлен)
pip install gunicorn

# Запуск с Gunicorn
# Для продакшна рекомендуется использовать Docker (см. ниже)
gunicorn mycloud.wsgi:application --bind 0.0.0.0:8000
```

#### 4. Настройка Nginx (пример)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /static/ {
        alias /path/to/my-cloud/backend/static/;
    }

    location /media/ {
        alias /path/to/my-cloud/backend/media/;
    }
}
```

## Docker

### Предварительные требования

- Docker 20+
- Docker Compose 2+

### Конфигурация для разработки и продакшна

Проект использует два разных Docker Compose файла:

| Конфигурация | Файл | Назначение |
|-------------|------|-----------|
| **Разработка** | `docker-compose.dev.yml` | Локальная разработка с автоматической перезагрузкой |
| **Продакшн** | `docker-compose.prod.yml` | Оптимизированная сборка для продакшена |

### Установка и запуск (разработка)

```bash
cd backend
docker-compose -f docker-compose.dev.yml build
docker-compose -f docker-compose.dev.yml up
```

**Преимущества режима разработки:**
- Автоматическая перезагрузка кода при изменениях
- Подробный вывод логов
- Проброс Volume для удобной отладки

**Проверка:**
- Бэкенд: `http://localhost:8000`
- Логи: `docker-compose -f docker-compose.dev.yml logs -f`

**Остановка:**
```bash
docker-compose -f docker-compose.dev.yml down
```

### Установка и запуск (продакшн)

```bash
cd backend
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

**Преимущества режима продакшна:**
- Автоматическая сборка фронтенда через Vite в Docker (этап `build-frontend`)
- Gunicorn с оптимизированными настройками
- Ограничение ресурсов контейнеров
- Healthcheck для мониторинга
- Более строгие настройки безопасности

**Проверка:**
- Бэкенд + фронтенд: `http://localhost:8000`
- Логи: `docker-compose -f docker-compose.prod.yml logs -f`

**Остановка:**
```bash
docker-compose -f docker-compose.prod.yml down
```

### Полезные команды Docker

| Команда | Назначение |
|---------|------------|
| `docker-compose down` | Остановить контейнеры |
| `docker-compose up --build` | Пересобрать и запустить |
| `docker-compose logs -f` | Логи (фоллов) |
| `docker-compose exec backend bash` | Войти в контейнер |
| `docker-compose exec backend python manage.py migrate` | Применить миграции |
| `docker-compose exec backend python manage.py createsuperuser` | Создать суперпользователя |

### Переменные окружения

Файл `.env` должен содержать следующие обязательные переменные:

```env
# Обязательные переменные для продакшена
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=mycloud.example.com,www.mycloud.example.com

# PostgreSQL
DB_ENGINE=django.db.backends.postgresql
DB_NAME=mycloud
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=db
DB_PORT=5432

# Media files
MEDIA_ROOT=/app/media
MAX_FILE_SIZE=100

# CORS (для продакшена)
CORS_ALLOWED_ORIGINS=https://mycloud.example.com
CSRF_TRUSTED_ORIGINS=https://mycloud.example.com
```

**Важно:** 
- Секреты не должны попадать в репозиторий (`.gitignore` исключает `.env`, но `.env.example` должен быть)
- Для продакшна обязательно установите `DEBUG=False`
- Укажите реальные доменные имена в `ALLOWED_HOSTS` и `CSRF_TRUSTED_ORIGINS`
- В режиме Docker используй `DB_HOST=db` (имя сервиса PostgreSQL)
- Для локальной разработки используй `DB_HOST=localhost`

**Рекомендации по безопасности:**
- Всегда используйте сильный `SECRET_KEY` в продакшене
- Устанавливайте `DEBUG=False` в продакшене
- Храните реальные `.env` файлы в `.gitignore`
- Используйте `.env.example` как шаблон для создания `.env`
- Не коммитьте `.env` файлы в репозиторий

### Различия между режимами разработки и продакшна

| Настройка | Режим разработки | Режим продакшна |
|-----------|-----------------|----------------|
| **DEBUG** | `True` | `False` |
| **Сервер** | Django dev server | Gunicorn |
| **Workers** | 1 (автоматическая перезагрузка) | 2+ (оптимизировано) |
| **Sourcemaps** | Включены | Отключены |
| **Логирование** | Подробное (DEBUG) | Стандартное (INFO) |
| **CORS** | Все локальные хосты | Только продакшн домены |
| **Безопасность** | Отключены некоторые проверки | Включены все проверки |

**Рекомендации:**
- Всегда используйте `DEBUG=False` в продакшене
- Устанавливайте правильные значения для `ALLOWED_HOSTS` и `CSRF_TRUSTED_ORIGINS`
- Используйте `.env.example` как шаблон для создания `.env`
- Храните реальные `.env` файлы в `.gitignore`

## API Документация

### Аутентификация

Для доступа к защищенным эндпоинтам используйте JWT токены:

```http
POST /api/login/
Content-Type: application/json

{
  "username": "username",
  "password": "password"
}

# Ответ содержит access и refresh токены
```

Добавляйте access токен в заголовок авторизации:

```http
Authorization: Bearer <access_token>
```

### Эндпоинты

#### Пользователи

- `POST /api/register/` — Регистрация пользователя
- `POST /api/login/` — Аутентификация
- `GET /api/users/me/` — Данные текущего пользователя
- `GET /api/users/all/` — Список всех пользователей (только администратор)
- `DELETE /api/users/{id}/delete/` — Удаление пользователя (только администратор)
- `PUT /api/users/{id}/toggle-admin/` — Переключение флага администратора (только администратор)

#### Файлы

- `GET /api/files/` — Список файлов пользователя
- `GET /api/files/{id}/` — Информация о файле
- `POST /api/files/` — Загрузка файла
- `PATCH /api/files/{id}/` — Обновление файла (комментарий, переименование)
- `DELETE /api/files/{id}/` — Удаление файла
- `GET /api/files/{id}/download/` — Скачивание файла
- `GET /api/files/{id}/download/?info=true` — Информация о файле без обновления даты скачивания
- `GET /api/s/{special_link}/` — Скачивание файла по специальной ссылке (без аутентификации)

## Тестирование

### Тесты бэкенда

```bash
cd backend
python manage.py test
```

### Тесты фронтенда

```bash
cd frontend
npm test
```

## Критерии готовности

Проект соответствует всем обязательным требованиям дипломного проекта:

- ✅ Бэкенд на Django с PostgreSQL/SQLite
- ✅ Фронтенд на React + Redux + React Router
- ✅ REST API с JWT аутентификацией
- ✅ Валидация данных при регистрации
- ✅ Административный интерфейс
- ✅ Работа с файловым хранилищем
- ✅ Специальные ссылки для публичного доступа
- ✅ Тесты (100 бэкенд + 174 фронтенд)
- ✅ Интеграция frontend с Django через static files
- ✅ Документация по развёртыванию на reg.ru
- ✅ Makefile с полезными командами
- ✅ Логирование Django
- ✅ Валидация размера файла (максимум 100MB)
- ✅ Endpoint logout с blacklist токенов
- ✅ Переменные окружения для конфигурации

### Выполненные обязательные требования:

#### Бэкенд:
- ✅ **Интеграция frontend с Django** — frontend собирается через Vite в `backend/mycloud/static/frontend/` и раздаётся Django через `TemplateView` и `django.contrib.staticfiles`. Все API-вызовы и статические ресурсы обрабатываются единым сервером Django.
- ✅ **СУБД PostgreSQL** — настройки готовы (используют переменные окружения)
- ✅ **Логирование сервера** — настроено с выводом в консоль
- ✅ **JWT access token lifetime** — установлено 60 минут (разумное значение)
- ✅ **Эндпоинт logout** — реализован с blacklist токенов

### Дополнительные функции (не обязательные):

#### Фронтенд:
- **Поиск файлов** — отсутствует поиск по имени файла или комментарию. *Не указано в обязательных требованиях.*
- **Фильтрация файлов** — отсутствует фильтрация по дате загрузки или размеру. *Не указано в обязательных требованиях.*
- **Массовые операции** — отсутствуют массовые операции (удаление, перемещение нескольких файлов одновременно). *Не указано в обязательных требованиях.*
- **Предпросмотр файлов** — отсутствует предпросмотр файлов (изображений, PDF, текстовых файлов) непосредственно в браузере. *Не указано в обязательных требованиях.*
- **Информационная страница файла** — отсутствует отдельная страница с подробной информацией о файле. *Не указано в обязательных требованиях.*

### Инфраструктура:
- ✅ **Документация по развёртыванию на reg.ru** — инструкции по развертыванию на платформе reg.ru включены в `docs/deploy-reg.md`.
- ✅ **Makefile** — утилиты для разработки и деплоя
- ✅ **Docker конфигурация** — docker-compose для разработки и продакшна
- ✅ **Переменные окружения** — полная конфигурация через .env

## Дополнительная информация

- Документация Django: https://docs.djangoproject.com/
- Документация React: https://react.dev/
- Документация Vite: https://vitejs.dev/
- Документация Docker: https://docs.docker.com/

## Лицензия

Этот проект создан в образовательных целях в рамках обучения по профессии «Fullstack-разработчик на Python».
