from rest_framework import permissions


class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user is None or not request.user.is_authenticated:
            return False

        if request.user.is_admin:
            return True

        return obj.user == request.user
