from django.contrib.auth.password_validation import validate_password
from django.db import models
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .validators import validate_username


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    file_count = serializers.SerializerMethodField()
    storage_size = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'full_name',
            'email',
            'is_admin',
            'storage_path',
            'date_joined',
            'file_count',
            'storage_size',
        )
        read_only_fields = ('date_joined', 'storage_path')

    def get_full_name(self, obj):
        return obj.get_full_name()

    def get_file_count(self, obj):
        return obj.files.count()

    def get_storage_size(self, obj):
        total_size = obj.files.aggregate(
            total_size=models.Sum('size')
        )['total_size']
        return total_size or 0


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    username = serializers.CharField(validators=[validate_username])
    access_token = serializers.CharField(read_only=True)
    refresh_token = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'email', 'password', 'access_token', 'refresh_token')

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(
            username=validated_data['username'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            email=validated_data['email'],
        )
        user.set_password(password)
        user.save()

        # Добавляем токены в пользовательский объект
        refresh = RefreshToken.for_user(user)
        user.access_token = str(refresh.access_token)
        user.refresh_token = str(refresh)

        return user


class LoginSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data

        return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        return token
