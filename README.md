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
│   └── docker-compose.prod.yml   # Docker для продакшена
├── frontend/             # Фронтенд на React
│   ├── src/              # Исходный код
│   ├── dist/             # Сборка для продакшена (генерируется)
│   ├── package.json      # Зависимости Node.js
│   └── vite.config.js    # Конфигурация Vite
└── README.md             # Документация
```

**Примечание по безопасности:**
- `.env` файл содержит чувствительные данные (пароли, секретные ключи) и **не должен** попадать в репозиторий
- `.env.example` содержит примеры настроек и **должен** быть в репозитории для помощи другим разработчикам

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

**Примечание:** Файл `.env.example` содержит примеры всех настроек. Реальный `.env` файл исключен из репозитория (`.gitignore`) для безопасности.

**Пример `.env` файла:**
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

#### 4. Настройка и запуск фронтенда

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

#### 2. Сборка статических файлов Django

```bash
cd ../backend
python manage.py collectstatic
```

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
- Gunicorn с оптимизированными настройками
- Ограничение ресурсов контейнеров
- Healthcheck для мониторинга
- Более строгие настройки безопасности

**Проверка:**
- Бэкенд: `http://localhost:8000`
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
# Обязательные переменные
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=mycloud.example.com,www.mycloud.example.com

# PostgreSQL
DB_ENGINE=django.db.backends.postgresql
DB_NAME=mycloud
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432

# Media files
MEDIA_ROOT=/absolute/path/to/my-cloud/backend/media

# CORS
CORS_ALLOWED_ORIGINS=https://mycloud.example.com
CSRF_TRUSTED_ORIGINS=https://mycloud.example.com
```

**Важно:** 
- Секреты не должны попадать в репозиторий (`.gitignore` исключает `.env`, но `.env.example` должен быть)
- Для продакшна обязательно установите `DEBUG=False`
- Укажите реальные доменные имена в `ALLOWED_HOSTS` и `CSRF_TRUSTED_ORIGINS`

**Важно:** 
- В режиме Docker используй `DB_HOST=db` (имя сервиса PostgreSQL)
- В режиме локальной разработки используй `DB_HOST=localhost`
- Секреты не должны попадать в репозиторий (`.gitignore` исключает `.env`)

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
- ✅ Тесты (90 бэкенд + 174 фронтенд)

## Недоделанные функции

Проект реализует **почти весь обязательный функционал** согласно заданию task.md. Ниже перечислены функции, которые **не реализованы, но являются обязательными** или **дополнительными**:

### Обязательные недоделанные функции:

#### Бэкенд (не соответствует обязательным требованиям):
- **Интеграция frontend с Django** — frontend собирается отдельно через Vite и не интегрирован с Django templates для единой точки развертывания (указано: "Загрузка статических ресурсов (HTML, CSS, JS-файлы фронтенда), а также API-вызовы обрабатываются единым сервером").

### Дополнительные функции (не обязательные):

#### Фронтенд:
- **Поиск файлов** — отсутствует поиск по имени файла или комментарию. *Не указано в обязательных требованиях.*
- **Фильтрация файлов** — отсутствует фильтрация по дате загрузки или размеру. *Не указано в обязательных требованиях.*
- **Массовые операции** — отсутствуют массовые операции (удаление, перемещение нескольких файлов одновременно). *Не указано в обязательных требованиях.*
- **Предпросмотр файлов** — отсутствует предпросмотр файлов (изображений, PDF, текстовых файлов) непосредственно в браузере. *Не указано в обязательных требованиях.*
- **Информационная страница файла** — отсутствует отдельная страница с подробной информацией о файле. *Не указано в обязательных требованиях.*

### Инфраструктура:
- **Документация по развёртыванию на reg.ru** — инструкции по развертыванию на платформе reg.ru отсутствуют. *Дополнительная документация для продакшн-развёртывания.*

## Дополнительная информация

- Документация Django: https://docs.djangoproject.com/
- Документация React: https://react.dev/
- Документация Vite: https://vitejs.dev/
- Документация Docker: https://docs.docker.com/

## Лицензия

Этот проект создан в образовательных целях в рамках обучения по профессии «Fullstack-разработчик на Python».
