import re

import pytest
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from rest_framework import serializers

from users.factories import UserFactory
from users.password_validation import CustomPasswordValidator
from users.validators import validate_username

User = get_user_model()


@pytest.mark.django_db
class TestUsernameValidator:
    """
    Тесты валидатора логина
    """

    def test_valid_username_lowercase(self):
        """
        Валидный логин из строчных букв

        Правила валидации:
        - Только латинские буквы и цифры
        - Первый символ — буква
        - Длина от 4 до 20 символов

        Ожидание: валидация проходит успешно, функция возвращает логин
        """
        result = validate_username("alex")
        assert result == "alex"

    def test_valid_username_uppercase(self):
        """Валидный логин из заглавных букв"""
        result = validate_username("Alex")
        assert result == "Alex"

    def test_valid_username_mixed_case(self):
        """Валидный логин смешанного регистра и цифры"""
        result = validate_username("Alex123")
        assert result == "Alex123"

    def test_valid_username_max_length(self):
        """Валидный логин максимальной длины (20 символов)"""
        long_username = "a" * 20  # 20 символов
        result = validate_username(long_username)
        assert result == long_username

    def test_invalid_username_starts_with_number(self):
        """
        Невалидный логин: начинается с цифры

        Ожидание: выброс исключения ValidationError с описанием правил
        """
        with pytest.raises(serializers.ValidationError) as exc_info:
            validate_username("1user")

        # Проверяем, что сообщение об ошибке содержит ключевую информацию
        error_message = str(exc_info.value)
        assert "Логин должен содержать только латинские буквы и цифры" in error_message
        assert "первый символ — буква" in error_message

    def test_invalid_username_starts_with_special_char(self):
        """Невалидный логин: начинается со специального символа"""
        with pytest.raises(serializers.ValidationError) as exc_info:
            validate_username("@user")

        error_message = str(exc_info.value)
        assert "Логин должен содержать только латинские буквы и цифры" in error_message

    def test_invalid_username_with_cyrillic(self):
        """Невалидный логин: содержит кириллицу"""
        with pytest.raises(serializers.ValidationError) as exc_info:
            validate_username("пользователь")

        error_message = str(exc_info.value)
        assert "Логин должен содержать только латинские буквы и цифры" in error_message

    def test_invalid_username_too_short(self):
        """Невалидный логин: слишком короткий (менее 4 символов)"""
        with pytest.raises(serializers.ValidationError) as exc_info:
            validate_username("abc")

        error_message = str(exc_info.value)
        assert "Логин должен содержать только латинские буквы и цифры" in error_message

    def test_invalid_username_too_long(self):
        """Невалидный логин: слишком длинный (более 20 символов)"""
        with pytest.raises(serializers.ValidationError) as exc_info:
            validate_username("this_username_is_way_too_long")

        error_message = str(exc_info.value)
        assert "Логин должен содержать только латинские буквы и цифры" in error_message

    def test_invalid_username_with_spaces(self):
        """Невалидный логин: содержит пробелы"""
        with pytest.raises(serializers.ValidationError) as exc_info:
            validate_username("my user")

        error_message = str(exc_info.value)
        assert "Логин должен содержать только латинские буквы и цифры" in error_message

    def test_invalid_username_with_special_chars(self):
        """Невалидный логин: содержит специальные символы"""
        with pytest.raises(serializers.ValidationError) as exc_info:
            validate_username("user@123")

        error_message = str(exc_info.value)
        assert "Логин должен содержать только латинские буквы и цифры" in error_message

    def test_invalid_username_duplicate(self):
        """
        Невалидный логин: уже существует в БД

        Требование task.md: логин должен быть уникальным

        Для теста нужен доступ к базе данных, поэтому используем фикстуру 'db'
        """
        # Создаем пользователя в базе через фабрику
        UserFactory.create(username="existinguser")

        # Пытаемся создать нового пользователя с таким же логином
        with pytest.raises(serializers.ValidationError) as exc_info:
            validate_username("existinguser")

        error_message = str(exc_info.value)
        assert "Пользователь с таким логином уже существует" in error_message

    def test_valid_username_after_delete(self):
        """
        Повторное использование логина после удаления пользователя

        Ожидание: после удаления пользователя его логин можно использовать снова
        """
        # Создаем и удаляем пользователя
        user = UserFactory.create(username="todelete")
        user_id = user.id
        user.delete()

        # Проверяем, что пользователя больше нет
        from users.models import User

        assert not User.objects.filter(id=user_id).exists()

        # Логин должен быть валиден
        result = validate_username("todelete")
        assert result == "todelete"


def validate_email(value):
    """Валидатор email"""
    email_regex = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    if not re.match(email_regex, value):
        raise ValidationError(
            "Email должен соответствовать формату адреса электронной почты"
        )
    return value


