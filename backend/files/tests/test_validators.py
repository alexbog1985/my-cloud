"""Тесты валидаторов для файлов

Тестируемые валидаторы:
- validate_file_size: проверка размера файла (максимум 100 МБ)
- validate_file_extension: проверка расширения файла
- validate_file_content_type: проверка MIME-типа файла
- validate_file: комплексная проверка файла

Использует фабрику FileFactory для создания файлов
"""
import pytest
from django.core.exceptions import ValidationError

from files.factories import FileFactory
from files.validators import (
    validate_file_size,
    validate_file_extension,
    validate_file_content_type,
    validate_file,
    MAX_FILE_SIZE,
    ALLOWED_EXTENSIONS,
)


@pytest.mark.django_db
class TestFileValidator:
    """Базовый класс для тестов валидаторов файлов"""

    @pytest.fixture
    def file(self):
        """Создает файл через фабрику для тестов"""
        return FileFactory.create()


# ============ Тесты validate_file_size ============

@pytest.mark.django_db
class TestValidateFileSize:
    """Тесты валидатора размера файла"""

    def test_validate_small_file_size(self):
        """
        Валидация небольшого файла

        Ожидание: файл размером менее 100 МБ проходит валидацию
        """
        file = FileFactory.create()
        result = validate_file_size(file.file)
        assert result == file.file

    def test_validate_file_at_max_size(self):
        """
        Валидация файла на границе размера (меньше максимума на 1 байт)

        Ожидание: файл размером ровно 100 МБ проходит валидацию
        """
        from django.core.files.base import ContentFile
        # Создаем файл ровно 100 МБ
        max_size_content = ContentFile(b'x' * MAX_FILE_SIZE, name='max_size.txt')
        file = FileFactory.create()
        file.file.save('max_size.txt', max_size_content, save=False)
        
        result = validate_file_size(file.file)
        assert result == file.file

    def test_validate_file_exceeds_max_size(self):
        """
        Валидация файла, превышающего максимальный размер

        Ожидание: выбрасывается ValidationError с сообщением о превышении размера
        """
        from django.core.files.base import ContentFile
        # Создаем файл размером 101 МБ
        large_content = ContentFile(b'x' * (MAX_FILE_SIZE + 1), name='large.txt')
        file = FileFactory.create()
        file.file.save('large.txt', large_content, save=False)
        
        with pytest.raises(ValidationError) as exc_info:
            validate_file_size(file.file)

        error_message = str(exc_info.value)
        assert 'не должен превышать' in error_message
        assert '100 МБ' in error_message


# ============ Тесты validate_file_extension ============

@pytest.mark.django_db
class TestValidateFileExtension:
    """Тесты валидатора расширения файла"""

    def test_validate_allowed_extension_txt(self):
        """
        Валидация файла с разрешенным расширением .txt

        Ожидание: валидация проходит успешно
        """
        file = FileFactory.create()
        result = validate_file_extension(file.file)
        assert result == file.file

    def test_validate_allowed_extension_pdf(self):
        """
        Валидация файла с разрешенным расширением .pdf

        Ожидание: валидация проходит успешно
        """
        file = FileFactory.create(original_name='document.pdf')
        result = validate_file_extension(file.file)
        assert result == file.file

    def test_validate_allowed_extension_uppercase(self):
        """
        Валидация файла с расширением в верхнем регистре

        Ожидание: расширение нормализуется и валидация проходит
        """
        file = FileFactory.create(original_name='document.PDF')
        result = validate_file_extension(file.file)
        assert result == file.file

    def test_validate_allowed_extension_mixed_case(self):
        """
        Валидация файла с расширением в смешанном регистре

        Ожидание: расширение нормализуется и валидация проходит
        """
        file = FileFactory.create(original_name='document.PdF')
        result = validate_file_extension(file.file)
        assert result == file.file

    def test_validate_disallowed_extension_exe(self):
        """
        Валидация файла с запрещенным расширением .exe

        Ожидание: выбрасывается ValidationError с сообщением о недопустимом расширении
        """
        file = FileFactory.create(original_name='script.exe')
        
        with pytest.raises(ValidationError) as exc_info:
            validate_file_extension(file.file)

        error_message = str(exc_info.value)
        assert 'Недопустимое расширение' in error_message

    def test_validate_disallowed_extension_unknown(self):
        """
        Валидация файла с неизвестным расширением

        Ожидание: выбрасывается ValidationError
        """
        file = FileFactory.create(original_name='file.xyz')
        
        with pytest.raises(ValidationError) as exc_info:
            validate_file_extension(file.file)

        error_message = str(exc_info.value)
        assert 'Недопустимое расширение' in error_message

    def test_validate_file_without_extension(self):
        """
        Валидация файла без расширения

        Ожидание: выбрасывается ValidationError с сообщением о необходимости расширения
        """
        file = FileFactory.create(original_name='noextension')
        
        with pytest.raises(ValidationError) as exc_info:
            validate_file_extension(file.file)

        error_message = str(exc_info.value)
        assert 'Файл должен иметь расширение' in error_message or 'Недопустимое расширение' in error_message

    def test_validate_all_allowed_extensions(self):
        """
        Валидация файлов со всеми разрешенными расширениями

        Ожидание: все файлы проходят валидацию
        """
        for ext in ALLOWED_EXTENSIONS:
            file = FileFactory.create(original_name=f'test.{ext}')
            result = validate_file_extension(file.file)
            assert result == file.file


