from datetime import timedelta
from pathlib import Path
from decouple import config as env_config

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env_config("SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env_config("DEBUG", default=False, cast=bool)

ALLOWED_HOSTS = env_config("ALLOWED_HOSTS", default="").split(",")


# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django_vite",
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "users",
    "files",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "mycloud.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "mycloud.wsgi.application"


# Database
# https://docs.djangoproject.com/en/6.0/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": env_config("DB_ENGINE", default="django.db.backends.sqlite3"),
        "NAME": env_config("DB_NAME", default=BASE_DIR / "db.sqlite3"),
        "USER": env_config("DB_USER", default=""),
        "PASSWORD": env_config("DB_PASSWORD", default=""),
        "HOST": env_config("DB_HOST", default=""),
        "PORT": env_config("DB_PORT", default=""),
    }
}


# Password validation
# https://docs.djangoproject.com/en/6.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
    {
        "NAME": "users.password_validation.CustomPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/6.0/topics/i18n/

LANGUAGE_CODE = "ru-ru"

TIME_ZONE = "Europe/Moscow"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/6.0/howto/static-files/

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# Для разработки: ищем статические файлы в frontend/dist
FRONTEND_BUILD_DIR = BASE_DIR.parent / "frontend" / "dist"

if FRONTEND_BUILD_DIR.exists():
    STATICFILES_DIRS = [FRONTEND_BUILD_DIR]
else:
    STATICFILES_DIRS = []

# Django Vite
DJANGO_VITE = {
    "default": {},
}

# Media files
MEDIA_URL = "/media/"
MEDIA_ROOT = env_config("MEDIA_ROOT", default=BASE_DIR / "media")

# File upload settings
MAX_FILE_SIZE = env_config("MAX_FILE_SIZE", default=100, cast=int)  # MB

# DRF
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "NON_FIELD_ERRORS_KEY": "error",
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": True,
}

# CORS
CORS_ALLOWED_ORIGINS = env_config("CORS_ALLOWED_ORIGINS", default="").split(",")
if CORS_ALLOWED_ORIGINS and CORS_ALLOWED_ORIGINS[0] != "":
    CORS_ALLOWED_ORIGINS = [origin.strip() for origin in CORS_ALLOWED_ORIGINS]
else:
    CORS_ALLOWED_ORIGINS = []

# login url
LOGIN_REDIRECT_URL = "/login/"

# User model
AUTH_USER_MODEL = "users.User"

# LOGGING
# Logging configuration
# https://docs.djangoproject.com/en/6.0/topics/logging/
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "console": {
            "format": "[%(asctime)s] %(levelname)s %(name)s: %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "console",
            "stream": "ext://sys.stderr",  # Выводить в stderr для Docker
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "DEBUG",  # Уровень DEBUG для вывода всех логов
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
        "mycloud": {
            "handlers": ["console"],
            "level": "DEBUG",
            "propagate": True,
        },
    },
}
