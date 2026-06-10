from rest_framework import serializers
from django.conf import settings
import os
from .models import File


def validate_file_size(value):
    """Валидатор размера файла"""
    max_size = getattr(settings, 'MAX_FILE_SIZE', 100) * 1024 * 1024  # 100MB по умолчанию
    if value.size > max_size:
        raise serializers.ValidationError(
            f'Размер файла не должен превышать {max_size // (1024*1024)}MB'
        )
    return value


class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = [
            'id',
            'original_name',
            'comment',
            'size',
            'upload_at',
            'user',
            'special_link',
            'last_download_at',
            'file',
        ]
        read_only_fields = [
            'id',
            'size',
            'upload_at',
            'user',
            'special_link',
            'last_download_at',
        ]

    def validate_file(self, value):
        """Валидация размера файла"""
        if hasattr(value, 'size'):
            validate_file_size(value)
        return value

    def validate(self, attrs):
        """Автоматическое определение original_name из имени файла"""
        file_obj = attrs.get('file')
        if file_obj and hasattr(file_obj, 'name') and not attrs.get('original_name'):
            attrs['original_name'] = os.path.basename(file_obj.name)
        return attrs

    def update(self, instance, validated_data):
        """Переопределяем update для предотвращения изменения файла"""
        if 'file' in validated_data:
            new_file = validated_data['file']

            if new_file != instance.file:
                validate_file_size(new_file)
        
        validated_data.pop('file', None)
        
        return super().update(instance, validated_data)

class PublicFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = (
            'original_name',
            'comment',
            'size',
            'special_link',
        )
        read_only_fields = fields