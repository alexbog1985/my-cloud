from django.contrib.auth import get_user_model
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from users.serializers import UserSerializer, RegisterSerializer, LoginSerializer

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
                {"error": "Недостаточно прав"}, status=status.HTTP_403_FORBIDDEN
            )
        users = User.objects.all()
        serializer = self.get_serializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["delete"], url_path="delete")
    def delete_user(self, request, pk=None):
        if not request.user.is_admin:
            return Response(
                {"error": "Недостаточно прав"}, status=status.HTTP_403_FORBIDDEN
            )

        try:
            user = User.objects.get(pk=pk)
            if user == request.user:
                return Response(
                    {"error": "Нельзя удалить самого себя"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response(
                {"error": "Пользователь не найден"}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=["put"], url_path="toggle-admin")
    def toggle_admin(self, request, pk=None):
        if not request.user.is_admin:
            return Response(
                {"error": "Недостаточно прав"}, status=status.HTTP_403_FORBIDDEN
            )

        try:
            user = User.objects.get(pk=pk)
            # Пользователь не может снять админку с себя
            if user == request.user and user.is_admin:
                return Response(
                    {"error": "Администратор не может снять свою админку"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.is_admin = not user.is_admin
            user.save()
            return Response(UserSerializer(user).data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response(
                {"error": "Пользователь не найден"}, status=status.HTTP_404_NOT_FOUND
            )


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            result = serializer.save()
            return Response(result, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response(
                    {"error": "Требуется refresh token"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            # Создаем токен для валидации, не извлекая его из базы
            token = RefreshToken(refresh_token)
            # Проверяем, что token принадлежит текущему пользователю
            # by checking the token's user_id matches current user's id
            # Получаем user_id из токена
            user_id = token.payload.get("user_id")
            if not user_id or str(user_id) != str(request.user.id):
                return Response(
                    {"error": "Недостаточно прав"},
                    status=status.HTTP_403_FORBIDDEN,
                )
            # Добавляем токен в blacklist
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response(
                {"error": "Неверный токен"}, status=status.HTTP_400_BAD_REQUEST
            )
