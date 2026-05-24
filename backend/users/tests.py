from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient


User = get_user_model()


class UserAPITests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.admin = User.objects.create_user(
            username="adminuser",
            first_name="Admin",
            last_name="Админ",
            email="admin@test.com",
            password="SuperPass123!",
        )
        cls.admin.is_admin = True
        cls.admin.save()

        cls.user = User.objects.create_user(
            username="testuser",
            first_name="Test",
            last_name="User",
            email="user@test.com",
            password="SuperPass123!",
        )

        cls.urls = {
            'register': reverse('register'),
            'login': reverse('login'),
            'me': reverse('user-me'),
            'all_users': reverse('user-list-all'),
        }

    def setUp(self):
        self.client = APIClient()

    REGISTER_TEST_CASES = [
        {
            'name': 'valid_registration',
            'data': {
                'username': 'newuser',
                'first_name': 'New',
                'last_name': 'User',
                'email': 'newuser@test.com',
                'password': 'SuperPass123!',
            },
            'expected_status': status.HTTP_201_CREATED,
            'expected_fields': ['user', 'access', 'refresh'],
            'assertions': lambda resp: resp['user']['username'] == 'newuser'
        },
        {
            'name': 'short_username',
            'data': {
                'name': 'ab',
                'first_name': 'New',
                'last_name': 'User',
                'email': 'valid@test.com',
                'password': 'SuperPass123!',
            },
            'expected_status': status.HTTP_400_BAD_REQUEST,
            'expected_fields': ['username']
        },
        {
            'name': 'invalid_email',
            'data': {
                'username': 'validuser',
                'first_name': 'New',
                'last_name': 'User',
                'email': 'invalid.com',
                'password': 'SuperPass123!',
            },
            'expected_status': status.HTTP_400_BAD_REQUEST,
            'expected_fields': ['email']
        },
        {
            'name': 'invalid_password',
            'data': {
                'first_name': 'New',
                'last_name': 'User',
                'email': 'newuser@test.com',
                'password': 'SuperPass123',
            },
            'expected_status': status.HTTP_400_BAD_REQUEST,
            'expected_fields': ['password']
        }
    ]

    LOGIN_TEST_CASES = [
        {
            'name': 'valid_credentials',
            'data': {'username': 'testuser', 'password': 'SecurePass123!'},
            'expected_status': status.HTTP_200_OK,
            'expected_fields': ['user', 'access', 'refresh']
        },
        {
            'name': 'invalid_password',
            'data': {'username': 'testuser', 'password': 'wrong'},
            'expected_status': status.HTTP_401_UNAUTHORIZED
        },
        {
            'name': 'nonexistent_user',
            'data': {'username': 'unknown', 'password': 'any'},
            'expected_status': status.HTTP_401_UNAUTHORIZED
        }
    ]

    PROFILE_ACCESS_CASES = [
        {
            'name': 'authenticated_user_profile',
            'url': 'me',
            'auth_user': 'testuser',
            'expected_status': status.HTTP_200_OK,
            'expected_fields': ['username', 'email']
        },
        {
            'name': 'unauthenticated_profile',
            'url': 'me',
            'auth_user': None,
            'expected_status': status.HTTP_401_UNAUTHORIZED
        },
        {
            'name': 'admin_list_users',
            'url': 'all_users',
            'auth_user': 'adminuser',
            'expected_status': status.HTTP_200_OK,
            'expected_fields': []
        },
        {
            'name': 'user_list_users',
            'url': 'all_users',
            'auth_user': 'testuser',
            'expected_status': status.HTTP_403_FORBIDDEN,
            'expected_fields': ['error']
        }
    ]
    USER_MANAGEMENT_CASES = [
        # Удаление пользователей
        {
            'name': 'admin_delete_user',
            'action': 'delete_user',
            'method': 'delete',
            'auth_user': 'adminuser',
            'target_user': 'testuser',
            'expected_status': status.HTTP_204_NO_CONTENT
        },
        {
            'name': 'admin_delete_self',
            'action': 'delete_user',
            'method': 'delete',
            'auth_user': 'adminuser',
            'target_user': 'adminuser',
            'expected_status': status.HTTP_400_BAD_REQUEST
        },
        {
            'name': 'user_delete_admin',
            'action': 'delete_user',
            'method': 'delete',
            'auth_user': 'testuser',
            'target_user': 'adminuser',
            'expected_status': status.HTTP_403_FORBIDDEN
        },
        # Назначение администратора
        {
            'name': 'admin_toggle_admin',
            'action': 'toggle_admin',
            'method': 'patch',
            'auth_user': 'adminuser',
            'target_user': 'testuser',
            'expected_status': status.HTTP_200_OK
        },
        {
            'name': 'admin_toggle_self',
            'action': 'toggle_admin',
            'method': 'patch',
            'auth_user': 'adminuser',
            'target_user': 'adminuser',
            'expected_status': status.HTTP_400_BAD_REQUEST
        },
        {
            'name': 'user_toggle_user',
            'action': 'toggle_admin',
            'method': 'patch',
            'auth_user': 'testuser',
            'target_user': 'testuser',
            'expected_status': status.HTTP_403_FORBIDDEN
        }
    ]

    def _get_user(self, username):
        """Получить пользователя по имени"""
        return getattr(self, username) if username else None

    def _make_request(self, method, url, data=None, auth_user=None):
        """Выполнить запрос"""
        if auth_user:
            self.client.force_authenticate(user=auth_user)

        request_method = getattr(self.client, method)
        return request_method(url, data=data, format='json') if data else request_method(url, format='json')

    def _assert_response(self, resp, expected_status, expected_fields=None):
        self.assertEqual(resp.status_code, expected_status,
                         f'Ожидался статус {expected_status}, получен {resp.status_code}')

        if expected_fields:
            for field in expected_fields:
                self.assertIn(field, resp.data, f'{field} отсутствует в ответе')

    # ТЕСТЫ

    def test_register_cases(self):
        """Тесты регистрации"""
        for case in self.REGISTER_TEST_CASES:
            with self.subTest(case['name']):
                response = self._make_request('post', self.urls['register'], data=case['data'])
                self._assert_response(response, case['expected_status'], case['expected_fields'])

            if 'assertions' in case:
                self.assertTrue(case['assertions'](response.data))

    def test_login_cases(self):
        """Тесты входа в систему"""
        for case in self.LOGIN_TEST_CASES:
            with self.subTest(case['name']):
                response = self._make_request('post', self.urls['login'], case['data'])
                self._assert_response(response, case['expected_status'], case.get('expected_fields'))

    def test_profile_access_cases(self):
        """Тесты доступа к профилю"""
        for case in self.PROFILE_ACCESS_CASES:
            with self.subTest(case['name']):
                url = self.urls[case['url']]
                auth_user = self._get_user(case['auth_user'])
                response = self._make_request('get', url, auth_user=auth_user)
                self._assert_response(response, case['expected_status'], case.get('expected_fields'))

    def test_user_management_cases(self) -> None:
        """Тесты управления пользователями"""
        for case in self.USER_MANAGEMENT_CASES:
            with self.subTest(case['name']):
                auth_user = self._get_user(case['auth_user'])
                target_user = self._get_user(case['target_user'])

                url = reverse(f'user-{case["action"]}', kwargs={'pk': target_user.pk})
                response = self._make_request(case['method'], url, auth_user=auth_user)
                self._assert_response(response, case['expected_status'])

                if (case['action'] == 'toggle_admin' and
                        case['expected_status'] == status.HTTP_200_OK):
                    target_user.refresh_from_db()
                    self.assertNotEqual(target_user.is_admin,
                                        User.objects.get(pk=target_user.pk).is_admin)
