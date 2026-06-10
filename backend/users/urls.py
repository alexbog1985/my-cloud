from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import UserViewSet, RegisterView, LoginView, LogoutView

# Create a router and register our ViewSets with it.
router = DefaultRouter()
router.register(r"users", UserViewSet, basename="user")

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path("", include(router.urls)),
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
]
