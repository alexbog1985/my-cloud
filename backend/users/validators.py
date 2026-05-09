import re

from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

def validate_username(value):
    if not re.match(r'^[a-zA-Z][a-zA-Z0-9]{3,19}$', value):
        raise serializers.ValidationError(
            'Логин должен содержать только латинские буквы и цифры, первый символ — буква, длина от 4 до 20 символов'
        )
    if User.objects.filter(username=value).exists():
        raise serializers.ValidationError("Пользователь с таким логином уже существует.")
    return value


# def validate_email(value):
#     if not value:
#         raise serializers.ValidationError('Email обязателен.')
#     if User.objects.filter(email=value).exists():
#         raise serializers.ValidationError("Пользователь с таким email существует.")
#     return value