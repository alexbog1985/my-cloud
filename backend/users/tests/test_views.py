from django.test import TestCase
from django.contrib.auth import get_user_model

from users.serializers import UserSerializer, RegisterSerializer, LoginSerializer

User = get_user_model()


class UserViewSetTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='TestPass123!',
            first_name='TestFirstName',
            last_name='TestLastName',
        )
        self.admin_user = User.objects.create_user(
            username='adminuser',
            email='admin@test.com',
            password='AdminPass123!',
            first_name='AdminFirstName',
            last_name='AdminLastName',
            is_admin=True,
        )

    def authenticate(self, username, password):
        """Получение JWT-токена для аутентификации"""
        response = self.client.post('/api/login/', {
            'username': username,
            'password': password,
        })
        return response.data['access']

    def test_get_current_user_authenticated(self):
        """Тест получения данных текущего пользователя при аутентификации"""
        token = self.authenticate('testuser', 'TestPass123!')
        response = self.client.get('/api/users/me/', HTTP_AUTHORIZATION=f'Bearer {token}')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['username'], 'testuser')
        self.assertEqual(response.data['email'], 'test@test.com')

    def test_get_current_user_unauthenticated(self):
        """Тест получения данных текущего пользователя без аутентификации"""
        response = self.client.get('/api/users/me/')
        self.assertEqual(response.status_code, 401)

    def test_list_all_users_admin(self):
        """Тест получения списка всех пользователей администратором"""
        token = self.authenticate('adminuser', 'AdminPass123!')
        response = self.client.get('/api/users/all/', HTTP_AUTHORIZATION=f'Bearer {token}')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)

    def test_list_all_users_non_admin(self):
        """Тест получения списка всех пользователей обычным пользователем"""
        token = self.authenticate('testuser', 'TestPass123!')
        response = self.client.get('/api/users/all/', HTTP_AUTHORIZATION=f'Bearer {token}')
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.data['error'], 'Недостаточно прав')

    def test_list_all_users_unauthenticated(self):
        """Тест получения списка всех пользователей без аутентификации"""
        response = self.client.get('/api/users/all/')
        self.assertEqual(response.status_code, 401)

    def test_delete_user_admin(self):
        """Тест удаления пользователя администратором"""
        token = self.authenticate('adminuser', 'AdminPass123!')
        response = self.client.delete(f'/api/users/{self.user.id}/delete/', HTTP_AUTHORIZATION=f'Bearer {token}')
        self.assertEqual(response.status_code, 204)
        self.assertFalse(User.objects.filter(id=self.user.id).exists())

    def test_delete_user_non_admin(self):
        """Тест удаления пользователя обычным пользователем"""
        token = self.authenticate('testuser', 'TestPass123!')
        response = self.client.delete(f'/api/users/{self.admin_user.id}/delete/', HTTP_AUTHORIZATION=f'Bearer {token}')
        self.assertEqual(response.status_code, 403)
        self.assertTrue(User.objects.filter(id=self.admin_user.id).exists())

    def test_delete_user_self(self):
        """Тест удаления самого себя"""
        token = self.authenticate('adminuser', 'AdminPass123!')
        response = self.client.delete(f'/api/users/{self.admin_user.id}/delete/', HTTP_AUTHORIZATION=f'Bearer {token}')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['error'], 'Нельзя удалить самого себя')
        self.assertTrue(User.objects.filter(id=self.admin_user.id).exists())

    def test_delete_user_not_found(self):
        """Тест удаления несуществующего пользователя"""
        token = self.authenticate('adminuser', 'AdminPass123!')
        response = self.client.delete('/api/users/9999/delete/', HTTP_AUTHORIZATION=f'Bearer {token}')
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data['error'], 'Пользователь не найден')

    def test_toggle_admin_admin(self):
        """Тест переключения флага администратора администратором"""
        token = self.authenticate('adminuser', 'AdminPass123!')
        response = self.client.put(f'/api/users/{self.user.id}/toggle-admin/', HTTP_AUTHORIZATION=f'Bearer {token}')
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_admin)

    def test_toggle_admin_non_admin(self):
        """Тест переключения флага администратора обычным пользователем"""
        regular_user = User.objects.create_user(
            username='regularuser2',
            email='regular2@test.com',
            password='RegularPass123!',
            first_name='Regular2FirstName',
            last_name='Regular2LastName',
        )
        token = self.authenticate('regularuser2', 'RegularPass123!')
        response = self.client.put(f'/api/users/{self.admin_user.id}/toggle-admin/', HTTP_AUTHORIZATION=f'Bearer {token}')
        self.assertEqual(response.status_code, 403)
        self.admin_user.refresh_from_db()
        self.assertTrue(self.admin_user.is_admin)

    def test_toggle_admin_self(self):
        """Тест переключения флага администратора для самого себя"""
        token = self.authenticate('adminuser', 'AdminPass123!')
        response = self.client.put(f'/api/users/{self.admin_user.id}/toggle-admin/', HTTP_AUTHORIZATION=f'Bearer {token}')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['error'], 'Недостаточно прав')
        self.admin_user.refresh_from_db()
        self.assertTrue(self.admin_user.is_admin)

    def test_toggle_admin_user_not_found(self):
        """Тест переключения флага администратора для несуществующего пользователя"""
        token = self.authenticate('adminuser', 'AdminPass123!')
        response = self.client.put('/api/users/9999/toggle-admin/', HTTP_AUTHORIZATION=f'Bearer {token}')
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data['error'], 'Пользователь не найден')
