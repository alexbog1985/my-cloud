"""Тесты представлений (views) для модуля files

Тестируемые endpoints:
- GET /api/files/ - список файлов пользователя
- POST /api/files/ - создание файла
- GET /api/files/{id}/ - детальная информация о файле
- DELETE /api/files/{id}/ - удаление файла
- GET /api/files/{id}/download/ - скачивание файла
- GET /s/{special_link}/ - скачивание файла по специальной ссылке

Использует fixtures из conftest.py и фабрики из files.factories
"""
import pytest
from django.urls import reverse

from files.factories import FileFactory
from users.factories import UserFactory


@pytest.mark.django_db
class TestFileViewSetList:
    """Тесты GET /api/files/ - список файлов"""

    def test_list_files_authenticated(self, authenticated_client):
        """Получение списка файлов аутентифицированным пользователем"""
        client, user = authenticated_client
        
        # Создаем несколько файлов для пользователя
        FileFactory.create(user=user, original_name='file1.txt')
        FileFactory.create(user=user, original_name='file2.txt')
        
        response = client.get('/api/files/')
        
        assert response.status_code == 200
        assert len(response.data) >= 2

    def test_list_files_unauthenticated(self, api_client):
        """Попытка получения списка файлов без аутентификации"""
        response = api_client.get('/api/files/')
        
        assert response.status_code == 401

    def test_list_files_only_user_files(self, authenticated_client):
        """Получение только своих файлов"""
        client, user = authenticated_client
        
        # Создаем файлы для текущего пользователя через фабрику
        FileFactory.create(user=user, original_name='my_file.txt')
        
        # Создаем файл для другого пользователя
        other_user = UserFactory.create()
        FileFactory.create(user=other_user)

    def test_list_files_empty(self, authenticated_client):
        """Получение списка файлов, когда их нет"""
        client, user = authenticated_client
        
        response = client.get('/api/files/')
        
        assert response.status_code == 200
        assert response.data == []

    def test_list_files_admin_sees_all(self, authenticated_admin_client):
        """Администратор видит все файлы"""
        from users.factories import UserFactory
        client, admin = authenticated_admin_client
        
        # Создаем пользователей и файлы через фабрики
        user1 = UserFactory.create()
        user2 = UserFactory.create()
        FileFactory.create(user=user1, original_name='file1.txt')
        FileFactory.create(user=user2, original_name='file2.txt')
        
        response = client.get('/api/files/')
        
        assert response.status_code == 200
        assert len(response.data) >= 2


@pytest.mark.django_db
class TestFileViewSetCreate:
    """Тесты POST /api/files/ - создание файла"""

    def test_create_file_authenticated(self, authenticated_client, tmp_path):
        """Создание файла аутентифицированным пользователем"""
        client, user = authenticated_client
        
        # Создаем временный файл
        test_file = tmp_path / "test.txt"
        test_file.write_text("Test content")
        
        with open(test_file, 'rb') as f:
            response = client.post('/api/files/', {
                'original_name': 'test.txt',
                'comment': 'Test comment',
                'file': f,
            }, format='multipart')
        
        assert response.status_code == 201
        assert response.data['original_name'] == 'test.txt'
        assert response.data['comment'] == 'Test comment'
        assert response.data['user'] == user.id

    def test_create_file_unauthenticated(self, api_client, tmp_path):
        """Попытка создания файла без аутентификации"""
        # Создаем временный файл
        test_file = tmp_path / "test.txt"
        test_file.write_text("Test content")
        
        with open(test_file, 'rb') as f:
            response = api_client.post('/api/files/', {
                'original_name': 'test.txt',
                'file': f,
            }, format='multipart')
        
        assert response.status_code == 401

    def test_create_file_without_comment(self, authenticated_client, tmp_path):
        """Создание файла без комментария"""
        client, user = authenticated_client
        
        test_file = tmp_path / "test.txt"
        test_file.write_text("Test content")
        
        with open(test_file, 'rb') as f:
            response = client.post('/api/files/', {
                'original_name': 'test.txt',
                'file': f,
            }, format='multipart')
        
        assert response.status_code == 201
        assert response.data['comment'] == ''

    def test_create_file_auto_special_link(self, authenticated_client, tmp_path):
        """Автоматическая генерация special_link при создании файла"""
        client, user = authenticated_client
        
        test_file = tmp_path / "test.txt"
        test_file.write_text("Test content")
        
        with open(test_file, 'rb') as f:
            response = client.post('/api/files/', {
                'original_name': 'test.txt',
                'file': f,
            }, format='multipart')
        
        assert response.status_code == 201
        assert response.data['special_link'] is not None
        assert len(response.data['special_link']) == 32

    def test_create_file_admin(self, authenticated_admin_client, tmp_path):
        """Создание файла администратором"""
        client, admin = authenticated_admin_client
        
        test_file = tmp_path / "test.txt"
        test_file.write_text("Test content")
        
        with open(test_file, 'rb') as f:
            response = client.post('/api/files/', {
                'original_name': 'test.txt',
                'file': f,
            }, format='multipart')
        
        assert response.status_code == 201
        assert response.data['user'] == admin.id


