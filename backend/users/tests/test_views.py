"""Тесты представлений (views) для модуля users

Тестируемые endpoints:
- POST /api/register/ - регистрация пользователя
- POST /api/login/ - аутентификация
- GET /api/users/me/ - данные текущего пользователя
- GET /api/users/all/ - список всех пользователей (админ)
- DELETE /api/users/{id}/delete/ - удаление пользователя (админ)
- PUT /api/users/{id}/toggle-admin/ - переключение прав администратора

Использует fixtures из conftest.py и фабрики из users.factories
"""
import pytest
from django.urls import reverse

from users.factories import UserFactory, AdminUserFactory


# ============ Тесты RegisterView ============

@pytest.mark.django_db
class TestRegisterView:
    """Тесты эндпоинта регистрации пользователя"""

    url = reverse('register')

    def test_register_success(self, api_client, default_user_data):
        """Успешная регистрация с валидными данными"""
        data = default_user_data.copy()

        response = api_client.post(self.url, data, format='json')

        assert response.status_code == 201
        assert response.data['username'] == 'testuser'
        assert response.data['email'] == 'test@example.com'
        assert 'access_token' in response.data
        assert 'refresh_token' in response.data

    def test_register_invalid_username(self, api_client, default_user_data):
        """Невалидный логин (формат, длина)"""
        data = default_user_data.copy()
        data['username'] = '1user'  # начинается с цифры

        response = api_client.post(self.url, data, format='json')

        assert response.status_code == 400
        assert 'username' in response.data

    def test_register_invalid_email(self, api_client, default_user_data):
        """Невалидный email"""
        data = default_user_data.copy()
        data['email'] = 'invalid-email'  # некорректный email

        response = api_client.post(self.url, data, format='json')

        assert response.status_code == 400
        assert 'email' in response.data

    def test_register_invalid_password(self, api_client, default_user_data):
        """Невалидный пароль (отсутствие заглавной, цифры, специального символа)"""
        data = default_user_data.copy()
        data['password'] = 'testpass'  # нет заглавной, цифры, специального символа

        response = api_client.post(self.url, data, format='json')

        assert response.status_code == 400
        assert 'password' in response.data

    def test_register_duplicate_username(self, api_client, default_user_data):
        """Дубликат логина"""
        # Создаем пользователя с таким же логином
        UserFactory.create(username=default_user_data['username'])

        response = api_client.post(self.url, default_user_data, format='json')

        assert response.status_code == 400
        assert 'username' in response.data

    def test_register_missing_fields(self, api_client, default_user_data):
        """Отсутствие обязательных полей"""
        data = {
            'username': 'newuser',
            'password': 'TestPass123!'
            # пропущены: first_name, last_name, email
        }

        response = api_client.post(self.url, data, format='json')

        assert response.status_code == 400
        assert 'first_name' in response.data or 'email' in response.data

    def test_register_password_hashed(self, api_client, default_user_data):
        """Проверка хэширования пароля"""
        api_client.post(self.url, default_user_data, format='json')

        # Получаем пользователя из базы
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user = User.objects.get(username='testuser')

        # Проверяем, что пароль хэширован (не в открытом виде)
        assert user.password != 'TestPass123!'
        assert user.check_password('TestPass123!') is True

    def test_register_generates_tokens(self, api_client, default_user_data):
        """Проверка генерации JWT токенов"""
        response = api_client.post(self.url, default_user_data, format='json')

        assert 'access_token' in response.data
        assert 'refresh_token' in response.data
        assert len(response.data['access_token']) > 0
        assert len(response.data['refresh_token']) > 0


# ============ Тесты LoginView ============

@pytest.mark.django_db
class TestLoginView:
    """Тесты эндпоинта аутентификации"""

    url = reverse('login')

    def test_login_success(self, api_client, user_password):
        """Успешный вход с валидными данными"""
        user = UserFactory.create(username='testuser', password=user_password)

        data = {
            'username': 'testuser',
            'password': user_password
        }

        response = api_client.post(self.url, data, format='json')

        assert response.status_code == 200
        assert 'access' in response.data
        assert 'refresh' in response.data
        assert 'user' in response.data
        assert response.data['user']['username'] == 'testuser'

    def test_login_invalid_password(self, api_client, user_password):
        """Неверный пароль"""
        user = UserFactory.create(username='testuser', password=user_password)

        data = {
            'username': 'testuser',
            'password': 'WrongPass123!'
        }

        response = api_client.post(self.url, data, format='json')

        # TokenObtainPairSerializer выбрасывает исключение при неверных данных
        assert response.status_code == 401

    def test_login_nonexistent_user(self, api_client, user_password):
        """Несуществующий пользователь"""
        data = {
            'username': 'nonexistent',
            'password': user_password
        }

        response = api_client.post(self.url, data, format='json')

        # TokenObtainPairSerializer выбрасывает исключение при неверных данных
        assert response.status_code == 401

    def test_login_missing_password(self, api_client, user_password):
        """Отсутствие пароля"""
        data = {
            'username': 'testuser'
            # пропущен пароль
        }

        response = api_client.post(self.url, data, format='json')

        assert response.status_code == 400

    def test_login_missing_username(self, api_client, user_password):
        """Отсутствие логина"""
        data = {
            'password': user_password
            # пропущен логин
        }

        response = api_client.post(self.url, data, format='json')

        assert response.status_code == 400

    def test_login_returns_tokens(self, api_client, user_password):
        """Возврат access и refresh токенов"""
        user = UserFactory.create(username='testuser', password=user_password)

        data = {
            'username': 'testuser',
            'password': user_password
        }

        response = api_client.post(self.url, data, format='json')

        assert 'access' in response.data
        assert 'refresh' in response.data
        assert len(response.data['access']) > 0
        assert len(response.data['refresh']) > 0


