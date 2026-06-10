# Деплой на reg.ru (VPS на Ubuntu)

## Предварительные требования

1. **VPS на reg.ru**
   - Выберите тарифный план с Ubuntu 22.04 LTS (64-bit)
   - Рекомендуемые параметры: 2 ядра CPU, 4GB RAM, 50GB SSD
   - Запишите IP-адрес и пароль от root

2. **Доменное имя**
   - Приобретите домен на reg.ru (например, mycloud.example.com)
   - Настройте A-запись на IP-адрес вашего VPS

## Пошаговая инструкция деплоя

### Шаг 1: Подключение к серверу

```bash
ssh root@<IP-адрес-вашего-VPS>
# или
ssh user@<IP-адрес-вашего-VPS>
```

### Шаг 2: Обновление системы

```bash
apt update && apt upgrade -y
```

### Шаг 3: Установка необходимых пакетов

```bash
# Установка Python и pip
apt install -y python3 python3-pip python3-venv

# Установка PostgreSQL
apt install -y postgresql postgresql-contrib

# Установка Nginx
apt install -y nginx

# Установка Git
apt install -y git

# Установка Docker (опционально, для контейнеризации)
apt install -y docker.io docker-compose-plugin
```

### Шаг 4: Настройка PostgreSQL

```bash
# Переключение на пользователя postgres
sudo -u postgres psql

# Создание базы данных и пользователя
CREATE DATABASE mycloud;
CREATE USER myclouduser WITH PASSWORD 'ваш-секретный-пароль';
ALTER ROLE myclouduser SET client_encoding TO 'utf8';
ALTER ROLE myclouduser SET default_transaction_isolation TO 'read committed';
ALTER ROLE myclouduser SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE mycloud TO myclouduser;
EXIT;
```

### Шаг 5: Настройка firewall

```bash
# Включение UFW
ufw enable

# Разрешение SSH (важно! иначе потеряете доступ)
ufw allow OpenSSH

# Разрешение HTTP и HTTPS
ufw allow 'Nginx Full'

# Проверка статуса
ufw status
```

### Шаг 6: Клонирование репозитория

```bash
cd /var/www
git clone <URL-вашего-репозитория> mycloud
cd mycloud
```

### Шаг 7: Настройка окружения

```bash
cd backend

# Создание .env файла
cp .env.example .env

# Редактирование .env файла
nano .env
```

Заполните параметры:

```env
# Безопасность
SECRET_KEY=ваш-очень-секретный-ключ-из-32-символов
DEBUG=False
ALLOWED_HOSTS=ваш-домен.com,www.ваш-домен.com

# PostgreSQL
DB_ENGINE=django.db.backends.postgresql
DB_NAME=mycloud
DB_USER=myclouduser
DB_PASSWORD=ваш-секретный-пароль
DB_HOST=localhost
DB_PORT=5432

# Media files
MEDIA_ROOT=/var/www/mycloud/backend/media

# File Upload Settings
MAX_FILE_SIZE=100

# CORS (для продакшена)
CORS_ALLOWED_ORIGINS=https://ваш-домен.com
CSRF_TRUSTED_ORIGINS=https://ваш-домен.com
```

### Шаг 8: Установка зависимостей Python

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Шаг 9: Применение миграций

```bash
python manage.py migrate
python manage.py createsuperuser
```

### Шаг 10: Установка Node.js и сборка фронтенда

```bash
# Установка Node.js 18+
apt install -y nodejs npm

# Переход в директорию frontend
cd /var/www/mycloud/frontend

# Установка зависимостей
npm ci --silent

# Сборка фронтенда
npm run build -- --mode production

# Проверка, что папка dist/ создана
ls -la dist/
```

**Примечание:** Для интеграции с Django используйте команду из Makefile:

```bash
cd /var/www/mycloud/backend
make build-frontend
make collectstatic
```

### Шаг 11: Сборка статических файлов

```bash
cd /var/www/mycloud/backend
python manage.py collectstatic --no-input
```

**Примечание:** Если вы используете `make build-frontend`, статические файлы будут помещены в `backend/mycloud/static/frontend/` и затем скопированы в `static/` через `collectstatic`.

### Шаг 12: Проверка конфигурации

```bash
cd /var/www/mycloud/backend
source venv/bin/activate

# Проверка конфигурации Django
python manage.py check

# Проверка статических файлов
python manage.py collectstatic --check
```

