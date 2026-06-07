from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework import serializers

from users.validators import validate_username

User = get_user_model()


class ValidatorsTest(TestCase):
    def test_validate_username_valid(self):
        """Тест валидации валидного логина"""
        valid_usernames = [
            'testuser',
            'user123',
            'AdminUser',
            'User1Test2',
        ]
        for username in valid_usernames:
            try:
                validate_username(username)
            except serializers.ValidationError:
                self.fail(f"validate_username() raised ValidationError unexpectedly for '{username}'")

    def test_validate_username_too_short(self):
        """Тест валидации короткого логина"""
        with self.assertRaises(serializers.ValidationError):
            validate_username('abc')

    def test_validate_username_too_long(self):
        """Тест валидации длинного логина"""
        with self.assertRaises(serializers.ValidationError):
            validate_username('a' * 21)

    def test_validate_username_starts_with_number(self):
        """Тест валидации логина, начинающегося с цифры"""
        with self.assertRaises(serializers.ValidationError):
            validate_username('123user')

    def test_validate_username_invalid_characters(self):
        """Тест валидации логина с недопустимыми символами"""
        invalid_usernames = [
            'user_name',
            'user-name',
            'user.name',
            'user name',
            'user@name',
        ]
        for username in invalid_usernames:
            with self.assertRaises(serializers.ValidationError):
                validate_username(username)

    def test_validate_username_duplicate(self):
        """Тест валидации дублирующегося логина"""
        User.objects.create_user(
            username='existinguser',
            email='existing@test.com',
            password='ExistingPass123!',
            first_name='ExistingFirstName',
            last_name='ExistingLastName',
        )
        with self.assertRaises(serializers.ValidationError) as context:
            validate_username('existinguser')
        self.assertIn('уже существует', str(context.exception))

    def test_validate_username_minimum_length(self):
        """Тест валидации минимальной длины логина (4 символа)"""
        try:
            validate_username('abcd')
        except serializers.ValidationError:
            self.fail("validate_username() raised ValidationError unexpectedly for 4-character username")

    def test_validate_username_maximum_length(self):
        """Тест валидации максимальной длины логина (20 символов)"""
        try:
            validate_username('a' * 20)
        except serializers.ValidationError:
            self.fail("validate_username() raised ValidationError unexpectedly for 20-character username")

    def test_validate_username_special_char_at_end(self):
        """Тест валидации логина со спецсимволом в конце"""
        with self.assertRaises(serializers.ValidationError):
            validate_username('user123!')

    def test_validate_username_underscore_in_middle(self):
        """Тест валидации логина с подчеркиванием в середине"""
        with self.assertRaises(serializers.ValidationError):
            validate_username('user_name')
