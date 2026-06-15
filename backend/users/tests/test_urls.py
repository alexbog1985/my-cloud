"""Тесты URL маршрутов для модуля users

Тестируемые endpoints:
- POST /api/register/ - регистрация пользователя
- POST /api/login/ - аутентификация
- GET /api/users/ - список пользователей (ReadOnlyModelViewSet)
- GET /api/users/{id}/ - DetailView (ReadOnlyModelViewSet)
- GET /api/users/me/ - данные текущего пользователя
- GET /api/users/all/ - список всех пользователей (админ)
- DELETE /api/users/{id}/delete/ - удаление пользователя (админ)
- PUT /api/users/{id}/toggle-admin/ - переключение прав администратора

Использует fixtures из conftest.py
"""
import pytest
from django.urls import reverse, resolve


# ============ Тесты URL маршрутов ============

class TestUserUrls:
    """Тесты URL маршрутов для пользователей"""

    def test_users_router_url(self):
        """GET /api/users/ - список пользователей (ReadOnlyModelViewSet)"""
        assert reverse('user-list') == '/api/users/'
        assert resolve('/api/users/').view_name == 'user-list'

    def test_users_detail_url(self):
        """GET /api/users/{id}/ - DetailView (ReadOnlyModelViewSet)"""
        assert reverse('user-detail', kwargs={'pk': 1}) == '/api/users/1/'
        assert resolve('/api/users/1/').view_name == 'user-detail'

    def test_register_url(self):
        """POST /api/register/ - регистрация пользователя"""
        assert reverse('register') == '/api/register/'
        assert resolve('/api/register/').view_name == 'register'

    def test_login_url(self):
        """POST /api/login/ - аутентификация"""
        assert reverse('login') == '/api/login/'
        assert resolve('/api/login/').view_name == 'login'

    def test_me_url(self):
        """GET /api/users/me/ - данные текущего пользователя"""
        assert reverse('user-me') == '/api/users/me/'
        assert resolve('/api/users/me/').view_name == 'user-me'

    def test_all_url(self):
        """GET /api/users/all/ - список всех пользователей (админ)"""
        assert reverse('user-list-all') == '/api/users/all/'
        assert resolve('/api/users/all/').view_name == 'user-list-all'

    def test_delete_url(self):
        """DELETE /api/users/{id}/delete/ - удаление пользователя (админ)"""
        assert reverse('user-delete-user', kwargs={'pk': 1}) == '/api/users/1/delete/'
        assert resolve('/api/users/1/delete/').view_name == 'user-delete-user'

    def test_toggle_admin_url(self):
        """PUT /api/users/{id}/toggle-admin/ - переключение прав администратора"""
        assert reverse('user-toggle-admin', kwargs={'pk': 1}) == '/api/users/1/toggle-admin/'
        assert resolve('/api/users/1/toggle-admin/').view_name == 'user-toggle-admin'


# ============ Тесты URL реверсов с authenticated client ============

@pytest.mark.django_db
class TestUserUrlAccess:
    """Тесты доступа к URL с аутентификацией"""

    def test_register_url_accessible(self, api_client):
        """POST /api/register/ - доступен без аутентификации"""
        url = reverse('register')
        response = api_client.post(url, {}, format='json')

        # Должен вернуть 400 (ошибка валидации), а не 404 или 401
        assert response.status_code in [400, 201]

    def test_login_url_accessible(self, api_client):
        """POST /api/login/ - доступен без аутентификации"""
        url = reverse('login')
        response = api_client.post(url, {}, format='json')

        # Должен вернуть 400 (ошибка валидации) или 401 (неверные данные)
        assert response.status_code in [400, 401]

    def test_users_list_url_accessible(self, authenticated_client, user_password):
        """GET /api/users/ - доступен с аутентификацией"""
        client, user = authenticated_client
        url = reverse('user-list')
        response = client.get(url)

        # Должен вернуть 200 (ReadOnlyModelViewSet разрешаетGET)
        assert response.status_code == 200

    def test_users_detail_url_accessible(self, authenticated_client, user_password):
        """GET /api/users/{id}/ - доступен с аутентификацией"""
        client, user = authenticated_client
        url = reverse('user-detail', kwargs={'pk': user.id})
        response = client.get(url)

        # Должен вернуть 200
        assert response.status_code == 200
        assert response.data['username'] == user.username

    def test_me_url_accessible(self, authenticated_client, user_password):
        """GET /api/users/me/ - доступен с аутентификацией"""
        client, user = authenticated_client
        url = reverse('user-me')
        response = client.get(url)

        assert response.status_code == 200
        assert response.data['username'] == user.username

    def test_all_url_accessible(self, authenticated_admin_client, admin_password):
        """GET /api/users/all/ - доступен с аутентификацией администратора"""
        client, admin = authenticated_admin_client
        url = reverse('user-list-all')
        response = client.get(url)

        assert response.status_code == 200
        assert len(response.data) >= 1  # Хотя бы админ есть