### Шаг 13: Настройка Gunicorn

Создайте systemd service файл:

```bash
nano /etc/systemd/system/gunicorn.service
```

Содержимое:

```ini
[Unit]
Description=Gunicorn instance to serve mycloud
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/mycloud/backend
EnvironmentFile=/var/www/mycloud/backend/.env
ExecStart=/var/www/mycloud/backend/venv/bin/gunicorn \
  --access-logfile - \
  --workers 3 \
  --bind unix:/var/www/mycloud/backend/gunicorn.sock \
  mycloud.wsgi:application

[Install]
WantedBy=multi-user.target
```

Запустите Gunicorn:

```bash
systemctl start gunicorn
systemctl enable gunicorn
systemctl status gunicorn
```

### Шаг 12: Настройка Nginx

Создайте конфигурацию:

```bash
nano /etc/nginx/sites-available/mycloud
```

Содержимое:

```nginx
server {
    listen 80;
    server_name ваш-домен.com www.ваш-домен.com;

    # Логи
    access_log /var/log/nginx/mycloud_access.log;
    error_log /var/log/nginx/mycloud_error.log;

    # Максимальный размер загружаемого файла (100MB)
    client_max_body_size 100M;

    location / {
        include proxy_params;
        proxy_pass http://unix:/var/www/mycloud/backend/gunicorn.sock;
    }

    location /static/ {
        alias /var/www/mycloud/backend/static/;
    }

    location /media/ {
        alias /var/www/mycloud/backend/media/;
    }

    # Обработка ошибок
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

Активируйте конфигурацию:

```bash
ln -s /etc/nginx/sites-available/mycloud /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### Шаг 14: Настройка HTTPS (Let's Encrypt)

```bash
# Установка certbot
apt install -y certbot python3-certbot-nginx

# Получение сертификата
certbot --nginx -d ваш-домен.com -d www.ваш-домен.com

# Проверка автоматического продления
systemctl status certbot.timer
```

### Шаг 15: Проверка работы

Откройте в браузере:
- http://ваш-домен.com
- https://ваш-домен.com (после настройки HTTPS)

Проверьте:
- Доступна ли главная страница
- Работает ли регистрация
- Работает ли вход
- Можно ли загрузить файл

### Шаг 16: Настройка мониторинга и логов

Проверьте логи Django и приложения:

```bash
# Логи Django (в терминале или через journalctl)
tail -f /var/www/mycloud/backend/gunicorn_error.log

# Логи Nginx
tail -f /var/log/nginx/mycloud_error.log

# Логи Gunicorn
journalctl -u gunicorn -f

# Логи PostgreSQL
journalctl -u postgresql -f
```

### Шаг 17: Автоматический деплой через GitHub Actions

## Решение проблем

### Gunicorn не запускается

```bash
# Проверить логи
journalctl -xeu gunicorn

# Перезапустить
systemctl restart gunicorn
```

### Nginx не перенаправляет запросы

```bash
# Проверить конфигурацию
nginx -t

# Перезагрузить
systemctl reload nginx
```

### Ошибка подключения к PostgreSQL

```bash
# Проверить, запущен ли PostgreSQL
systemctl status postgresql

# Перезапустить
systemctl restart postgresql
```

### Файлы не загружаются

```bash
# Проверить права на директорию media
chown -R www-data:www-data /var/www/mycloud/backend/media
chmod -R 755 /var/www/mycloud/backend/media
```

## Резервное копирование

```bash
# Резервная копия базы данных
pg_dump -U myclouduser mycloud > backup.sql

# Резервная копия файлов
tar -czf media_backup.tar.gz /var/www/mycloud/backend/media
```

## Обновление приложения

```bash
cd /var/www/mycloud
git pull origin main
cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --no-input
sudo systemctl restart gunicorn
```

## Мониторинг

```bash
# Логи Gunicorn
tail -f /var/www/mycloud/backend/gunicorn_error.log

# Логи Nginx
tail -f /var/log/nginx/mycloud_error.log

# Логи приложения
tail -f /var/log/syslog | grep mycloud
```

## Полезные команды

```bash
# Перезапуск Gunicorn
sudo systemctl restart gunicorn

# Перезапуск Nginx
sudo systemctl restart nginx

# Проверка статуса
systemctl status gunicorn
systemctl status nginx
systemctl status postgresql

# Просмотр логов
journalctl -u gunicorn -f
tail -f /var/log/nginx/error.log
```