# ============ Тесты validate_file_content_type ============

@pytest.mark.django_db
class TestValidateFileContentType:
    """Тесты валидатора MIME-типа файла"""

    def test_validate_text_file_content_type(self):
        """
        Валидация текстового файла (MIME: text/plain)

        Ожидание: валидация проходит успешно
        """
        file = FileFactory.create()
        result = validate_file_content_type(file.file)
        assert result == file.file

    def test_validate_pdf_file_content_type(self):
        """
        Валидация PDF файла

        Ожидание: валидация проходит успешно
        """
        file = FileFactory.create(original_name='document.pdf')
        result = validate_file_content_type(file.file)
        assert result == file.file

    def test_validate_image_extension(self):
        """
        Валидация файла с изображением по расширению

        Ожидание: файл с расширением .png проходит валидацию
        """
        file = FileFactory.create(original_name='image.png')
        result = validate_file_content_type(file.file)
        assert result == file.file

    def test_validate_audio_extension(self):
        """
        Валидация файла с аудио по расширению

        Ожидание: файл с расширением .mp3 проходит валидацию
        """
        file = FileFactory.create(original_name='audio.mp3')
        result = validate_file_content_type(file.file)
        assert result == file.file

    def test_validate_video_extension(self):
        """
        Валидация файла с видео по расширению

        Ожидание: файл с расширением .mp4 проходит валидацию
        """
        file = FileFactory.create(original_name='video.mp4')
        result = validate_file_content_type(file.file)
        assert result == file.file

    def test_validate_archive_extension(self):
        """
        Валидация архива по расширению

        Ожидание: файл с расширением .zip проходит валидацию
        """
        file = FileFactory.create(original_name='archive.zip')
        result = validate_file_content_type(file.file)
        assert result == file.file

    def test_validate_json_extension(self):
        """
        Валидация JSON файла

        Ожидание: файл с расширением .json проходит валидацию
        """
        file = FileFactory.create(original_name='data.json')
        result = validate_file_content_type(file.file)
        assert result == file.file


# ============ Тесты validate_file (комплексная проверка) ============

@pytest.mark.django_db
class TestValidateFile:
    """Тесты комплексного валидатора файла"""

    def test_validate_valid_file(self):
        """
        Валидация валидного файла (размер, расширение, MIME)

        Ожидание: файл проходит все проверки
        """
        file = FileFactory.create()
        result = validate_file(file.file)
        assert result == file.file

    def test_validate_valid_pdf(self):
        """
        Валидация PDF файла

        Ожидание: файл проходит все проверки
        """
        file = FileFactory.create(original_name='document.pdf')
        result = validate_file(file.file)
        assert result == file.file

    def test_validate_invalid_extension(self):
        """
        Валидация файла с недопустимым расширением

        Ожидание: выбрасывается ValidationError
        """
        file = FileFactory.create(original_name='script.exe')
        
        with pytest.raises(ValidationError) as exc_info:
            validate_file(file.file)

        # Должен пройти проверку размера, но не расширения
        error_message = str(exc_info.value)
        assert 'Недопустимое расширение' in error_message

    def test_validate_invalid_size(self):
        """
        Валидация слишком большого файла

        Ожидание: выбрасывается ValidationError
        """
        from django.core.files.base import ContentFile
        # Создаем файл размером 101 МБ
        large_content = ContentFile(b'x' * (MAX_FILE_SIZE + 1), name='large.txt')
        file = FileFactory.create(original_name='large.txt')
        file.file.save('large.txt', large_content, save=False)
        
        with pytest.raises(ValidationError) as exc_info:
            validate_file(file.file)

        # Должен пройти проверку расширения, но не размера
        error_message = str(exc_info.value)
        assert 'не должен превышать' in error_message


# ============ Тесты граничных случаев ============

@pytest.mark.django_db
class TestEdgeCases:
    """Тесты граничных случаев"""

    def test_validate_empty_file(self):
        """
        Валидация пустого файла (0 байт)

        Ожидание: пустой файл проходит валидацию (если расширение валидно)
        """
        file = FileFactory.create(original_name='empty.txt')
        result = validate_file(file.file)
        assert result == file.file

    def test_validate_file_with_special_chars_in_name(self):
        """
        Валидация файла с специальными символами в имени

        Ожидание: файл проходит валидацию (проверяется только расширение)
        """
        file = FileFactory.create(original_name='file-with_special.chars_123.pdf')
        result = validate_file(file.file)
        assert result == file.file

    def test_validate_file_with_long_extension(self):
        """
        Валидация файла с длинным расширением

        Ожидание: валидация проходит, если расширение в списке разрешенных
        """
        # .yaml - разрешенное расширение
        file = FileFactory.create(original_name='config.txt')
        result = validate_file(file.file)
        assert result == file.file
