"""Тесты модели User для модуля users

Тестируемые методы модели:
- save() - автогенерация storage_path
- get_full_name() - полное имя (составное)
- __str__() - строковое представление
"""
import pytest

from users.factories import UserFactory
from users.models import User


@pytest.mark.django_db
class TestUserModel:
    """
    Тесты модели User

    Тестирует:
    - Автогенерацию storage_path при сохранении нового пользователя
    - Сохранение существующего storage_path при повторном сохранении
    - Правильность метода get_full_name()
    - Строковое представление пользователя
    """

    def test_save_autogenerates_storage_path(self):
        """
        Тест автогенерации storage_path при создании пользователя

        Ожидание: при создании нового пользователя без явно указанного
        storage_path, он будет автоматически сгенерирован по шаблону
        'storage/{username}'
        """
        user = UserFactory.create()

        expected_path = f'storage/{user.username}'
        assert user.storage_path == expected_path

    def test_save_preserves_storage_path(self):
        """
        Тест сохранения существующего storage_path

        Ожидание: при создании пользователя с явно указанным storage_path,
        он не будет перезаписан
        """
        custom_path = 'custom/storage/path'
        user = UserFactory.create(storage_path=custom_path)

        assert user.storage_path == custom_path

    def test_get_full_name(self):
        """
        Тест метода get_full_name()

        Ожидание: метод возвращает строку 'имя фамилия'
        """
        user = UserFactory.create(first_name='John', last_name='Doe')

        expected_full_name = 'John Doe'
        assert user.get_full_name() == expected_full_name

    def test_str_representation(self):
        """
        Тест строкового представления пользователя

        Ожидание: __str__() возвращает строку в формате
        'username (полное имя)'
        """
        user = UserFactory.create(username='testuser', first_name='Test', last_name='User')

        expected_str = 'testuser (Test User)'
        assert str(user) == expected_str

    def test_user_str_format(self):
        """
        Тест формата строкового представления

        Ожидание: формат строки соответствует ожидаемому шаблону
        """
        user = UserFactory.create(username='alex123', first_name='Alex', last_name='Smith')

        result = str(user)
        assert result.startswith(user.username)
        assert '(' in result
        assert ')' in result

    def test_storage_path_is_unique(self):
        """
        Тест уникальности storage_path

        Ожидание: storage_path должен быть уникальным для каждого пользователя
        """
        user1 = UserFactory.create(username='user1')
        user2 = UserFactory.create(username='user2')

        assert user1.storage_path != user2.storage_path

    def test_is_admin_default_false(self):
        """
        Тест значения is_admin по умолчанию

        Ожидание: по умолчанию is_admin = False
        """
        user = UserFactory.create()

        assert user.is_admin is False

    def test_is_admin_admin_factory(self):
        """
        Тест значения is_admin для администратора

        Ожидание: AdminUserFactory создает пользователя с is_admin = True
        """
        from users.factories import AdminUserFactory

        admin = AdminUserFactory.create()

        assert admin.is_admin is True

    def test_user_with_admin_flag(self):
        """
        Тест ручного установки флага администратора

        Ожидание: можно изменить is_admin на True
        """
        user = UserFactory.create(is_admin=True)

        assert user.is_admin is True

    def test_user_required_fields(self):
        """
        Тест обязательных полей пользователя

        Ожидание: EMAIL_FIELD и REQUIRED_FIELDS настроены правильно
        """
        user = UserFactory.build()

        # Проверяем, что email - это EMAIL_FIELD
        assert user.EMAIL_FIELD == 'email'

        # Проверяем, что REQUIRED_FIELDS содержит необходимые поля
        assert 'email' in User.REQUIRED_FIELDS
        assert 'first_name' in User.REQUIRED_FIELDS
        assert 'last_name' in User.REQUIRED_FIELDS
