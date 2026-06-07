import os
import shutil
from pathlib import Path
from django.conf import settings
from django.test import TestCase


class BaseTestCase(TestCase):
    """Базовый класс для тестов с автоматической очисткой медиа-файлов"""

    def setUp(self):
        """Сохраняем список существующих файлов перед тестом"""
        super().setUp()
        self.media_root = Path(settings.MEDIA_ROOT)
        self.existing_files = set()

        if self.media_root.exists():
            for path in self.media_root.rglob('*'):
                if path.is_file():
                    self.existing_files.add(path)

    def tearDown(self):
        """Удаляем новые файлы, созданные во время теста"""
        super().tearDown()

        # Проверяем, что media_root был инициализирован
        if not hasattr(self, 'media_root'):
            return

        if self.media_root.exists():
            current_files = set()
            for path in self.media_root.rglob('*'):
                if path.is_file():
                    current_files.add(path)

            # Удаляем файлы, которые появились во время теста
            new_files = current_files - self.existing_files
            for file_path in new_files:
                try:
                    file_path.unlink()
                    # Удаляем пустые родительские директории
                    self._remove_empty_dirs(file_path.parent)
                except Exception:
                    pass

    def _remove_empty_dirs(self, dir_path: Path):
        """Удаляет пустые директории рекурсивно"""
        if not dir_path or not dir_path.exists():
            return

        # Рекурсивно удаляем пустые директории
        try:
            for root, dirs, files in os.walk(str(dir_path), topdown=False):
                for dir_name in dirs:
                    dir_full_path = Path(root) / dir_name
                    try:
                        if not any(dir_full_path.iterdir()):
                            dir_full_path.rmdir()
                    except Exception:
                        pass
        except Exception:
            pass
