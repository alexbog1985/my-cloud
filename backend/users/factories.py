import factory
from django.contrib.auth import get_user_model


User = get_user_model()


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
        django_get_or_create = ('username',)

    username = factory.Faker('user_name')
    email = factory.Faker('email')
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    password = 'TestPass123!'
    is_admin = False

    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        """Override _create to handle password properly"""
        manager = cls._get_manager(model_class)
        # Извлекаем пароль из kwargs
        password = kwargs.pop('password', cls.password)
        # Создаем пользователя с незахэшированным паролем
        user = manager.create_user(*args, **kwargs)
        # Устанавливаем захэшированный пароль
        user.set_password(password)
        user.save()
        return user


class AdminUserFactory(factory.django.DjangoModelFactory):
    """Фабрика для создания администраторов"""
    class Meta:
        model = User
        django_get_or_create = ('username',)

    username = factory.Faker('user_name')
    email = factory.Faker('email')
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    password = 'AdminPass123!'
    is_admin = True

    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        """Override _create to handle password properly"""
        manager = cls._get_manager(model_class)
        # Извлекаем пароль из kwargs
        password = kwargs.pop('password', cls.password)
        # Создаем пользователя с незахэшированным паролем
        user = manager.create_user(*args, **kwargs)
        # Устанавливаем захэшированный пароль
        user.set_password(password)
        user.save()
        return user
