# Развёртывание My Cloud на reg.ru по IP-адресу

## Простая инструкция (с созданием пользователя)

**Преимущества:** Работа без root-прав, проект в домашней папке пользователя

---

### 1. Подготовка

**Что нужно:**
- Аккаунт на reg.ru
- Виртуальный сервер с Ubuntu (рекомендуется 22.04)
- IP-адрес сервера (например, `123.45.67.89`)

---

### 2. Подключение под root

```bash
ssh root@<ВАШ_IP_АДРЕС>
```

---

### 3. Создание пользователя

```bash
# Создание пользователя
adduser deploy

# Добавление в группу sudo
usermod -aG sudo deploy

# Подключение под новым пользователем
su - deploy
```

---

### 4. Установка необходимого ПО

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка основных компонентов
sudo apt install -y python3-pip python3-venv python3-dev postgresql postgresql-contrib nginx git nodejs npm

# Проверка версий
python3 --version
node --version
npm --version
```

---

### 5. Настройка базы данных PostgreSQL

```bash
# Вход от имени пользователя postgres
sudo -u postgres psql

# Создание базы и пользователя
CREATE DATABASE mycloud;
CREATE USER mycloud_user WITH PASSWORD 'ваш_надёжный_пароль';
GRANT ALL PRIVILEGES ON DATABASE mycloud TO mycloud_user;

# Предоставление прав на schema public (обязательно для Django миграций)
\c mycloud
GRANT CREATE ON SCHEMA public TO mycloud_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO mycloud_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO mycloud_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO mycloud_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO mycloud_user;

ALTER ROLE mycloud_user SET client_encoding TO 'utf8';
ALTER ROLE mycloud_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE mycloud_user SET timezone TO 'Europe/Moscow';
\q
```

---

### 6. Клонирование и настройка проекта

```bash
# Клонирование проекта в домашнюю папку
cd ~
git clone <ВАШ_РЕПОЗИТОРИЙ> mycloud
cd mycloud

# Настройка виртуального окружения Python
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn

# Настройка .env файла
cp .env.example .env
nano .env
```

**Заполните `.env` файл:**
```bash
SECRET_KEY=<сгенерируйте случайную строку>
DEBUG=False
ALLOWED_HOSTS=<ВАШ_IP_АДРЕС>

DB_ENGINE=django.db.backends.postgresql
DB_NAME=mycloud
DB_USER=mycloud_user
DB_PASSWORD=<пароль_из_шага_5>
DB_HOST=localhost
DB_PORT=5432

API_URL=http://<ВАШ_IP_АДРЕС>/api

MEDIA_ROOT=/home/deploy/mycloud/backend/media

# Настройки для HTTP (без HTTPS)
CSRF_COOKIE_SECURE=False
SESSION_COOKIE_SECURE=False
SECURE_SSL_REDIRECT=False
```

---

### 7. Сборка фронтенда (до бэкенда!)

```bash
cd /home/deploy/mycloud/frontend
npm install
npm run build
```

---

### 8. Сборка статических файлов Django

```bash
cd /home/deploy/mycloud/backend
python manage.py collectstatic --noinput
```

Статические файлы будут собраны в `/home/deploy/mycloud/staticfiles/`.

---

### 9. Применение миграций и создание админа

```bash
cd /home/deploy/mycloud/backend
source venv/bin/activate
python manage.py migrate
python manage.py createsuperuser
```

---

### 10. Настройка прав доступа (важно для Nginx!)

```bash
# Добавление пользователя www-data в группу deploy
sudo usermod -aG deploy www-data

# Установка прав на директорию проекта
cd /home/deploy
chmod 755 /home/deploy
chmod 755 /home/deploy/mycloud

# Рекурсивное предоставление прав на чтение для www-data
sudo chmod -R g+rX /home/deploy/mycloud/backend/venv
sudo chmod -R g+rX /home/deploy/mycloud/frontend/dist
sudo chmod -R g+rX /home/deploy/mycloud/staticfiles
sudo chmod -R g+rX /home/deploy/mycloud/backend/media
```

---

### 11. Тестовый запуск Gunicorn

```bash
cd /home/deploy/mycloud/backend
source venv/bin/activate
gunicorn mycloud.wsgi:application --bind 0.0.0.0:8000
```

Откройте `http://<ВАШ_IP>:8000` в браузере — должен открыться сайт.

---

### 12. Настройка systemd для Gunicorn

```bash
# Создайте сервисный файл
sudo nano /etc/systemd/system/gunicorn.service
```

```ini
[Unit]
Description=Gunicorn for My Cloud
After=network.target

[Service]
User=deploy
Group=deploy
WorkingDirectory=/home/deploy/mycloud/backend
ExecStart=/home/deploy/mycloud/backend/venv/bin/gunicorn \
          --workers 3 \
          --bind unix:/home/deploy/mycloud/backend/gunicorn.sock \
          mycloud.wsgi:application

[Install]
WantedBy=multi-user.target
```

```bash
# Запуск сервиса
sudo systemctl daemon-reload
sudo systemctl start gunicorn
sudo systemctl enable gunicorn
```

---

### 13. Настройка Nginx

```bash
# Создайте конфигурацию
sudo nano /etc/nginx/sites-available/mycloud
```

```nginx
server {
    listen 80;
    server_name <ВАШ_IP_АДРЕС>;

    client_max_body_size 100M;

    location /static/ {
        alias /home/deploy/mycloud/staticfiles/;
    }

    location /media/ {
        alias /home/deploy/mycloud/backend/media/;
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:/home/deploy/mycloud/backend/gunicorn.sock;
    }
}
```

```bash
# Активация и перезапуск
sudo ln -s /etc/nginx/sites-available/mycloud /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

### 14. Финал

Откройте `http://<ВАШ_IP>` в браузере. Сайт должен работать!

**Админка:** `http://<ВАШ_IP>/admin/`

---

## Резервное копирование (опционально)

```bash
# Бэкап базы данных
pg_dump -U mycloud_user mycloud > backup.sql

# Бэкап медиа-файлов
tar -czf media_backup.tar.gz /home/deploy/mycloud/backend/media
```

---

## Обновление проекта

```bash
cd /home/deploy/mycloud
git pull origin main

cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate

cd ../frontend
npm install
npm run build

cd ../backend
python manage.py collectstatic --noinput

# Обновление прав (если добавлялись новые файлы)
sudo chmod -R g+rX /home/deploy/mycloud/backend/venv
sudo chmod -R g+rX /home/deploy/mycloud/staticfiles

sudo systemctl restart gunicorn
```

---

## Проверка статуса

```bash
# Статус Gunicorn
sudo systemctl status gunicorn

# Логи Gunicorn
sudo journalctl -u gunicorn -f

# Статус Nginx
sudo systemctl status nginx

# Проверка прав на сокет
ls -la /home/deploy/mycloud/backend/gunicorn.sock
```
