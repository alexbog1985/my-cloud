from rest_framework import serializers
from .models import File

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
            'file',
        ]
        read_only_fields = [
            'id',
            'size',
            'upload_at',
            'user',
            'special_link',
        ]