import re

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from rest_framework import serializers

User = get_user_model()


def validate_username(value):
    """
    Валидация логина
    Требования: только латинские буквы и цифры, первый символ — буква, длина от 4 до 20 символов
    """
    if not re.match(r'^[a-zA-Z][a-zA-Z0-9]{3,19}$', value):
        raise serializers.ValidationError(
            'Логин должен содержать только латинские буквы и цифры, первый символ — буква, длина от 4 до 20 символов'
        )
    if User.objects.filter(username=value).exists():
        raise serializers.ValidationError("Пользователь с таким логином уже существует.")
    return value


def validate_email(value):
    """
    Валидация email
    Требования: email должен соответствовать формату адресов электронной почты
    """
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_regex, value):
        raise ValidationError('Email должен соответствовать формату адреса электронной почты')
    return value
