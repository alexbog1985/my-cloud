"""Валидаторы для модуля пользователей

Содержит функции валидации для:
- username: логин, соответствующий требованиям безопасности
- email: адрес электронной почты

Требования к данным:
- Логин: только латинские буквы и цифры, первый символ — буква, длина от 4 до 20 символов
- Email: соответствует формату адресов электронной почты
"""
import re

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from rest_framework import serializers

User = get_user_model()


def validate_username(value):
    """Валидация логина пользователя

    Проверяет соответствие логина следующим требованиям:
    - Содержит только латинские буквы и цифры
    - Первый символ — буква
    - Длина от 4 до 20 символов
    - Уникален в системе (не занят другим пользователем)

    Args:
        value: Строка с логином для валидации

    Returns:
        str: Валидный логин

    Raises:
        serializers.ValidationError: Если логин не соответствует требованиям
    """
    if not re.match(r'^[a-zA-Z][a-zA-Z0-9]{3,19}$', value):
        raise serializers.ValidationError(
            'Логин должен содержать только латинские буквы и цифры, первый символ — буква, длина от 4 до 20 символов'
        )
    if User.objects.filter(username=value).exists():
        raise serializers.ValidationError("Пользователь с таким логином уже существует.")
    return value


def validate_email(value):
    """Валидация email адреса пользователя

    Проверяет соответствие email формату адресов электронной почты:
    - Содержит символ @
    - Имеет доменное имя
    - Имеет доменную зону (TLD)

    Args:
        value: Строка с email адресом для валидации

    Returns:
        str: Валидный email адрес

    Raises:
        ValidationError: Если email не соответствует формату
    """
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_regex, value):
        raise ValidationError('Email должен соответствовать формату адреса электронной почты')
    return value
