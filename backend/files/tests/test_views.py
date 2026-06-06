from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from files.models import File

User = get_user_model()


class FileViewSetTests(APITestCase):

    def setUp(self):
        """Создание тестовых пользователей"""
        self.admin = User.objects.create_user(
            username='adminuser',
            email='admin@test.com',
            password='AdminPass123!',
            first_name='Admin',
            last_name='User'
        )
        self.admin.is_admin = True
        self.admin.save()

        self.user1 = User.objects.create_user(
            username='user1',
            email='user1@test.com',
            password='User1Pass123!',
            first_name='User',
            last_name='One'
        )

        self.user2 = User.objects.create_user(
            username='user2',
            email='user2@test.com',
            password='User2Pass123!',
            first_name='User',
            last_name='Two'
        )

        # Создание файлов
        self.file_content1 = b'File content 1'
        self.file1 = File.objects.create(
            file=SimpleUploadedFile('file1.txt', self.file_content1),
            user=self.user1,
            comment='File for user1'
        )

        self.file_content2 = b'File content 2'
        self.file2 = File.objects.create(
            file=SimpleUploadedFile('file2.txt', self.file_content2),
            user=self.user2,
            comment='File for user2'
        )

        self.file_content3 = b'File content 3'
        self.file3 = File.objects.create(
            file=SimpleUploadedFile('file3.txt', self.file_content3),
            user=self.admin,
            comment='File for admin'
        )

        self.client = APIClient()

    # ТЕСТЫ ПОЛУЧЕНИЯ СПИСКА ФАЙЛОВ

    def test_list_files_authenticated_user(self):
        """Аутентифицированный пользователь видит только свои файлы"""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(reverse('files-list'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.file1.id)

    def test_list_files_admin_all(self):
        """Администратор видит все файлы"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse('files-list'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

    def test_list_files_admin_filter_by_user(self):
        """Администратор фильтрует файлы по пользователю"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(f'{reverse("files-list")}?user={self.user1.id}')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['user'], self.user1.id)

    def test_list_files_unauthenticated(self):
        """Неаутентифицированный пользователь не может получить список файлов"""
        response = self.client.get(reverse('files-list'))

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # ТЕСТЫ ПОЛУЧЕНИЯ ОДНОГО ФАЙЛА

    def test_retrieve_file_owner(self):
        """Владелец файла м��жет получить его"""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(reverse('files-detail', kwargs={'pk': self.file1.id}))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.file1.id)

    def test_retrieve_file_not_owner(self):
        """Пользователь не может получить чужой файл"""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(reverse('files-detail', kwargs={'pk': self.file2.id}))

        # Django REST Framework вернет 404, так как объект не в queryset
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_retrieve_file_admin(self):
        """Администратор может получить любой файл"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse('files-detail', kwargs={'pk': self.file2.id}))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.file2.id)

    # ТЕСТЫ СОЗДАНИЯ ФАЙЛА

    def test_create_file(self):
        """Создание нового файла"""
        self.client.force_authenticate(user=self.user1)

        file_content = b'New file content'
        uploaded_file = SimpleUploadedFile('newfile.txt', file_content)

        response = self.client.post(
            reverse('files-list'),
            {
                'file': uploaded_file,
                'original_name': 'newfile.txt',
                'comment': 'New file comment'
            },
            format='multipart'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['user'], self.user1.id)
        self.assertTrue(response.data['special_link'])

    def test_create_file_unauthenticated(self):
        """Неаутентифицированный пользователь не может создать файл"""
        file_content = b'Test content'
        uploaded_file = SimpleUploadedFile('test.txt', file_content)

        response = self.client.post(
            reverse('files-list'),
            {
                'file': uploaded_file,
                'original_name': 'test.txt'
            },
            format='multipart'
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # ТЕСТЫ УДАЛЕНИЯ ФАЙЛА

    def test_delete_file_owner(self):
        """Владелец может удалить свой файл"""
        self.client.force_authenticate(user=self.user1)

        response = self.client.delete(reverse('files-detail', kwargs={'pk': self.file1.id}))

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(File.objects.filter(id=self.file1.id).exists())

    def test_delete_file_not_owner(self):
        """Пользователь не может удалить чужой файл"""
        self.client.force_authenticate(user=self.user1)

        response = self.client.delete(reverse('files-detail', kwargs={'pk': self.file2.id}))

        # Django вернет 404, так как объект не в queryset
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(File.objects.filter(id=self.file2.id).exists())

    def test_delete_file_admin(self):
        """Администратор может удалить любой файл"""
        self.client.force_authenticate(user=self.admin)

        response = self.client.delete(reverse('files-detail', kwargs={'pk': self.file2.id}))

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(File.objects.filter(id=self.file2.id).exists())

    def test_delete_file_unauthenticated(self):
        """Неаутентифицированный пользователь не может удалить файл"""
        response = self.client.delete(reverse('files-detail', kwargs={'pk': self.file1.id}))

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertTrue(File.objects.filter(id=self.file1.id).exists())

    # ТЕСТЫ СКАЧИВАНИЯ ФАЙЛА

    def test_download_file_owner(self):
        """Владелец может скачать свой файл"""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(reverse('files-download', kwargs={'pk': self.file1.id}))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Disposition'], 'attachment; filename="file1.txt"')

    def test_download_file_admin(self):
        """Администратор может скачать любой файл"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse('files-download', kwargs={'pk': self.file2.id}))

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    # ТЕСТЫ ДЛЯ ПОЛУЧЕНИЯ ИНФОРМАЦИИ О ФАЙЛЕ ПРИ СКАЧИВАНИИ

    def test_download_file_info_owner(self):
        """Владелец может получить информацию о файле перед скачиванием"""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(f"{reverse('files-download', kwargs={'pk': self.file1.id})}?info=true")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.file1.id)
        self.assertEqual(response.data['original_name'], 'file1.txt')

    def test_update_file_comment(self):
        """Обновление комментария файла"""
        self.client.force_authenticate(user=self.user1)

        response = self.client.patch(
            reverse('files-detail', kwargs={'pk': self.file1.id}),
            {'comment': 'Updated comment'}
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.file1.refresh_from_db()
        self.assertEqual(self.file1.comment, 'Updated comment')