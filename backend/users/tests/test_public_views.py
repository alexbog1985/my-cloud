from django.test import TestCase
from django.contrib.auth import get_user_model
from files.tests.base_test import BaseTestCase

User = get_user_model()


class PublicViewsTest(BaseTestCase):
    def setUp(self):
        super().setUp()

    def test_register_view_post_valid(self):
        """Тест регистрации пользователя с валидными данными"""
        user_data = {
            "username": "newuser",
            "first_name": "NewFirstName",
            "last_name": "NewLastName",
            "email": "new@test.com",
            "password": "NewPass123!",
        }
        response = self.client.post("/api/register/", user_data)
        self.assertEqual(response.status_code, 201)
        self.assertIn("user", response.data)
        self.assertIn("refresh", response.data)
        self.assertIn("access", response.data)

    def test_register_view_post_invalid_username(self):
        """Тест регистрации пользователя с невалидным логином"""
        user_data = {
            "username": "ab",
            "first_name": "NewFirstName",
            "last_name": "NewLastName",
            "email": "new@test.com",
            "password": "NewPass123!",
        }
        response = self.client.post("/api/register/", user_data)
        self.assertEqual(response.status_code, 400)
        self.assertIn("username", response.data)

    def test_register_view_post_duplicate_username(self):
        """Тест регистрации пользователя с дублирующимся логином"""
        User.objects.create_user(
            username="existinguser",
            email="existing@test.com",
            password="ExistingPass123!",
            first_name="ExistingFirstName",
            last_name="ExistingLastName",
        )
        user_data = {
            "username": "existinguser",
            "first_name": "NewFirstName",
            "last_name": "NewLastName",
            "email": "new@test.com",
            "password": "NewPass123!",
        }
        response = self.client.post("/api/register/", user_data)
        self.assertEqual(response.status_code, 400)
        self.assertIn("username", response.data)

    def test_register_view_post_invalid_password(self):
        """Тест регистрации пользователя с невалидным паролем"""
        user_data = {
            "username": "newuser",
            "first_name": "NewFirstName",
            "last_name": "NewLastName",
            "email": "new@test.com",
            "password": "weakpassword",
        }
        response = self.client.post("/api/register/", user_data)
        self.assertEqual(response.status_code, 400)
        self.assertIn("password", response.data)

    def test_register_view_post_invalid_email(self):
        """Тест регистрации пользователя с невалидным email"""
        user_data = {
            "username": "newuser",
            "first_name": "NewFirstName",
            "last_name": "NewLastName",
            "email": "invalid-email",
            "password": "NewPass123!",
        }
        response = self.client.post("/api/register/", user_data)
        self.assertEqual(response.status_code, 400)
        self.assertIn("email", response.data)

    def test_login_view_post_valid(self):
        """Тест аутентификации пользователя с валидными данными"""
        User.objects.create_user(
            username="testuser",
            email="test@test.com",
            password="TestPass123!",
            first_name="TestFirstName",
            last_name="TestLastName",
        )
        login_data = {
            "username": "testuser",
            "password": "TestPass123!",
        }
        response = self.client.post("/api/login/", login_data)
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_view_post_invalid_password(self):
        """Тест аутентификации пользователя с неверным паролем"""
        User.objects.create_user(
            username="testuser",
            email="test@test.com",
            password="TestPass123!",
            first_name="TestFirstName",
            last_name="TestLastName",
        )
        login_data = {
            "username": "testuser",
            "password": "WrongPass123!",
        }
        response = self.client.post("/api/login/", login_data)
        self.assertEqual(response.status_code, 401)

    def test_login_view_post_invalid_username(self):
        """Тест аутентификации пользователя с несуществующим логином"""
        login_data = {
            "username": "nonexistent",
            "password": "TestPass123!",
        }
        response = self.client.post("/api/login/", login_data)
        self.assertEqual(response.status_code, 401)
