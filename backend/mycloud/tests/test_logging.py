from django.test import TestCase
from django.conf import settings
import logging


class LoggingConfigTest(TestCase):
    """Тесты конфигурации логирования"""

    def test_logging_config_exists(self):
        """Проверка, что настройка LOGGING существует"""
        self.assertIn(
            "LOGGING", dir(settings), "Настройка LOGGING отсутствует в settings.py"
        )

    def test_logging_formatters(self):
        """Проверка форматеров логирования"""
        logging_config = settings.LOGGING
        self.assertIn(
            "formatters",
            logging_config,
            "Отсутствуют форматеры в настройках логирования",
        )
        self.assertIn(
            "console", logging_config["formatters"], "Отсутствует форматер 'console'"
        )
        self.assertIn(
            "format",
            logging_config["formatters"]["console"],
            "Отсутствует формат форматера 'console'",
        )

    def test_logging_handlers(self):
        """Проверка обработчиков логирования"""
        logging_config = settings.LOGGING
        self.assertIn(
            "handlers",
            logging_config,
            "Отсутствуют обработчики в настройках логирования",
        )
        self.assertIn(
            "console", logging_config["handlers"], "Отсутствует обработчик 'console'"
        )
        self.assertEqual(
            logging_config["handlers"]["console"]["class"],
            "logging.StreamHandler",
            "Обработчик 'console' должен быть StreamHandler",
        )
        self.assertEqual(
            logging_config["handlers"]["console"]["formatter"],
            "console",
            "Обработчик 'console' должен использовать форматер 'console'",
        )

    def test_logging_root_logger(self):
        """Проверка корневого логгера"""
        logging_config = settings.LOGGING
        self.assertIn("root", logging_config, "Отсутствует корневой логгер")
        self.assertIn(
            "handlers", logging_config["root"], "Корневой логгер не имеет обработчиков"
        )
        self.assertIn(
            "console",
            logging_config["root"]["handlers"],
            "Корневой логгер не имеет обработчика 'console'",
        )
        self.assertIn(
            "level", logging_config["root"], "Корневой логгер не имеет уровня"
        )

    def test_logging_django_logger(self):
        """Проверка логгера Django"""
        logging_config = settings.LOGGING
        self.assertIn("loggers", logging_config, "Отсутствуют логгеры в настройках")
        self.assertIn(
            "django", logging_config["loggers"], "Отсутствует логгер 'django'"
        )
        self.assertIn(
            "handlers",
            logging_config["loggers"]["django"],
            "Логгер 'django' не имеет обработчиков",
        )
        self.assertIn(
            "console",
            logging_config["loggers"]["django"]["handlers"],
            "Логгер 'django' не имеет обработчика 'console'",
        )

    def test_logging_mycloud_logger(self):
        """Проверка логгера mycloud (нашего приложения)"""
        logging_config = settings.LOGGING
        self.assertIn(
            "mycloud", logging_config["loggers"], "Отсутствует логгер 'mycloud'"
        )
        self.assertIn(
            "handlers",
            logging_config["loggers"]["mycloud"],
            "Логгер 'mycloud' не имеет обработчиков",
        )
        self.assertIn(
            "console",
            logging_config["loggers"]["mycloud"]["handlers"],
            "Логгер 'mycloud' не имеет обработчика 'console'",
        )
        self.assertEqual(
            logging_config["loggers"]["mycloud"]["level"],
            "DEBUG",
            "Логгер 'mycloud' должен иметь уровень DEBUG",
        )

    def test_logging_format_contains_datetime(self):
        """Проверка, что формат содержит дату и время"""
        logging_config = settings.LOGGING
        format_string = logging_config["formatters"]["console"]["format"]
        self.assertIn(
            "%(asctime)s",
            format_string,
            "Формат логов должен содержать дату и время (asctime)",
        )
        self.assertIn(
            "%(levelname)s",
            format_string,
            "Формат логов должен содержать уровень (levelname)",
        )
        self.assertIn(
            "%(name)s",
            format_string,
            "Формат логов должен содержать имя логгера (name)",
        )

    def test_console_handler_output_stream(self):
        """Проверка, что обработчик выводит в консоль"""
        logging_config = settings.LOGGING
        handler = logging_config["handlers"]["console"]
        self.assertEqual(
            handler["class"],
            "logging.StreamHandler",
            "Должен использоваться StreamHandler для консольного вывода",
        )
