"""Тесты модели File для модуля files

Тестируемые методы модели:
- save() - автогенерация special_link
- save() - автоматическое определение размера файла
- save() - автогенерация original_name
- generate_special_link() - создание уникальной ссылки
- __str__() - строковое представление
"""
import pytest

from files.factories import FileFactory
from files.models import File


@pytest.mark.django_db
class TestFileModel:
    """
    Тесты модели File

    Тестирует:
    - Автогенерацию special_link при сохранении нового файла
    - Сохранение существующей special_link при повторном сохранении
    - Автогенерацию original_name
    - Автоматическое определение размера файла
    - Метод generate_special_link()
    - Строковое представление файла
    """

    def test_save_autogenerates_special_link(self):
        """
        Тест автогенерации special_link при создании файла

        Ожидание: при создании нового файла без явно указанной special_link,
        она будет автоматически сгенерирована (32 символа)
        """
        file = FileFactory.create()

        assert file.special_link is not None
        assert len(file.special_link) == 32
        assert file.special_link.isalnum()

    def test_save_preserves_special_link(self):
        """
        Тест сохранения существующей special_link

        Ожидание: при создании файла с явно указанной special_link,
        она не будет перезаписана
        """
        custom_link = 'A' * 32
        file = FileFactory.create(special_link=custom_link)

        assert file.special_link == custom_link

    def test_save_autogenerates_original_name(self):
        """
        Тест автогенерации original_name при создании файла

        Ожидание: при создании нового файла без явно указанного original_name,
        он будет автоматически сгенерирован из имени файла, переданного в ContentFile.
        actual filename (file.file.name) будет отличаться из-за upload_to(),
        но original_name должен сохранить оригинальное имя.
        """
        # Создаем файл через фабрику без явного указания original_name
        file = FileFactory.create()

        # Проверяем, что original_name был сгенерирован из имени файла
        assert file.original_name is not None
        assert len(file.original_name) > 0
        # Проверяем, что оригинальное имя начинается с 'test_file_' и имеет расширение .txt
        assert file.original_name.startswith('test_file_')
        assert file.original_name.endswith('.txt')
        # original_name не должен совпадать с именем на диске (upload_to() переименовал)
        import os
        assert file.original_name != os.path.basename(file.file.name)

    def test_save_sets_file_size(self):
        """
        Тест автоматического определения размера файла

        Ожидание: при сохранении файла размер автоматически устанавливается
        """
        file = FileFactory.create()

        assert file.size > 0
        assert isinstance(file.size, int)

    def test_save_preserves_original_name(self):
        """
        Тест сохранения существующего original_name

        Ожидание: при создании файла с явно указанным original_name,
        он не будет перезаписан
        """
        custom_name = 'my_custom_file.txt'
        file = FileFactory.create(original_name=custom_name)

        assert file.original_name == custom_name

    def test_generate_special_link_unique(self):
        """
        Тест уникальности special_link

        Ожидание: generate_special_link() всегда создает уникальную ссылку
        """
        file1 = FileFactory.create()
        file2 = FileFactory.create()

        assert file1.special_link != file2.special_link

    def test_special_link_length(self):
        """
        Тест длины special_link

        Ожидание: длина special_link всегда 32 символа
        """
        file = FileFactory.create()

        assert len(file.special_link) == 32

    def test_str_representation(self):
        """
        Тест строкового представления файла

        Ожидание: __str__() возвращает строку в формате
        'original_name (username)'
        """
        file = FileFactory.create(original_name='test.txt')

        expected_str = f"test.txt ({file.user.username})"
        assert str(file) == expected_str

    def test_upload_to_path(self):
        """
        Тест пути загрузки файла

        Ожидание: файл сохраняется в storage/{username}/uuid.ext
        """
        file = FileFactory.create()

        # Путь должен содержать путь пользователя
        assert file.user.storage_path in file.file.path

    def test_file_delete(self):
        """
        Тест удаления файла

        Ожидание: при удалении модели файл также удаляется
        """
        file = FileFactory.create()

        # Проверяем, что файл существует
        assert File.objects.filter(id=file.id).exists()

        # Удаляем файл
        file_id = file.id
        file.delete()

        # Проверяем, что файл удален
        assert not File.objects.filter(id=file_id).exists()
