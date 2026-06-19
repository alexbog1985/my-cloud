"""Сериализаторы для модуля пользователей

Содержит сериализаторы для:
- UserSerializer: отображение данных пользователя
- RegisterSerializer: регистрация нового пользователя с валидацией
- LoginSerializer: аутентификация пользователя и получение JWT токенов

Использует Django REST Framework и JWT (JSON Web Tokens) для аутентификации.
"""

from django.contrib.auth.password_validation import validate_password
from django.db import models
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .validators import validate_username


class UserSerializer(serializers.ModelSerializer):
    """Сериализатор для отображения данных пользователя

    Возвращает данные о пользователе, включая:
    - id: уникальный идентификатор
    - username: логин
    - full_name: полное имя (составное)
    - email: email адрес
    - is_admin: признак администратора
    - storage_path: путь к хранилищу
    - date_joined: дата регистрации
    - file_count: количество файлов
    - storage_size: общий размер файлов

    Поля date_joined и storage_path доступны только для чтения.
    """

    full_name = serializers.SerializerMethodField()
    file_count = serializers.SerializerMethodField()
    storage_size = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "full_name",
            "email",
            "is_admin",
            "storage_path",
            "date_joined",
            "file_count",
            "storage_size",
        )
        read_only_fields = ("date_joined", "storage_path")

    def get_full_name(self, obj):
        """Возвращает полное имя пользователя

        Args:
            obj: Экземпляр модели User

        Returns:
            str: Полное имя (имя + фамилия)
        """
        return obj.get_full_name()

    def get_file_count(self, obj):
        """Возвращает количество файлов пользователя

        Args:
            obj: Экземпляр модели User

        Returns:
            int: Количество файлов (0 если файлов нет)
        """
        return obj.files.count()

    def get_storage_size(self, obj):
        """Возвращает общий размер файлов пользователя

        Args:
            obj: Экземпляр модели User

        Returns:
            int: Общий размер файлов в байтах (0 если файлов нет)
        """
        total_size = obj.files.aggregate(
            total_size=models.Sum('size')
        )['total_size']
        return total_size or 0


class RegisterSerializer(serializers.ModelSerializer):
    """Сериализатор для регистрации нового пользователя

    Проверяет валидность данных и создает нового пользователя с:
    - Валидацией логина (unique, формат)
    - Валидацией пароля (силовая валидация Django)
    - Генерацией JWT токенов (access и refresh)

    Args:
        serializers: Базовый класс ModelSerializer

    Returns:
        User: Объект пользователя с добавленными токенами access и refresh
    """

    password = serializers.CharField(write_only=True, validators=[validate_password])
    username = serializers.CharField(validators=[validate_username])

    class Meta:
        model = User
        fields = ("username", "first_name", "last_name", "email", "password")

    def create(self, validated_data):
        """Создает нового пользователя с захэшированным паролем и токенами

        Args:
            validated_data: Валидные данные из сериализатора

        Returns:
            User: Созданный пользователь
        """
        password = validated_data.pop("password")
        user = User(
            username=validated_data["username"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
            email=validated_data["email"],
        )
        user.set_password(password)
        user.save()

        # Добавляем токены в пользовательский объект
        refresh = RefreshToken.for_user(user)
        user.access_token = str(refresh.access_token)
        user.refresh_token = str(refresh)

        return user

    def to_representation(self, instance):
        """Преобразует объект пользователя в словарь для ответа

        Args:
            instance: Объект пользователя

        Returns:
            dict: Словарь с данными пользователя и токенами
        """
        return {
            "username": instance.username,
            "first_name": instance.first_name,
            "last_name": instance.last_name,
            "email": instance.email,
            "access": instance.access_token,
            "refresh": instance.refresh_token,
        }


class LoginSerializer(TokenObtainPairSerializer):
    """Сериализатор для аутентификации пользователя

    Наследуется от TokenObtainPairSerializer (JWT) и расширяет его:
    - Валидирует логин и пароль
    - Генерирует пару JWT токенов (access и refresh)
    - Возвращает данные пользователя в ответе

    Raises:
        AuthenticationFailed: Если учетные данные неверны
    """

    def validate(self, attrs):
        """Проводит валидацию и возвращает токены с данными пользователя

        Args:
            attrs: Атрибуты (username и password)

        Returns:
            dict: Словарь с access токеном, refresh токеном и данными пользователя

        Raises:
            AuthenticationFailed: Если учетные данные неверны
        """
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data

        return data

    @classmethod
    def get_token(cls, user):
        """Создает JWT токен для пользователя

        Args:
            user: Объект пользователя

        Returns:
            RefreshToken: JWT токен с дополнительным полем username
        """
        token = super().get_token(user)
        token["username"] = user.username
        return token
