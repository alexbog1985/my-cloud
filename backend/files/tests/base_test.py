import os
import shutil
from pathlib import Path
from django.conf import settings
from django.test import TestCase


class BaseTestCase(TestCase):
    """Базовый класс для тестов с автоматической очисткой медиа-файлов"""

    @classmethod
    def setUpClass(cls):
        """Сохраняем список существующих файлов и очищаем media перед началом тестов"""
        super().setUpClass()

        cls.media_root = Path(settings.MEDIA_ROOT)
        cls.existing_files = set()

        if cls.media_root.exists():
            for path in cls.media_root.rglob("*"):
                if path.is_file():
                    cls.existing_files.add(path)

        try:
            if cls.media_root.exists():
                for item in cls.media_root.iterdir():
                    if item.is_file():
                        item.unlink()
                    elif item.is_dir():
                        shutil.rmtree(item)
        except Exception:
            pass

    def setUp(self):
        """Сохраняем список существующих файлов перед каждым тестом"""
        super().setUp()

        self.test_files = set()

        if self.media_root.exists():
            for path in self.media_root.rglob("*"):
                if path.is_file():
                    self.test_files.add(path)

    def tearDown(self):
        """Удаляем новые файлы, созданные во время теста"""
        if self.media_root.exists():
            current_files = set()
            for path in self.media_root.rglob("*"):
                if path.is_file():
                    current_files.add(path)

            new_files = current_files - self.test_files
            for file_path in new_files:
                try:
                    file_path.unlink()
                    self._remove_empty_dirs(file_path.parent)
                except Exception:
                    pass

            self._remove_empty_dirs(self.media_root)

        super().tearDown()

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