# ============ Тесты UserViewSet ============

@pytest.mark.django_db
class TestUserViewSet:
    """Тесты ViewSet для управления пользователями"""

    def test_me_endpoint_authenticated(self, authenticated_client, user_password):
        """GET /api/users/me/ - получение данных текущего пользователя с токеном"""
        client, user = authenticated_client

        response = client.get('/api/users/me/')

        assert response.status_code == 200
        assert response.data['username'] == user.username
        assert 'email' in response.data
        assert 'full_name' in response.data
        assert 'is_admin' in response.data

    def test_me_endpoint_unauthenticated(self, api_client):
        """GET /api/users/me/ - получение данных без токена"""
        response = api_client.get('/api/users/me/')

        assert response.status_code == 401

    def test_list_all_admin(self, authenticated_admin_client, user_password, admin_password, django_db_reset_sequences):
        """GET /api/users/all/ - список всех пользователей для администратора"""
        client, admin = authenticated_admin_client
        # Создаем дополнительных пользователей
        UserFactory.create(username='user1')
        UserFactory.create(username='user2')

        response = client.get('/api/users/all/')

        assert response.status_code == 200
        # Проверяем, что в ответе есть минимум 3 пользователя (admin + 2 созданных)
        # Точное количество зависит от данных из других тестов
        assert len(response.data) >= 3

    def test_list_all_not_admin(self, authenticated_client, user_password):
        """GET /api/users/all/ - ошибка для обычного пользователя"""
        client, user = authenticated_client

        response = client.get('/api/users/all/')

        assert response.status_code == 403
        assert 'error' in response.data

    def test_delete_user_admin(self, authenticated_admin_client, user_password, admin_password):
        """DELETE /api/users/{id}/delete/ - удаление пользователя администратором"""
        client, admin = authenticated_admin_client
        user_to_delete = UserFactory.create(username='userToDelete')

        response = client.delete(f'/api/users/{user_to_delete.id}/delete/')

        assert response.status_code == 204
        from django.contrib.auth import get_user_model
        User = get_user_model()
        assert not User.objects.filter(id=user_to_delete.id).exists()

    def test_delete_user_not_admin(self, authenticated_client, user_password):
        """DELETE /api/users/{id}/delete/ - удаление пользователем без прав"""
        client, user = authenticated_client
        other_user = UserFactory.create(username='otheruser')

        response = client.delete(f'/api/users/{other_user.id}/delete/')

        assert response.status_code == 403

    def test_delete_user_self(self, authenticated_client, user_password):
        """DELETE /api/users/{id}/delete/ - удаление самого себя"""
        client, user = authenticated_client

        response = client.delete(f'/api/users/{user.id}/delete/')

        assert response.status_code == 400
        assert 'error' in response.data

    def test_delete_user_not_found(self, authenticated_admin_client, user_password, admin_password):
        """DELETE /api/users/{id}/delete/ - удаление несуществующего пользователя"""
        client, admin = authenticated_admin_client

        response = client.delete('/api/users/999999/delete/')

        assert response.status_code == 404
        assert 'error' in response.data

    def test_toggle_admin_admin(self, authenticated_admin_client, user_password, admin_password):
        """PUT /api/users/{id}/toggle-admin/ - переключение прав администратора"""
        client, admin = authenticated_admin_client
        user = UserFactory.create(username='user', is_admin=False)

        # Переключаем в администраторы
        response = client.put(f'/api/users/{user.id}/toggle-admin/')

        assert response.status_code == 200
        assert response.data['is_admin'] is True

        # Переключаем обратно
        response = client.put(f'/api/users/{user.id}/toggle-admin/')

        assert response.status_code == 200
        assert response.data['is_admin'] is False

    def test_toggle_admin_not_admin(self, authenticated_client, user_password):
        """PUT /api/users/{id}/toggle-admin/ - переключение без прав"""
        client, user = authenticated_client
        other_user = UserFactory.create(username='otheruser')

        response = client.put(f'/api/users/{other_user.id}/toggle-admin/')

        assert response.status_code == 403

    def test_toggle_admin_self(self, authenticated_client, user_password):
        """PUT /api/users/{id}/toggle-admin/ - изменение своих прав"""
        client, user = authenticated_client

        response = client.put(f'/api/users/{user.id}/toggle-admin/')

        assert response.status_code == 400
        assert 'error' in response.data