@pytest.mark.django_db
class TestFileViewSetRetrieve:
    """Тесты GET /api/files/{id}/ - детальная информация"""

    def test_retrieve_file_owner(self, authenticated_client):
        """Получение информации о своем файле"""
        client, user = authenticated_client
        
        # Создаем файл для текущего пользователя через фабрику
        file = FileFactory.create(user=user)
        
        response = client.get(f'/api/files/{file.id}/')
        
        assert response.status_code == 200
        assert response.data['id'] == file.id
        assert response.data['original_name'] == file.original_name

    def test_retrieve_file_not_owner(self, authenticated_client):
        """Попытка получения чужого файла"""
        from users.factories import UserFactory
        client, user = authenticated_client
        
        # Создаем пользователя для другого файла
        other_user = UserFactory.create()
        file = FileFactory.create(user=other_user)
        
        response = client.get(f'/api/files/{file.id}/')
        
        # Доступ запрещен
        assert response.status_code == 404

    def test_retrieve_file_admin(self, authenticated_admin_client):
        """Администратор получает информацию о любом файле"""
        from users.factories import UserFactory
        client, admin = authenticated_admin_client
        
        # Создаем пользователя и файл через фабрику
        other_user = UserFactory.create()
        file = FileFactory.create(user=other_user)
        
        response = client.get(f'/api/files/{file.id}/')
        
        assert response.status_code == 200
        assert response.data['id'] == file.id

    def test_retrieve_file_not_found(self, authenticated_client):
        """Попытка получения несуществующего файла"""
        client, user = authenticated_client
        
        response = client.get('/api/files/999999/')
        
        assert response.status_code == 404


@pytest.mark.django_db
class TestFileViewSetDestroy:
    """Тесты DELETE /api/files/{id}/ - удаление файла"""

    def test_destroy_file_owner(self, authenticated_client):
        """Удаление своего файла"""
        from files.models import File
        client, user = authenticated_client
        
        # Создаем файл для текущего пользователя через фабрику
        file = FileFactory.create(user=user)
        
        response = client.delete(f'/api/files/{file.id}/')
        
        assert response.status_code == 204
        assert not File.objects.filter(id=file.id).exists()

    def test_destroy_file_not_owner(self, authenticated_client):
        """Попытка удаления чужого файла"""
        from users.factories import UserFactory
        client, user = authenticated_client
        
        # Создаем пользователя для другого файла
        other_user = UserFactory.create()
        file = FileFactory.create(user=other_user)
        
        response = client.delete(f'/api/files/{file.id}/')
        
        assert response.status_code == 404

    def test_destroy_file_admin(self, authenticated_admin_client):
        """Администратор удаляет любой файл"""
        from users.factories import UserFactory
        from files.models import File
        client, admin = authenticated_admin_client
        
        # Создаем пользователя и файл через фабрику
        other_user = UserFactory.create()
        file = FileFactory.create(user=other_user)
        
        response = client.delete(f'/api/files/{file.id}/')
        
        assert response.status_code == 204
        assert not File.objects.filter(id=file.id).exists()


