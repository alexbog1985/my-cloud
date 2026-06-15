"""Конфигурация для pytest-django"""
import shutil
import tempfile

import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model


User = get_user_model()


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


# ============ Фикстуры для модуля users ============


@pytest.fixture(scope='session')
def user_password():
    """Общий пароль для всех тестовых пользователей"""
    return 'TestPass123!'


@pytest.fixture(scope='session')
def admin_password():
    """Общий пароль для тестовых администраторов"""
    return 'AdminPass123!'


@pytest.fixture(scope='session')
def api_client():
    """Экземпляр APIClient для тестов"""
    return APIClient()


@pytest.fixture(scope='session')
def default_user_data():
    """Стандартные данные обычного пользователя"""
    return {
        'username': 'testuser',
        'first_name': 'Test',
        'last_name': 'User',
        'email': 'test@example.com',
        'password': 'TestPass123!'
    }


@pytest.fixture(scope='session')
def admin_user_data():
    """Стандартные данные администратора"""
    return {
        'username': 'adminuser',
        'first_name': 'Admin',
        'last_name': 'User',
        'email': 'admin@example.com',
        'password': 'AdminPass123!'
    }


@pytest.fixture
def authenticated_client(api_client, user_password):
    """Аутентифицированный клиент для тестов
    
    С scope='function' для создания нового пользователя в каждой тесте
    """
    from users.factories import UserFactory
    user = UserFactory(password=user_password)
    api_client.force_authenticate(user=user)
    return api_client, user


@pytest.fixture
def authenticated_admin_client(api_client, admin_password):
    """Аутентифицированный клиент-администратор для тестов"""
    from users.factories import AdminUserFactory
    user = AdminUserFactory(password=admin_password)
    api_client.force_authenticate(user=user)
    return api_client, user


@pytest.fixture
def get_jwt_tokens():
    """Функция для получения JWT токенов"""
    from rest_framework_simplejwt.tokens import RefreshToken
    
    def _get_tokens(user):
        refresh = RefreshToken.for_user(user)
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        }
    
    return _get_tokens


@pytest.fixture
def auth_headers(get_jwt_tokens):
    """Функция для получения заголовков авторизации с JWT токеном
    
    Usage:
        headers = auth_headers(user)
        response = client.get('/api/users/me/', headers=headers)
    """
    def _get_auth_headers(user):
        tokens = get_jwt_tokens(user)
        return {
            'Authorization': f'Bearer {tokens["access"]}',
            'Content-Type': 'application/json'
        }
    
    return _get_auth_headers
