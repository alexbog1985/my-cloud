from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from files.models import File
from files.tests.base_test import BaseTestCase

User = get_user_model()


class FileModelTest(BaseTestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='TestPass123!',
            first_name='TestFirstName',
            last_name='TestLastName',
        )

    def test_create_file(self):
        """Тест создания файла"""
        content = b'Test file content'
        file_obj = SimpleUploadedFile('test.txt', content, content_type='text/plain')

        file = File.objects.create(
            user=self.user,
            file=file_obj,
            original_name='test.txt',
            comment='test comment',
        )

        self.assertEqual(file.original_name, 'test.txt')
        self.assertEqual(file.comment, 'test comment')
        self.assertEqual(file.user, self.user)
        self.assertTrue(file.special_link)
        self.assertGreater(file.size, 0)

    def test_file_size_calculation(self):
        """Тест вычисления размера файла"""
        file_content = b'A' * 1024
        uploaded_file = SimpleUploadedFile('test.txt', file_content)

        file_obj = File.objects.create(
            file=uploaded_file,
            user=self.user,
            comment='1KB file'
        )

        self.assertEqual(file_obj.size, 1024)

    def test_special_link_generation(self):
        """Тест генерации уникальной специальной ссылки"""
        file_content = b'Test content'
        uploaded_file = SimpleUploadedFile('test.txt', file_content)

        file_obj = File.objects.create(
            file=uploaded_file,
            user=self.user,
        )

        self.assertTrue(file_obj.special_link)
        self.assertEqual(len(file_obj.special_link), 32)
        self.assertTrue(file_obj.special_link.isalnum())

    def test_special_link_uniq(self):
        """Тест уникальности ссылки"""
        file_content1 = b'Test content1'
        file_content2 = b'Test content2'

        uploaded_file1 = SimpleUploadedFile('file1.txt', file_content1)
        uploaded_file2 = SimpleUploadedFile('file2.txt', file_content2)

        file_obj1 = File.objects.create(file=uploaded_file1, user=self.user)
        file_obj2 = File.objects.create(file=uploaded_file2, user=self.user)

        self.assertNotEqual(file_obj1.special_link, file_obj2.special_link)

    def test_file_string_representation(self):
        """Тест строкового представления файла"""
        file_content = b'Test content'
        uploaded_file = SimpleUploadedFile('test.txt', file_content)

        file_obj = File.objects.create(
            file=uploaded_file,
            user=self.user,
            comment='Test file'
        )

        expected_str = f"test.txt ({self.user.username})"
        self.assertEqual(str(file_obj), expected_str)

    def test_update_file_comment(self):
        """Тест обновления комментария файла"""
        file_content = b'Test content'
        uploaded_file = SimpleUploadedFile('test.txt', file_content)

        file_obj = File.objects.create(
            file=uploaded_file,
            user=self.user,
            comment='Original comment'
        )

        file_obj.comment = 'Updated comment'
        file_obj.save()

        file_obj.refresh_from_db()
        self.assertEqual(file_obj.comment, 'Updated comment')

    def test_original_name_from_filename(self):
        """Тест автоматического определения original_name из имени файла"""
        file_content = b'Test content'
        uploaded_file = SimpleUploadedFile('my_document.pdf', file_content)

        file_obj = File.objects.create(
            file=uploaded_file,
            user=self.user,
        )

        self.assertEqual(file_obj.original_name, 'my_document.pdf')

    def test_multiple_files_same_user(self):
        """Тест загрузки нескольких файлов одним пользователем"""
        for i in range(3):
            file_content = f'Content {i}'.encode()
            uploaded_file = SimpleUploadedFile(f'file{i}.txt', file_content)

            file_obj = File.objects.create(
                file=uploaded_file,
                user=self.user,
            )

            self.assertEqual(file_obj.user, self.user)
            self.assertTrue(file_obj.special_link)