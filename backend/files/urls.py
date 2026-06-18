from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import FileDownloadByLinkView

router = DefaultRouter()
router.register(r'files', views.FileViewSet, basename='files')

urlpatterns = [
    path('', include(router.urls)),
    # Публичная ссылка для скачивания файла
    path('s/<str:special_link>/', FileDownloadByLinkView.as_view(), name='file-download-by-link'),
]