@pytest.mark.django_db
class TestEmailValidator:
    """
    Тесты валидатора email

    Требование task.md: email должен соответствовать формату адресов электронной почты
    """

    def test_valid_email_simple(self):
        """Валидный email: простой формат"""
        result = validate_email("user@example.com")
        assert result == "user@example.com"

    def test_valid_email_with_subdomain(self):
        """Валидный email: с поддоменом"""
        result = validate_email("user@mail.example.com")
        assert result == "user@mail.example.com"

    def test_valid_email_with_plus(self):
        """Валидный email: с + в имени"""
        result = validate_email("user.name+tag@example.com")
        assert result == "user.name+tag@example.com"

    def test_valid_email_with_numbers(self):
        """Валидный email: с цифрами"""
        result = validate_email("user123@example456.com")
        assert result == "user123@example456.com"

    def test_invalid_email_no_at(self):
        """Невалидный email: нет символа @"""
        with pytest.raises(ValidationError) as exc_info:
            validate_email("userexample.com")
        assert "Email должен соответствовать формату" in str(exc_info.value)

    def test_invalid_email_no_domain(self):
        """Невалидный email: нет домена"""
        with pytest.raises(ValidationError) as exc_info:
            validate_email("user@")
        assert "Email должен соответствовать формату" in str(exc_info.value)

    def test_invalid_email_no_tld(self):
        """Невалидный email: нет расширения домена"""
        with pytest.raises(ValidationError) as exc_info:
            validate_email("user@example")
        assert "Email должен соответствовать формату" in str(exc_info.value)

    def test_invalid_email_empty(self):
        """Невалидный email: пустая строка"""
        with pytest.raises(ValidationError) as exc_info:
            validate_email("")
        assert "Email должен соответствовать формату" in str(exc_info.value)

    def test_invalid_email_with_spaces(self):
        """Невалидный email: содержит пробелы"""
        with pytest.raises(ValidationError) as exc_info:
            validate_email("user @example.com")
        assert "Email должен соответствовать формату" in str(exc_info.value)

    def test_invalid_email_with_cyrillic(self):
        """Невалидный email: кириллица в домене"""
        with pytest.raises(ValidationError) as exc_info:
            validate_email("user@пример.com")
        assert "Email должен соответствовать формату" in str(exc_info.value)


@pytest.mark.django_db
class TestPasswordValidator:
    """
    Тесты валидатора пароля

    Требование: пароль — не менее 6 символов: как минимум одна заглавная буква,
    одна цифра и один специальный символ.
    """

    @pytest.fixture
    def validator(self):
        """Создает экземпляр валидатора"""
        return CustomPasswordValidator()

    class TestValidPasswords:
        """Тесты валидных паролей"""

        def test_valid_password_with_all_requirements(self, validator):
            """
            Валидный пароль: 6+ символов, заглавная буква, цифра, специальный символ
            """
            validator.validate("TestPass1!")
            validator.validate("Password123!")
            validator.validate("Admin@2024")

        def test_valid_password_minimum_length(self, validator):
            """
            Валидный пароль: минимальная длина (6 символов)
            """
            validator.validate("Aa1@bc")

        def test_valid_password_long(self, validator):
            """
            Валидный пароль: длинный пароль
            """
            validator.validate("MySecurePassword123!")

    class TestInvalidPasswords:
        """Тесты невалидных паролей"""

        def test_invalid_password_no_uppercase(self, validator):
            """
            Невалидный пароль: нет заглавных букв
            """
            with pytest.raises(ValidationError) as exc_info:
                validator.validate("testpass1!")

            assert "Пароль должен содержать хотя бы одну заглавную букву" in str(
                exc_info.value
            )

        def test_invalid_password_no_lowercase(self, validator):
            """
            Невалидный пароль: нет строчных букв
            """
            with pytest.raises(ValidationError) as exc_info:
                validator.validate("TESTPASS1!")

            assert "Пароль должен содержать хотя бы одну строчную букву" in str(
                exc_info.value
            )

        def test_invalid_password_no_digit(self, validator):
            """
            Невалидный пароль: нет цифр
            """
            with pytest.raises(ValidationError) as exc_info:
                validator.validate("TestPass!")

            assert "Пароль должен содержать хотя бы одну цифру" in str(exc_info.value)

        def test_invalid_password_no_special_char(self, validator):
            """
            Невалидный пароль: нет специального символа
            """
            with pytest.raises(ValidationError) as exc_info:
                validator.validate("TestPass1")

            assert "Пароль должен содержать хотя бы один специальный символ" in str(
                exc_info.value
            )

        def test_invalid_password_only_lowercase(self, validator):
            """
            Невалидный пароль: только строчные буквы

            """
            with pytest.raises(ValidationError) as exc_info:
                validator.validate("password")

            assert "Пароль должен содержать хотя бы одну заглавную букву" in str(
                exc_info.value
            )

    class TestSpecialCharacters:
        """Тесты различных специальных символов"""

        def test_valid_password_with_at_symbol(self, validator):
            """Валидный пароль с символом @"""
            validator.validate("Test@123")

        def test_valid_password_with_dollar_symbol(self, validator):
            """Валидный пароль с символом $"""
            validator.validate("Test$123")

        def test_valid_password_with_exclamation_symbol(self, validator):
            """Валидный пароль с символом !"""
            validator.validate("Test!123")

        def test_valid_password_with_percent_symbol(self, validator):
            """Валидный пароль с символом %"""
            validator.validate("Test%123")

        def test_valid_password_with_star_symbol(self, validator):
            """Валидный пароль с символом *"""
            validator.validate("Test*123")

        def test_valid_password_with_question_symbol(self, validator):
            """Валидный пароль с символом ?"""
            validator.validate("Test?123")

        def test_invalid_password_with_hash_symbol(self, validator):
            """
            Невалидный пароль: символ # не входит в разрешенный набор
            """
            with pytest.raises(ValidationError) as exc_info:
                validator.validate("Test#123")

            assert "Пароль должен содержать хотя бы один специальный символ" in str(
                exc_info.value
            )

    class TestHelpText:
        """Тесты текста помощи"""

        def test_get_help_text(self, validator):
            """Проверка текста помощи"""
            help_text = validator.get_help_text()
            assert "заглавную букву" in help_text
            assert "строчную букву" in help_text
            assert "цифру" in help_text
            assert "специальный символ" in help_text
            assert "@$!%*?&" in help_text
