from django.utils import timezone
from django.http import HttpResponse, Http404
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils.encoding import escape_uri_path
import os

from .models import File
from .serializers import FileSerializer, PublicFileSerializer
from .permissions import IsOwnerOrAdmin


class FileViewSet(viewsets.ModelViewSet):
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        if self.request.user.is_admin:
            user_id = self.request.query_params.get("user")
            if user_id:
                return File.objects.filter(user=user_id)
            return File.objects.all()
        return File.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def perform_destroy(self, instance):
        instance.file.delete(save=False)
        instance.delete()

    def _get_file_response(self, file_obj, request, is_public=False):
        """Общий метод для формирования ответа с файлом."""
        if request.query_params.get("info") == "true":
            serializer = PublicFileSerializer(file_obj) if is_public else FileSerializer(file_obj)
            return Response(serializer.data)

        file_obj.last_download_at = timezone.now()
        file_obj.save()

        try:
            file_obj.file.open("rb")
        except Exception:
            raise Http404("Файл не найден на сервере")

        response = HttpResponse(file_obj.file, content_type="application/octet-stream")
        response["Content-Disposition"] = (
            f'attachment; filename="{escape_uri_path(file_obj.original_name)}"'
        )
        return response

    @action(detail=True, methods=["get"], url_path="download")
    def download(self, request, pk=None):
        file_obj = self.get_object()  # использует get_queryset и разрешения
        return self._get_file_response(file_obj, request)


class FileDownloadByLinkView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, special_link):
        try:
            file_obj = File.objects.get(special_link=special_link)
        except File.DoesNotExist:
            raise Http404("Специальная ссылка не найдена")

        if not os.path.exists(file_obj.file.path):
            raise Http404("Файл не найден на сервере")

        return FileViewSet()._get_file_response(file_obj, request, is_public=True)
