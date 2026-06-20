from django.http import Http404, HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.encoding import escape_uri_path
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import File
from .permissions import IsOwnerOrAdmin
from .serializers import FileSerializer, PublicFileSerializer


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

    @action(detail=True, methods=["get"], url_path="download")
    def download(self, request, pk=None):
        file_obj = self.get_object()  # использует get_queryset и разрешения

        if request.query_params.get("info") == "true":
            serializer = FileSerializer(file_obj)
            return Response(serializer.data)

        file_obj.last_download_at = timezone.now()
        file_obj.save()

        try:
            file_obj.file.open("rb")
        except Exception:
            raise Http404("Файла не существует")

        response = HttpResponse(file_obj.file, content_type="application/octet-stream")
        response["Content-Disposition"] = (
            f'attachment; filename="{escape_uri_path(file_obj.original_name)}"'
        )
        return response


class FileDownloadByLinkView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, special_link):
        file_obj = get_object_or_404(File, special_link=special_link)

        if request.query_params.get("info") == "true":
            serializer = PublicFileSerializer(file_obj)
            return Response(serializer.data)

        file_obj.last_download_at = timezone.now()
        file_obj.save()

        try:
            file_obj.file.open("rb")
        except Exception:
            raise Http404("Файла не существует")

        response = HttpResponse(file_obj.file, content_type="application/octet-stream")
        response["Content-Disposition"] = (
            f'attachment; filename="{escape_uri_path(file_obj.original_name)}"'
        )

        return response
