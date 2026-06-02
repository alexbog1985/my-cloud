import os
import uuid
import string
import random

from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()

def upload_to(instance, filename):
    ext = filename.split('.')[-1]
    filename = f'{uuid.uuid4().hex}.{ext}'
    return os.path.join(instance.user.storage_path, filename)

class File(models.Model):
    original_name = models.CharField(
        'Оригинальное имя',
        max_length=255,
        help_text='Оригинальное имя файла'
    )
    file = models.FileField(
        'Файл',
        upload_to=upload_to,
        help_text='Физическое расположение файла на сервере'
    )
    comment = models.TextField(
        'Комментарий',
        blank=True,
        help_text='Описание или заметка к файлу'
    )
    size = models.BigIntegerField(
        'Размер файла (байт)',
        default=0,
        help_text='Размер файла в байтах'
    )
    upload_at = models.DateTimeField(
        'Дата загрузки',
        auto_now_add=True,
        help_text='Дата и время загрузки',
    )
    last_download_at = models.DateTimeField(
        'Дата последнего скачивания',
        null=True,
        blank=True,
        help_text='Дата и время последнего скачивания файла'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='files',
        help_text='Владелец файла',
    )
    special_link = models.CharField(
        'Специальная ссылка',
        max_length=32,
        unique=True,
        blank=True,
        help_text='Уникальная ссылка для скачивания файла'
    )

    class Meta:
        verbose_name = 'Файл'
        verbose_name_plural = 'Файлы'
        ordering = ['-upload_at',]

    def __str__(self):
        return f"{self.original_name} ({self.user.username})"

    def save(self, *args, **kwargs):
        if not self.pk:
            self.original_name = self.file.name or os.path.basename(self.file.name)
            if not self.special_link:
                self.special_link = self.generate_special_link()

        if self.file:
            try:
                self.file.seek(0, 2)
                self.size = self.file.tell()
                self.file.seek(0)
            except (AttributeError, OSError):
                pass

        super().save(*args, **kwargs)

    def generate_special_link(self):
        characters = string.ascii_letters + string.digits
        while True:
            special_link = ''.join(random.choice(characters) for _ in range(32))
            if not File.objects.filter(special_link=special_link).exists():
                return special_link

    def get_download_filename(self):
        return self.original_name
