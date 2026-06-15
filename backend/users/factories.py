import factory
from django.contrib.auth import get_user_model


User = get_user_model()


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
        django_get_or_create = ('username',)
        skip_postgeneration_save = True

    username = factory.Faker('username')
    email = factory.Faker('email')
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    password = factory.PostGenerationMethodCall('set_password', 'TestPass123!')
    is_admin = False

    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        """Override _create to handle password properly"""
        manager = cls._get_manager(model_class)
        return manager.create_user(*args, **kwargs)