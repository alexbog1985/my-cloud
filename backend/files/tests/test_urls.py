"""Тесты URL маршрутов для модуля files

Тестируемые endpoints:
- GET /api/files/ - список файлов пользователя
- POST /api/files/ - создание файла
- GET /api/files/{id}/ - детальная информация о файле
- DELETE /api/files/{id}/ - удаление файла
- GET /api/files/{id}/download/ - скачивание файла
- GET /s/{special_link}/ - скачивание файла по специальной ссылке

Использует fixtures из conftest.py
"""
import pytest
from django.urls import reverse, resolve


# ============ Тесты URL маршрутов ============

class TestFileUrls:
    """Тесты URL маршрутов для файлов"""

    def test_files_list_url(self):
        """GET /api/files/ - список файлов пользователя (ListAPIView)"""
        assert reverse('files-list') == '/api/files/'
        assert resolve('/api/files/').view_name == 'files-list'

    def test_files_detail_url(self):
        """GET /api/files/{id}/ - DetailView (RetrieveDestroyAPIView)"""
        assert reverse('files-detail', kwargs={'pk': 1}) == '/api/files/1/'
        assert resolve('/api/files/1/').view_name == 'files-detail'

    def test_files_download_url(self):
        """GET /api/files/{id}/download/ - скачивание файла"""
        assert reverse('files-download', kwargs={'pk': 1}) == '/api/files/1/download/'
        assert resolve('/api/files/1/download/').view_name == 'files-download'

    def test_file_download_by_link_url(self):
        """GET /s/{special_link}/ - скачивание файла по специальной ссылке"""
        assert reverse('file-download-by-link', kwargs={'special_link': 'abc123'}) == '/s/abc123/'
        assert resolve('/s/abc123/').view_name == 'file-download-by-link'


# ============ Тесты URL реверсов с authenticated client ============

@pytest.mark.django_db
class TestFileUrlAccess:
    """Тесты доступа к URL с аутентификацией"""

    def test_files_list_url_accessible(self, authenticated_client):
        """GET /api/files/ - доступен с аутентификацией"""
        client, user = authenticated_client
        url = reverse('files-list')
        response = client.get(url)

        assert response.status_code == 200

    def test_files_detail_url_accessible(self, authenticated_client):
        """GET /api/files/{id}/ - доступен с аутентификацией"""
        from files.factories import FileFactory
        client, user = authenticated_client
        
        file = FileFactory.create(user=user)
        url = reverse('files-detail', kwargs={'pk': file.id})
        response = client.get(url)

        assert response.status_code == 200
        assert response.data['id'] == file.id

    def test_files_download_url_accessible(self, authenticated_client):
        """GET /api/files/{id}/download/ - доступен с аутентификацией"""
        from files.factories import FileFactory
        client, user = authenticated_client
        
        file = FileFactory.create(user=user)
        url = reverse('files-download', kwargs={'pk': file.id})
        response = client.get(url)

        assert response.status_code == 200

    def test_file_download_by_link_url_accessible(self, api_client):
        """GET /s/{special_link}/ - доступен без аутентификации (публичный endpoint)"""
        from files.factories import FileFactory
        file = FileFactory.create()
        url = reverse('file-download-by-link', kwargs={'special_link': file.special_link})
        response = api_client.get(url)

        assert response.status_code == 200

    def test_files_detail_url_not_owner(self, authenticated_client):
        """GET /api/files/{id}/ - доступ запрещен для чужого файла"""
        from files.factories import FileFactory
        from users.factories import UserFactory
        client, user = authenticated_client
        
        other_user = UserFactory.create()
        file = FileFactory.create(user=other_user)
        url = reverse('files-detail', kwargs={'pk': file.id})
        response = client.get(url)

        assert response.status_code == 404

    def test_files_download_url_not_owner(self, authenticated_client):
        """GET /api/files/{id}/download/ - доступ запрещен для чужого файла"""
        from files.factories import FileFactory
        from users.factories import UserFactory
        client, user = authenticated_client
        
        other_user = UserFactory.create()
        file = FileFactory.create(user=other_user)
        url = reverse('files-download', kwargs={'pk': file.id})
        response = client.get(url)

        assert response.status_code == 404

    def test_files_list_with_filter(self, authenticated_admin_client):
        """GET /api/files/?user={id}/ - фильтрация файлов администратором"""
        from files.factories import FileFactory
        from users.factories import UserFactory
        client, admin = authenticated_admin_client
        
        user = UserFactory.create()
        FileFactory.create(user=user)
        
        url = reverse('files-list') + f'?user={user.id}'
        response = client.get(url)

        assert response.status_code == 200
        for file in response.data:
            assert file['user'] == user.id

    def test_files_destroy_url_accessible(self, authenticated_client):
        """DELETE /api/files/{id}/ - доступен для владельца файла"""
        from files.factories import FileFactory
        client, user = authenticated_client
        
        file = FileFactory.create(user=user)
        url = reverse('files-detail', kwargs={'pk': file.id})
        response = client.delete(url)

        assert response.status_code == 204

    def test_files_destroy_url_not_owner(self, authenticated_client):
        """DELETE /api/files/{id}/ - доступ запрещен для чужого файла"""
        from files.factories import FileFactory
        from users.factories import UserFactory
        client, user = authenticated_client
        
        other_user = UserFactory.create()
        file = FileFactory.create(user=other_user)
        url = reverse('files-detail', kwargs={'pk': file.id})
        response = client.delete(url)

        assert response.status_code == 404

    def test_files_destroy_url_admin(self, authenticated_admin_client):
        """DELETE /api/files/{id}/ - доступен администратору"""
        from files.factories import FileFactory
        from users.factories import UserFactory
        client, admin = authenticated_admin_client
        
        user = UserFactory.create()
        file = FileFactory.create(user=user)
        url = reverse('files-detail', kwargs={'pk': file.id})
        response = client.delete(url)

        assert response.status_code == 204

    def test_files_create_url_accessible(self, authenticated_client, tmp_path):
        """POST /api/files/ - доступен с аутентификацией"""
        client, user = authenticated_client
        
        test_file = tmp_path / "test.txt"
        test_file.write_text("Test content")
        
        url = reverse('files-list')
        with open(test_file, 'rb') as f:
            response = client.post(url, {
                'original_name': 'test.txt',
                'file': f,
            }, format='multipart')

        assert response.status_code == 201

    def test_files_create_url_unauthenticated(self, api_client, tmp_path):
        """POST /api/files/ - доступ запрещен без аутентификации"""
        test_file = tmp_path / "test.txt"
        test_file.write_text("Test content")
        
        url = reverse('files-list')
        with open(test_file, 'rb') as f:
            response = api_client.post(url, {
                'original_name': 'test.txt',
                'file': f,
            }, format='multipart')

        assert response.status_code == 401

    def test_files_detail_url_not_found(self, authenticated_client):
        """GET /api/files/{id}/ - 404 для несуществующего файла"""
        url = reverse('files-detail', kwargs={'pk': 999999})
        response = authenticated_client[0].get(url)

        assert response.status_code == 404
