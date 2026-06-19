from rest_framework import serializers

from .models import File


class FileSerializer(serializers.ModelSerializer):
    file = serializers.FileField(required=True, write_only=True)

    class Meta:
        model = File
        fields = [
            "id",
            "original_name",
            "comment",
            "size",
            "upload_at",
            "user",
            "special_link",
            "last_download_at",
            "file",
        ]
        read_only_fields = [
            "id",
            "size",
            "upload_at",
            "user",
            "special_link",
            "last_download_at",
        ]

    def to_representation(self, instance):
        """После создания возвращаем поле file как URL"""
        ret = super().to_representation(instance)
        ret["file"] = instance.file.url if instance.file else None
        return ret


class PublicFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = (
            "original_name",
            "comment",
            "size",
            "special_link",
        )
        read_only_fields = fields
