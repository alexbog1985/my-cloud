"""Фабрики для создания тестовых данных пользователей

Используется библиотека factory_boy для генерации фиктивных данных.

Основные классы:
- UserFactory: создает обычных пользователей
- AdminUserFactory: создает администраторов
"""

import factory
from django.contrib.auth import get_user_model

User = get_user_model()


class UserFactory(factory.django.DjangoModelFactory):
    """Фабрика для создания обычных пользователей

    Генерирует пользователя со следующими полями:
    - username: уникальное имя пользователя
    - email: уникальный email адрес
    - first_name: случайное имя
    - last_name: случайная фамилия
    - password: захэшированный пароль 'TestPass123!'
    - is_admin: False по умолчанию

    Пароль автоматически хэшируется через set_password().
    """

    class Meta:
        model = User
        django_get_or_create = ("username",)

    username = factory.Faker("user_name")
    email = factory.Faker("email")
    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
    password = "TestPass123!"
    is_admin = False

    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        """Создает пользователя с захэшированным паролем

        Переопределяет стандартный метод _create для правильной работы с паролем.
        Пароль сначала сохраняется как есть, затем хэшируется через set_password()
        и пользователь сохраняется повторно.

        Args:
            model_class: Класс модели User
            *args: Аргументы для создания пользователя
            **kwargs: Ключевые аргументы, включая password (опционально)

        Returns:
            User: Созданный пользователь с захэшированным паролем
        """
        manager = cls._get_manager(model_class)
        # Извлекаем пароль из kwargs
        password = kwargs.pop("password", cls.password)
        # Создаем пользователя с незахэшированным паролем
        user = manager.create_user(*args, **kwargs)
        # Устанавливаем захэшированный пароль
        user.set_password(password)
        user.save()
        return user


class AdminUserFactory(factory.django.DjangoModelFactory):
    """Фабрика для создания администраторов

    Аналогична UserFactory, но создает пользователей с правами администратора.
    Использует пароль 'AdminPass123!' по умолчанию.

    Args:
        factory: Базовый класс DjangoModelFactory
    """

    class Meta:
        model = User
        django_get_or_create = ("username",)

    username = factory.Faker("user_name")
    email = factory.Faker("email")
    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
    password = "AdminPass123!"
    is_admin = True

    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        """Создает администратора с захэшированным паролем

        Args:
            model_class: Класс модели User
            *args: Аргументы для создания пользователя
            **kwargs: Ключевые аргументы, включая password (опционально)

        Returns:
            User: Созданный администратор с захэшированным паролем
        """
        manager = cls._get_manager(model_class)
        # Извлекаем пароль из kwargs
        password = kwargs.pop("password", cls.password)
        # Создаем пользователя с незахэшированным паролем
        user = manager.create_user(*args, **kwargs)
        # Устанавливаем захэшированный пароль
        user.set_password(password)
        user.save()
        return user
