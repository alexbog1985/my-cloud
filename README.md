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

# Создание .env файла
cp .env.example .env
# Отредактируйте .env файл с настройками (см. ниже)
```

**Пример `.env` файла:**
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# База данных (PostgreSQL)
DB_ENGINE=django.db.backends.postgresql
DB_NAME=mycloud
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432

# Путь к хранилищу файлов
MEDIA_ROOT=/absolute/path/to/my-cloud/backend/media

# Для разработки можно использовать SQLite (по умолчанию в settings.py)
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
pip install gunicorn

# Запуск с Gunicorn
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

### Установка и запуск (разработка)

```bash
cd backend
docker-compose -f docker-compose.dev.yml build
docker-compose -f docker-compose.dev.yml up
```

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

**Проверка:**
- Бэкенд: `http://localhost:8000`

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

Файл `.env` должен содержать:

```env
# Обязательные переменные
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# PostgreSQL
DB_ENGINE=django.db.backends.postgresql
DB_NAME=mycloud
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=db  # Имя сервиса в docker-compose
DB_PORT=5432

# Media files
MEDIA_ROOT=/app/media

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

**Важно:** 
- В режиме Docker используй `DB_HOST=db` (имя сервиса PostgreSQL)
- В режиме локальной разработки используй `DB_HOST=localhost`
- Секреты не должны попадать в репозиторий (`.gitignore` исключает `.env`)

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
