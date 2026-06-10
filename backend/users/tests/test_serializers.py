from django.test import TestCase
from django.contrib.auth import get_user_model
from files.tests.base_test import BaseTestCase

from users.serializers import UserSerializer, RegisterSerializer, LoginSerializer

User = get_user_model()


class UserSerializerTest(BaseTestCase):
    def setUp(self):
        super().setUp()
        self.user_data = {
            "username": "testuser",
            "first_name": "TestFirstName",
            "last_name": "TestLastName",
            "email": "test@test.com",
            "password": "TestPass123!",
        }

    def test_user_serializer_fields(self):
        """Тест полей UserSerializer"""
        user = User.objects.create_user(**self.user_data)
        serializer = UserSerializer(user)

        self.assertIn("id", serializer.data)
        self.assertIn("username", serializer.data)
        self.assertIn("full_name", serializer.data)
        self.assertIn("email", serializer.data)
        self.assertIn("is_admin", serializer.data)
        self.assertIn("storage_path", serializer.data)
        self.assertIn("date_joined", serializer.data)
        self.assertIn("file_count", serializer.data)
        self.assertIn("storage_size", serializer.data)

    def test_user_serializer_full_name(self):
        """Тест вычисления полного имени в UserSerializer"""
        user = User.objects.create_user(**self.user_data)
        serializer = UserSerializer(user)

        self.assertEqual(serializer.data["full_name"], "TestFirstName TestLastName")

    def test_user_serializer_file_count_zero(self):
        """Тест подсчета количества файлов у пользователя (без файлов)"""
        user = User.objects.create_user(**self.user_data)
        serializer = UserSerializer(user)

        self.assertEqual(serializer.data["file_count"], 0)

    def test_user_serializer_storage_size_zero(self):
        """Тест подсчета размера хранилища у пользователя (без файлов)"""
        user = User.objects.create_user(**self.user_data)
        serializer = UserSerializer(user)

        self.assertEqual(serializer.data["storage_size"], 0)


class RegisterSerializerTest(TestCase):
    def test_register_serializer_valid(self):
        """Тест валидного RegisterSerializer"""
        user_data = {
            "username": "newuser",
            "first_name": "NewFirstName",
            "last_name": "NewLastName",
            "email": "new@test.com",
            "password": "NewPass123!",
        }
        serializer = RegisterSerializer(data=user_data)
        self.assertTrue(serializer.is_valid())

    def test_register_serializer_invalid_username(self):
        """Тест RegisterSerializer с невалидным логином"""
        user_data = {
            "username": "ab",
            "first_name": "NewFirstName",
            "last_name": "NewLastName",
            "email": "new@test.com",
            "password": "NewPass123!",
        }
        serializer = RegisterSerializer(data=user_data)
        self.assertFalse(serializer.is_valid())

    def test_register_serializer_duplicate_username(self):
        """Тест RegisterSerializer с дублирующимся логином"""
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
        serializer = RegisterSerializer(data=user_data)
        self.assertFalse(serializer.is_valid())

    def test_register_serializer_invalid_password(self):
        """Тест RegisterSerializer с невалидным паролем"""
        user_data = {
            "username": "newuser",
            "first_name": "NewFirstName",
            "last_name": "NewLastName",
            "email": "new@test.com",
            "password": "weakpassword",
        }
        serializer = RegisterSerializer(data=user_data)
        self.assertFalse(serializer.is_valid())

    def test_register_serializer_create(self):
        """Тест создания пользователя через RegisterSerializer"""
        user_data = {
            "username": "newuser",
            "first_name": "NewFirstName",
            "last_name": "NewLastName",
            "email": "new@test.com",
            "password": "NewPass123!",
        }
        serializer = RegisterSerializer(data=user_data)
        serializer.is_valid()
        result = serializer.save()

        self.assertIn("user", result)
        self.assertIn("refresh", result)
        self.assertIn("access", result)
        self.assertEqual(result["user"]["username"], "newuser")
        self.assertEqual(result["user"]["email"], "new@test.com")
        self.assertFalse(result["user"]["is_admin"])


class LoginSerializerTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="test@test.com",
            password="TestPass123!",
            first_name="TestFirstName",
            last_name="TestLastName",
        )

    def test_login_serializer_valid(self):
        """Тест валидного LoginSerializer"""
        login_data = {
            "username": "testuser",
            "password": "TestPass123!",
        }
        serializer = LoginSerializer(data=login_data, context={"request": None})

        self.assertTrue(serializer.initial_data.get("username") == "testuser")
        self.assertTrue(serializer.initial_data.get("password") == "TestPass123!")

    def test_login_serializer_token_generation(self):
        """Тест генерации токенов в LoginSerializer"""
        login_data = {
            "username": "testuser",
            "password": "TestPass123!",
        }
        serializer = LoginSerializer(data=login_data, context={"request": None})
        serializer.is_valid()
        result = serializer.validate(login_data)

        self.assertIn("access", result)
        self.assertIn("refresh", result)
        self.assertIn("user", result)
        self.assertEqual(result["user"]["username"], "testuser")
