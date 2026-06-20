# My Cloud — Облачное хранилище

Дипломный проект по профессии «Fullstack-разработчик на Python»

## Описание

My Cloud — это веб-приложение для облачного хранения файлов, реализованное как монорепозиторий с бэкендом на Django и фронтендом на React.

### Основные функции

- Регистрация и аутентификация пользователей (JWT)
- Управление файлами: загрузка, скачивание, переименование, удаление, копирование ссылки
- Административный интерфейс для управления пользователями и их хранилищами
- Поддержка публичных ссылок для доступа к файлам без аутентификации

## Структура проекта

```
my-cloud/
├── backend/           # Django REST Framework бэкенд
│   ├── files/         # Приложение для работы с файлами
│   ├── users/         # Приложение для управления пользователями
│   ├── mycloud/       # Основная конфигурация Django
│   ├── manage.py      # Управление Django проектом
│   ├── requirements.txt
│   └── .env.example   # Пример переменных окружения
├── frontend/          # React приложение (Vite)
│   ├── src/           # Исходный код приложения
│   ├── dist/          # Собранные статические файлы
│   ├── package.json
│   └── vite.config.js
├── docs/              # Документация
│   └── reg_ru.md      # Инструкция по размещению на reg.ru
├── Makefile           # Список доступных команд
├── .gitignore
└── task.md            # Техническое задание
```

## Требования к инструментам

| Инструмент | Минимальная версия |
|------------|-------------------|
| Python     | 3.10              |
| Node.js    | 18.0              |
| PostgreSQL | 14                |
| Django     | 3.0               |
| React      | 18.0              |

## Установка и запуск в режиме разработки

### 1. Клонирование репозитория

```bash
git clone <репозиторий>
cd my-cloud
```

### 2. Настройка базы данных PostgreSQL

Создайте базу данных и пользователя:

```bash
psql -U postgres
CREATE DATABASE mycloud;
CREATE USER mycloud_user WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE mycloud TO mycloud_user;
ALTER ROLE mycloud_user SET client_encoding TO 'utf8';
ALTER ROLE mycloud_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE mycloud_user SET timezone TO 'Europe/Moscow';
\q
```

### 3. Настройка переменных окружения

```bash
cd backend
cp .env.example .env
# Отредактируйте .env файл

# Для продакшена добавьте API_URL:
# API_URL=http://<ВАШ_IP>/api
```

### 4. Установка зависимостей и запуск

```bash
# Backend
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# Frontend (в новом терминале)
cd ../frontend
npm install
npm run dev
```

## Сборка и запуск в продакшене

### 1. Сборка фронтенда

```bash
cd frontend
npm install
npm run build
```

### 2. Сборка статических файлов

```bash
cd backend
python manage.py collectstatic --noinput
```

### 3. Установка и запуск gunicorn

```bash
cd backend
pip install gunicorn
gunicorn mycloud.wsgi:application --bind 0.0.0.0:8000
```

**Важно:** Перед сборкой фронтенда убедитесь, что в `backend/.env` задана переменная `API_URL` с правильным адресом бэкенда для продакшена.

## Размещение на reg.ru

Детальная инструкция по размещению приложения на платформе reg.ru доступна в файле [docs/reg_ru.md](docs/reg_ru.md).

## API Endpoints

### Аутентификация и пользователи

| Метод  | Эндпоинт                        | Аутентификация            |
|--------|---------------------------------|---------------------------|
| POST   | `/api/register/`                | Нет                       |
| POST   | `/api/login/`                   | Нет                       |
| POST   | `/api/logout/`                  | Да (Bearer)               |
| POST   | `/api/token/refresh/`           | Нет                       |
| GET    | `/api/users/me/`                | Да                        |
| GET    | `/api/users/all/`               | Да (только администратор) |
| DELETE | `/api/users/{id}/delete/`       | Да (только администратор) |
| PUT    | `/api/users/{id}/toggle-admin/` | Да (только администратор) |

### Работа с файлами

| Метод  | Эндпоинт                    | Аутентификация |
|--------|-----------------------------|----------------|
| GET    | `/api/files/`               | Да             |
| POST   | `/api/files/`               | Да             |
| GET    | `/api/files/{id}/download/` | Да             |
| DELETE | `/api/files/{id}/`          | Да             |
| GET    | `/api/s/{special_link}/`    | Нет            |

## Дополнительные материалы

### Бэкенд
- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [SimpleJWT Documentation](https://django-rest-framework-simplejwt.readthedocs.io/)

### Фронтенд
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/)

## Лицензия

Этот проект создан в образовательных целях как дипломная работа по профессии «Fullstack-разработчик на Python».
