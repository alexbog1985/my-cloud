from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"files", views.FileViewSet, basename="files")

urlpatterns = [
    path("", include(router.urls)),
    path(
        "s/<str:special_link>/",
        views.FileDownloadByLinkView.as_view(),
        name="file-download-by-link",
    ),
]