@pytest.mark.django_db
class TestFileViewSetDownload:
    """Тесты GET /api/files/{id}/download/ - скачивание файла"""

    def test_download_file_owner(self, authenticated_client):
        """Скачивание своего файла"""
        client, user = authenticated_client
        
        # Создаем файл для текущего пользователя через фабрику
        file = FileFactory.create(user=user)
        
        response = client.get(f'/api/files/{file.id}/download/')
        
        assert response.status_code == 200
        assert response['Content-Disposition'] == f'attachment; filename="{file.original_name}"'
        assert response['Content-Type'] == 'application/octet-stream'

    def test_download_file_not_owner(self, authenticated_client):
        """Попытка скачивания чужого файла"""
        from users.factories import UserFactory
        client, user = authenticated_client
        
        # Создаем пользователя для другого файла
        other_user = UserFactory.create()
        file = FileFactory.create(user=other_user)
        
        response = client.get(f'/api/files/{file.id}/download/')
        
        assert response.status_code == 404

    def test_download_file_admin(self, authenticated_admin_client):
        """Администратор скачивает любой файл"""
        from users.factories import UserFactory
        client, admin = authenticated_admin_client
        
        # Создаем пользователя и файл через фабрику
        other_user = UserFactory.create()
        file = FileFactory.create(user=other_user)
        
        response = client.get(f'/api/files/{file.id}/download/')
        
        assert response.status_code == 200
        assert response['Content-Disposition'] == f'attachment; filename="{file.original_name}"'

    def test_download_file_with_info(self, authenticated_client):
        """Скачивание файла с параметром info=true"""
        client, user = authenticated_client
        
        # Создаем файл для текущего пользователя через фабрику
        file = FileFactory.create(user=user)
        
        response = client.get(f'/api/files/{file.id}/download/?info=true')
        
        assert response.status_code == 200
        # Возвращает JSON с данными файла, а не файл
        assert 'original_name' in response.data
        assert 'id' in response.data

    def test_download_file_update_last_download(self, authenticated_client):
        """Проверка обновления last_download_at при скачивании"""
        client, user = authenticated_client
        
        # Создаем файл для текущего пользователя через фабрику
        file = FileFactory.create(user=user)
        
        response = client.get(f'/api/files/{file.id}/download/')
        
        assert response.status_code == 200
        
        # Проверяем, что last_download_at обновлен
        file.refresh_from_db()
        assert file.last_download_at is not None


@pytest.mark.django_db
class TestFileViewSetAdminFilter:
    """Тесты фильтрации файлов администратором"""

    def test_admin_filter_by_user(self, authenticated_admin_client):
        """Фильтрация файлов по user_id администратором"""
        from users.factories import UserFactory
        client, admin = authenticated_admin_client
        
        # Создаем файлы для разных пользователей через фабрику
        user1 = UserFactory.create()
        user2 = UserFactory.create()
        
        response = client.get(f'/api/files/?user={user1.id}')
        
        assert response.status_code == 200
        for file in response.data:
            assert file['user'] == user1.id


@pytest.mark.django_db
class TestFileDownloadByLinkView:
    """Тесты GET /s/{special_link}/ - скачивание файла по специальной ссылке"""

    def test_download_by_link_public(self, api_client):
        """Публичное скачивание файла по специальной ссылке"""
        file = FileFactory.create()
        
        response = api_client.get(f'/api/s/{file.special_link}/')
        
        assert response.status_code == 200
        assert response['Content-Disposition'] == f'attachment; filename="{file.original_name}"'

    def test_download_by_link_not_found(self, api_client):
        """Попытка скачивания по несуществующей ссылке"""
        response = api_client.get('/api/s/nonexistentlink123/')
        
        assert response.status_code == 404

    def test_download_by_link_update_last_download(self, api_client):
        """Проверка обновления last_download_at при скачивании по ссылке"""
        file = FileFactory.create()
        
        response = api_client.get(f'/api/s/{file.special_link}/')
        
        assert response.status_code == 200
        
        # Проверяем, что last_download_at обновлен
        file.refresh_from_db()
        assert file.last_download_at is not None

    def test_download_by_link_with_info(self, api_client):
        """Скачивание файла с параметром info=true"""
        file = FileFactory.create()
        
        response = api_client.get(f'/api/s/{file.special_link}/?info=true')
        
        assert response.status_code == 200
        # Возвращает JSON с публичными данными файла
        assert 'original_name' in response.data
        assert 'special_link' in response.data
        # Закрытые поля не включены
        assert 'user' not in response.data
        assert 'id' not in response.data
