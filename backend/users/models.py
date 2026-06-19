from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    is_admin = models.BooleanField("Администратор", default=False)
    storage_path = models.CharField("Путь к папке", max_length=255, unique=True)
    email = models.EmailField("Email", unique=True, null=False, blank=False)
    first_name = models.CharField("Имя", max_length=150, blank=False)
    last_name = models.CharField("Фамилия", max_length=150, blank=False)

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email", "first_name", "last_name"]

    def save(self, *args, **kwargs):
        if not self.storage_path:
            self.storage_path = f"storage/{self.username}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} ({self.get_full_name()})"
