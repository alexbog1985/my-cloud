from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from files.models import File
from files.tests.base_test import BaseTestCase

User = get_user_model()


class FileDownloadByLinkViewTests(BaseTestCase):

    def setUp(self):
        """Создание тестового пользователя и файла"""
        super().setUp()
        self.user = User.objects.create_user(
            username="testuser",
            email="test@test.com",
            password="TestPass123!",
            first_name="Test",
            last_name="User",
        )

        self.file_content = b"Public file content"
        self.file = File.objects.create(
            file=SimpleUploadedFile("public_file.txt", self.file_content),
            user=self.user,
            comment="Public file",
        )

        self.special_link = self.file.special_link
        self.client = APIClient()

    def test_download_by_link_info(self):
        """Получение информации о файле по специальной ссылке"""
        response = self.client.get(
            reverse(
                "file-download-by-link", kwargs={"special_link": self.special_link}
            ),
            {"info": "true"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["original_name"], "public_file.txt")
        self.assertEqual(response.data["size"], len(self.file_content))

    def test_download_by_link_file(self):
        """Скачивание файла по специальной ссылке"""
        response = self.client.get(
            reverse("file-download-by-link", kwargs={"special_link": self.special_link})
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response["Content-Disposition"], 'attachment; filename="public_file.txt"'
        )
        self.assertEqual(response.content, self.file_content)

    def test_download_by_link_not_found(self):
        """Ошибки при неверной специальной ссылке"""
        response = self.client.get(
            reverse(
                "file-download-by-link", kwargs={"special_link": "invalid_link_12345"}
            )
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_download_by_link_no_auth_required(self):
        """Доступ по специальной ссылке без аутентификации"""
        # Не аутентифицируемся
        response = self.client.get(
            reverse(
                "file-download-by-link", kwargs={"special_link": self.special_link}
            ),
            {"info": "true"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_download_by_link_updates_last_download(self):
        """Скачивание файла обновляет дату последнего скачивания"""
        response = self.client.get(
            reverse("file-download-by-link", kwargs={"special_link": self.special_link})
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Обновляем объект из БД
        self.file.refresh_from_db()

        # Проверяем, что last_download_at обновился
        self.assertIsNotNone(self.file.last_download_at)
