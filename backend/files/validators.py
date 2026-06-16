"""Валидаторы для файлов

Используются для проверки размера, расширения и MIME-типа файлов.
"""

import os
import mimetypes
from django.core.exceptions import ValidationError


# Максимальный размер файла (100 МБ)
MAX_FILE_SIZE = 100 * 1024 * 1024

# Разрешенные расширения файлов
ALLOWED_EXTENSIONS = [
    'txt', 'pdf', 'doc', 'docx', 'odt',
    'png', 'jpg', 'jpeg', 'gif', 'bmp',
    'mp3', 'wav', 'ogg',
    'mp4', 'avi', 'mov',
    'zip', 'tar', 'gz', 'rar',
    'csv', 'json', 'xml', 'yml', 'yaml',
]

# MIME-типы, которые считаются безопасными
ALLOWED_CONTENT_TYPES = [
    'text/plain',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.oasis.opendocument.text',
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/bmp',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'video/mp4',
    'video/x-msvideo',
    'video/quicktime',
    'application/zip',
    'application/x-tar',
    'application/x-gzip',
    'application/x-rar-compressed',
    'text/csv',
    'application/json',
    'application/xml',
    'application/yaml',
]


def validate_file_size(value):
    """
    Валидатор размера файла.
    
    Проверяет, что размер файла не превышает MAX_FILE_SIZE (100 МБ).
    
    Args:
        value: FileField с файлом
        
    Raises:
        ValidationError: Если размер файла больше MAX_FILE_SIZE
    """
    if value.size > MAX_FILE_SIZE:
        raise ValidationError(
            f'Размер файла не должен превышать {MAX_FILE_SIZE // (1024 * 1024)} МБ'
        )
    return value


def validate_file_extension(value):
    """
    Валидатор расширения файла.
    
    Проверяет, что расширение файла находится в списке разрешенных.
    
    Args:
        value: FileField с файлом
        
    Raises:
        ValidationError: Если расширение файла не разрешено
    """
    ext = os.path.splitext(value.name)[1].lower().lstrip('.')
    
    if not ext:
        raise ValidationError('Файл должен иметь расширение')
    
    if ext not in ALLOWED_EXTENSIONS:
        raise ValidationError(
            f'Недопустимое расширение файла. Разрешенные: {", ".join(ALLOWED_EXTENSIONS)}'
        )
    
    return value


def validate_file_content_type(value):
    """
    Валидатор MIME-типа файла.
    
    Проверяет, что MIME-тип файла находится в списке разрешенных.
    
    Args:
        value: FileField с файлом
        
    Raises:
        ValidationError: Если MIME-тип файла не разрешен
    """
    # Определяем MIME-тип по расширению
    mime_type, _ = mimetypes.guess_type(value.name)
    
    # Если не удалось определить по расширению, пытаемся по содержимому
    if mime_type is None:
        try:
            # Читаем первые байта файла для определения типа
            value.open('rb')
            sample = value.read(1024)
            value.seek(0)
            
            # Простая проверка по сигнатуре файла
            if sample.startswith(b'%PDF'):
                mime_type = 'application/pdf'
            elif sample.startswith(b'\x89PNG'):
                mime_type = 'image/png'
            elif sample.startswith(b'PK'):
                mime_type = 'application/zip'
            else:
                mime_type = 'application/octet-stream'
        except Exception:
            mime_type = 'application/octet-stream'
    
    if mime_type not in ALLOWED_CONTENT_TYPES:
        raise ValidationError(
            f'Недопустимый тип файла. Разрешенные типы: {", ".join(ALLOWED_CONTENT_TYPES)}'
        )
    
    return value


def validate_file(value):
    """
    Комбинированный валидатор для файла.
    
    Выполняет все проверки:
    - Размер файла
    - Расширение файла
    - MIME-тип файла
    
    Args:
        value: FileField с файлом
        
    Returns:
        value: Валидное значение
        
    Raises:
        ValidationError: Если любая из проверок не пройдена
    """
    value = validate_file_size(value)
    value = validate_file_extension(value)
    value = validate_file_content_type(value)
    return value
