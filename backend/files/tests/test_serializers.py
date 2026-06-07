from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase
from files.models import File
from files.serializers import FileSerializer, PublicFileSerializer

User = get_user_model()


class FileSerializerTests(APITestCase):

    def setUp(self):
        """Создание тестового пользователя"""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='TestPass123!',
            first_name='Test',
            last_name='User'
        )

    def test_serializer_valid_data(self):
        """Тест сериализатора с валидными данными"""
        file_content = b'Test file content'
        uploaded_file = SimpleUploadedFile('test.txt', file_content)

        file_obj = File.objects.create(
            file=uploaded_file,
            user=self.user,
            comment='Test comment'
        )

        serializer = FileSerializer(file_obj)
        data = serializer.data

        self.assertEqual(data['original_name'], 'test.txt')
        self.assertEqual(data['comment'], 'Test comment')
        self.assertEqual(data['user'], self.user.id)
        self.assertTrue(data['special_link'])
        self.assertIn('size', data)
        self.assertIn('upload_at', data)

    def test_serializer_read_only_fields(self):
        """Тест read_only полей сериализатора"""
        file_content = b'Test content'
        uploaded_file = SimpleUploadedFile('test.txt', file_content)

        file_obj = File.objects.create(
            file=uploaded_file,
            user=self.user
        )

        serializer = FileSerializer(file_obj)
        data = serializer.data

        # Поля, которые должны быть read_only
        read_only_fields = ['id', 'size', 'upload_at', 'user', 'special_link', 'last_download_at']

        for field in read_only_fields:
            self.assertIn(field, data)

    def test_serializer_create_file(self):
        """Тест создания файла через сериализатор"""
        file_content = b'New file content'
        uploaded_file = SimpleUploadedFile('newfile.txt', file_content)

        file_data = {
            'file': uploaded_file,
            'original_name': 'newfile.txt',
            'comment': 'Created via serializer'
        }

        serializer = FileSerializer(data=file_data)

        self.assertTrue(serializer.is_valid(), msg=str(serializer.errors))
        file_obj = serializer.save(user=self.user)

        self.assertEqual(file_obj.original_name, 'newfile.txt')
        self.assertEqual(file_obj.user, self.user)
        self.assertTrue(file_obj.special_link)

    def test_serializer_update_file(self):
        """Тест обновления файла через сериализатор"""
        file_content = b'Original content'
        uploaded_file = SimpleUploadedFile('original.txt', file_content)

        file_obj = File.objects.create(
            file=uploaded_file,
            user=self.user,
            comment='Original comment'
        )

        updated_data = {
            'comment': 'Updated comment'
        }

        serializer = FileSerializer(file_obj, data=updated_data, partial=True)

        self.assertTrue(serializer.is_valid())
        file_obj = serializer.save()

        file_obj.refresh_from_db()
        self.assertEqual(file_obj.comment, 'Updated comment')

    def test_serializer_optional_comment(self):
        """Тест файла без комментария"""
        file_content = b'No comment content'
        uploaded_file = SimpleUploadedFile('nocomment.txt', file_content)

        file_obj = File.objects.create(
            file=uploaded_file,
            user=self.user
        )

        serializer = FileSerializer(file_obj)
        data = serializer.data

        self.assertIsNotNone(data['comment'])
        self.assertEqual(data['comment'], '')

    def test_serializer_special_characters_filename(self):
        """Тест файла со специальными символами в имени"""
        file_content = b'Special chars content'
        uploaded_file = SimpleUploadedFile('file-with_special.chars.txt', file_content)

        file_obj = File.objects.create(
            file=uploaded_file,
            user=self.user
        )

        serializer = FileSerializer(file_obj)
        data = serializer.data

        self.assertEqual(data['original_name'], 'file-with_special.chars.txt')

    def test_public_serializer_fields(self):
        """Тест полей PublicFileSerializer"""
        file_content = b'Test content'
        uploaded_file = SimpleUploadedFile('test.txt', file_content)

        file_obj = File.objects.create(
            file=uploaded_file,
            user=self.user,
            comment='Public file'
        )

        serializer = PublicFileSerializer(file_obj)
        data = serializer.data

        # Проверить, что только публичные поля
        public_fields = ['original_name', 'comment', 'size', 'special_link']
        for field in public_fields:
            self.assertIn(field, data)

        # Проверить, что приватные поля отсутствуют
        private_fields = ['id', 'user', 'upload_at', 'last_download_at', 'file']
        for field in private_fields:
            self.assertNotIn(field, data)

    def test_public_serializer_no_user_info(self):
        """Тест, что PublicFileSerializer не содержит информацию о пользователе"""
        file_content = b'Private content'
        uploaded_file = SimpleUploadedFile('private.txt', file_content)

        file_obj = File.objects.create(
            file=uploaded_file,
            user=self.user
        )

        serializer = PublicFileSerializer(file_obj)
        data = serializer.data

        self.assertNotIn('user', data)
        self.assertNotIn('user', serializer.fields)