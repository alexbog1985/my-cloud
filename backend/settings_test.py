"""
Тестовые настройки Django

Используются для изоляции тестов от основной базы данных.
"""
from .mycloud.settings import *

# Используем SQLite для тестов (быстро и изолированно)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Отключаем кэширование для тестов
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}
