"""Тесты сериалайзеров для файлов

- создание файла через сериалайзер
- получение информации о файле
- валидация данных
"""

import pytest
from django.core.files.base import ContentFile

from files.factories import FileFactory
from files.models import File
from files.serializers import FileSerializer, PublicFileSerializer


@pytest.mark.django_db
class TestFileSerializer:
    """
    Тесты FileSerializer

    Тестирует:
    - Правильное отображение полей файла
    - Валидацию данных при создании
    - Обработку read_only полей
    """

    @pytest.fixture
    def file(self):
        """Создает файл через фабрику для теста"""
        return FileFactory.create()

    def test_file_serializer_fields(self, file):
        """
        Тест полей FileSerializer
        """
        serializer = FileSerializer(file)
        data = serializer.data

        # Проверяем, что все обязательные поля присутствуют
        assert "id" in data
        assert "original_name" in data
        assert "comment" in data
        assert "size" in data
        assert "upload_at" in data
        assert "user" in data
        assert "special_link" in data
        assert "last_download_at" in data
        assert "file" in data

    def test_file_serializer_original_name(self, file):
        """
        Тест поля original_name
        """
        serializer = FileSerializer(file)
        assert serializer.data["original_name"] == file.original_name

    def test_file_serializer_comment(self, file):
        """
        Тест поля comment
        """
        serializer = FileSerializer(file)
        assert serializer.data["comment"] == file.comment

    def test_file_serializer_size(self, file):
        """
        Тест поля size
        """
        serializer = FileSerializer(file)
        assert serializer.data["size"] == file.size

    def test_file_serializer_user(self, file):
        """
        Тест поля user
        """
        serializer = FileSerializer(file)
        assert serializer.data["user"] == file.user.id

    def test_file_serializer_special_link(self, file):
        """
        Тест поля special_link
        """
        serializer = FileSerializer(file)
        assert serializer.data["special_link"] == file.special_link

    def test_file_serializer_read_only_fields(self, file):
        """
        Тест read_only_fields
        Поле upload_at должно быть доступно только для чтения
        """
        serializer = FileSerializer(file)

        # Проверяем, что upload_at присутствует
        assert "upload_at" in serializer.data

        # Проверяем, что user присутствует
        assert "user" in serializer.data

    def test_file_serializer_file_field(self, file):
        """
        Тест поля file (URL к файлу)
        """
        serializer = FileSerializer(file)
        # Поле file должно быть URL
        assert "file" in serializer.data
        assert serializer.data["file"] is not None

    def test_file_serializer_upload_at_format(self, file):
        """
        Тест формата поля upload_at
        """
        serializer = FileSerializer(file)
        # Дата должна быть в формате ISO 8601
        upload_at = serializer.data["upload_at"]
        assert "T" in upload_at or " " in upload_at


@pytest.mark.django_db
class TestPublicFileSerializer:
    """
    Тесты PublicFileSerializer

    Тестирует:
    - Правильное отображение публичных полей файла
    - Отсутствие чувствительных данных
    """

    def test_public_file_serializer_fields(self):
        """
        Тест полей PublicFileSerializer
        """
        file = FileFactory.create()
        serializer = PublicFileSerializer(file)
        data = serializer.data

        # Проверяем, что только публичные поля присутствуют
        assert "original_name" in data
        assert "comment" in data
        assert "size" in data
        assert "special_link" in data

        # Проверяем, что закрытые поля отсутствуют
        assert "id" not in data
        assert "user" not in data
        assert "upload_at" not in data
        assert "last_download_at" not in data
        assert "file" not in data

    def test_public_file_serializer_original_name(self):
        """
        Тест поля original_name
        """
        file = FileFactory.create()
        serializer = PublicFileSerializer(file)
        assert serializer.data["original_name"] == file.original_name

    def test_public_file_serializer_comment(self):
        """
        Тест поля comment
        """
        file = FileFactory.create()
        serializer = PublicFileSerializer(file)
        assert serializer.data["comment"] == file.comment

    def test_public_file_serializer_size(self):
        """
        Тест поля size
        """
        file = FileFactory.create()
        serializer = PublicFileSerializer(file)
        assert serializer.data["size"] == file.size

    def test_public_file_serializer_special_link(self):
        """
        Тест поля special_link
        """
        file = FileFactory.create()
        serializer = PublicFileSerializer(file)
        assert serializer.data["special_link"] == file.special_link

    def test_public_file_serializer_read_only(self):
        """
        Тест, что все поля read_only
        """
        file = FileFactory.create()
        serializer = PublicFileSerializer(file)

        # Все поля должны быть read_only
        for field_name in serializer.fields:
            field = serializer.fields[field_name]
            assert field.read_only is True


@pytest.mark.django_db
class TestFileSerializerCreate:
    """
    Тесты создания файла через FileSerializer
    """

    @pytest.fixture
    def user(self):
        """Создает пользователя через фабрику для теста"""
        from users.factories import UserFactory

        return UserFactory.create()

    def test_serializer_create_with_valid_data(self, user):
        """
        Тест создания файла с валидными данными
        """
        from django.core.files.base import ContentFile

        file_content = ContentFile(b"Test content", name="test.txt")

        data = {
            "original_name": "test.txt",
            "comment": "Test comment",
            "file": file_content,
        }

        serializer = FileSerializer(data=data)
        assert serializer.is_valid() is True

        file = serializer.save(user=user)

        # Проверяем, что файл создан
        assert File.objects.filter(id=file.id).exists()
        assert file.original_name == "test.txt"
        assert file.comment == "Test comment"
        assert file.user == user
        assert file.special_link is not None

    def test_serializer_create_without_comment(self, user):
        """
        Тест создания файла без комментария
        """
        from django.core.files.base import ContentFile

        file_content = ContentFile(b"Test content", name="test.txt")

        data = {
            "original_name": "test.txt",
            "file": file_content,
        }

        serializer = FileSerializer(data=data)
        assert serializer.is_valid() is True

        file = serializer.save(user=user)
        assert file.comment == ""

    def test_serializer_create_auto_special_link(self, user):
        """
        Тест автоматической генерации special_link
        """
        from django.core.files.base import ContentFile

        file_content = ContentFile(b"Test content", name="test.txt")

        data = {
            "original_name": "test.txt",
            "file": file_content,
        }

        serializer = FileSerializer(data=data)
        assert serializer.is_valid() is True

        file = serializer.save(user=user)

        # Проверяем, что special_link сгенерирована
        assert file.special_link is not None
        assert len(file.special_link) == 32
        assert file.special_link.isalnum()

    def test_serializer_validation_missing_original_name(self, user):
        """
        Тест валидации: отсутствие original_name
        original_name не является обязательным полем (blank=True)
        """
        from django.core.files.base import ContentFile

        file_content = ContentFile(b"Test content", name="test.txt")

        data = {
            "file": file_content,
        }

        serializer = FileSerializer(data=data)
        # original_name необязательное поле, валидация пройдет
        assert serializer.is_valid() is True

    def test_serializer_validation_missing_file(self, user):
        """
        Тест валидации: отсутствие файла
        """
        data = {
            "original_name": "test.txt",
        }

        serializer = FileSerializer(data=data)
        assert serializer.is_valid() is False
        assert "file" in serializer.errors
