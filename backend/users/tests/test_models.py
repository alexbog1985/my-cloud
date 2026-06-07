from django.test import TestCase
from django.contrib.auth import get_user_model
from files.tests.base_test import BaseTestCase

User = get_user_model()


class UserModelTest(BaseTestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='TestPass123!',
            first_name='TestFirstName',
            last_name='TestLastName',
        )

    def test_create_user(self):
        """Тест создания пользователя"""
        self.assertEqual(self.user.username, 'testuser')
        self.assertEqual(self.user.email, 'test@test.com')
        self.assertEqual(self.user.first_name, 'TestFirstName')
        self.assertEqual(self.user.last_name, 'TestLastName')
        self.assertTrue(self.user.check_password('TestPass123!'))
        self.assertFalse(self.user.is_admin)

    def test_user_string_representation(self):
        """Тест строкового представления пользователя"""
        expected_str = f"{self.user.username} ({self.user.get_full_name()})"
        self.assertEqual(str(self.user), expected_str)

    def test_storage_path_generation(self):
        """Тест автоматической генерации пути к хранилищу"""
        self.assertEqual(self.user.storage_path, f"storage/{self.user.username}")

    def test_user_full_name(self):
        """Тест получения полного имени"""
        self.assertEqual(self.user.get_full_name(), 'TestFirstName TestLastName')

    def test_user_with_admin_flag(self):
        """Тест создания пользователя с флагом администратора"""
        admin_user = User.objects.create_user(
            username='adminuser',
            email='admin@test.com',
            password='AdminPass123!',
            first_name='AdminFirstName',
            last_name='AdminLastName',
            is_admin=True,
        )
        self.assertTrue(admin_user.is_admin)

    def test_user_unique_username(self):
        """Тест уникальности логина пользователя"""
        with self.assertRaises(Exception):
            User.objects.create_user(
                username='testuser',
                email='another@test.com',
                password='TestPass123!',
                first_name='Another',
                last_name='User',
            )

    def test_user_unique_email(self):
        """Тест уникальности email пользователя"""
        with self.assertRaises(Exception):
            User.objects.create_user(
                username='anotheruser',
                email='test@test.com',
                password='TestPass123!',
                first_name='Another',
                last_name='User',
            )

    def test_required_fields(self):
        """Тест обязательных полей пользователя"""
        with self.assertRaises(ValueError):
            User.objects.create_user(
                username='',
                email='',
                password='TestPass123!',
            )

    def test_superuser_creation(self):
        """Тест создания суперпользователя"""
        superuser = User.objects.create_superuser(
            username='superuser',
            email='super@test.com',
            password='SuperPass123!',
            first_name='SuperFirstName',
            last_name='SuperLastName',
        )
        self.assertTrue(superuser.is_staff)
        self.assertTrue(superuser.is_superuser)
