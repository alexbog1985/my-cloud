from django.contrib.auth import get_user_model
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from users.serializers import (LoginSerializer, RegisterSerializer,
                               UserSerializer)

User = get_user_model()


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get"], url_path="me")
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="all")
    def list_all(self, request):
        if not request.user.is_admin:
            return Response(
                {"error": "Недостаточно прав"},
                status=status.HTTP_403_FORBIDDEN
            )
        users = User.objects.all()
        serializer = self.get_serializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["delete"], url_path="delete")
    def delete_user(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
            # Проверка: нельзя удалять самого себя
            if user == request.user:
                return Response(
                    {"error": "Нельзя удалить самого себя"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            # Проверка прав только для операций над другими пользователями
            if not request.user.is_admin:
                return Response(
                    {"error": "Недостаточно прав"},
                    status=status.HTTP_403_FORBIDDEN
                )
            user.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response(
                {"error": "Пользователь не найден"},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=["put"], url_path="toggle-admin")
    def toggle_admin(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
            # Проверка: нельзя менять свои права
            if user == request.user:
                return Response(
                    {"error": "Нельзя изменить свои права"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            # Проверка прав только для операций над другими пользователями
            if not request.user.is_admin:
                return Response(
                    {"error": "Недостаточно прав"},
                    status=status.HTTP_403_FORBIDDEN
                )
            user.is_admin = not user.is_admin
            user.save()
            return Response(
                UserSerializer(user).data, status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            return Response(
                {"error": "Пользователь не найден"},
                status=status.HTTP_404_NOT_FOUND
            )


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Возвращаем токены и данные пользователя
            # в стандартизированном формате
            return Response(
                {
                    "access": user.access_token,
                    "refresh": user.refresh_token,
                    "user": UserSerializer(user).data,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response(status=status.HTTP_403_FORBIDDEN)
