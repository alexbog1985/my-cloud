"""Конфигурация для pytest-django"""
import shutil
import tempfile

import pytest


@pytest.fixture(scope='session')
def django_db_setup():
    """Настройка тестовой базы данных
    
    Этот фикстур определяет, как pytest-django будет управлять базой данных:
    - В режиме по умолчанию (scope='session') база создается один раз для всех тестов
    - Для тестов с транзакциями используйте fixture с scope='function'
    """
    # Указываем, что используем настройки из Django
    pass


@pytest.fixture(scope='session')
def media_root():
    """Временная папка для медиа-файлов во время тестов"""
    temp_dir = tempfile.mkdtemp()
    yield temp_dir
    shutil.rmtree(temp_dir, ignore_errors=True)


@pytest.fixture(autouse=True)
def use_media_root(media_root, settings):
    """Переопределение MEDIA_ROOT для всех тестов"""
    settings.MEDIA_ROOT = media_root
