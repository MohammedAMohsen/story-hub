from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import viewsets
from rest_framework import filters
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from .services import change_user_email, confirm_user_email
from .models import Profile
from .serializers import (
    ChangeEmailSerializer,
    ConfirmEmailChangeSerializer,
    LogoutSerializer,
    PrivateProfileSerializer,
    PublicProfileSerializer,
)
from rest_framework import status
from djoser.views import UserViewSet


class CustomUserViewSet(UserViewSet):
    @action(detail=False, methods=["POST"], url_path="change-email")
    def change_email(self, request):
        serializer = ChangeEmailSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        change_user_email(request.user, serializer.validated_data['email'])
        return Response({"Verification email will be sent to your new email address."})

    @action(detail=False, methods=["POST"], authentication_classes=[], permission_classes=[], url_path="confirm-email-change")
    def confirm_email_change(self, request):
        serializer = ConfirmEmailChangeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        confirm_user_email(serializer.validated_data['user'])
        return Response(
            {
            "message":
            "Email changed successfully. Please login again."
            }
        ) 

    @action(detail=False, methods=["POST"], url_path="logout")
    def logout(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {
                "message":
                "Successfully logged out."
            },
            status=status.HTTP_205_RESET_CONTENT
        )


class ProfileViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Profile.objects.select_related('user')
    serializer_class = PublicProfileSerializer
    lookup_field = 'username'

    def get_queryset(self):
        return super().get_queryset().filter(user__is_active=True)

    def get_object(self):
        return get_object_or_404(self.get_queryset(), user__username=self.kwargs['username'])

    def get_permissions(self):
        if self.action == 'me':
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [AllowAny]
        return [permission() for permission in permission_classes]

    filter_backends = [filters.SearchFilter,]
    search_fields = ["^user__username", "^user__first_name", "^user__last_name",]

    @action(detail=False, methods=['GET','PUT','PATCH'], url_path="me")
    def me(self, request):
        queryset = get_object_or_404(Profile, user=request.user)
        if request.method == 'GET':
            serializer = PrivateProfileSerializer(queryset)
            return Response(serializer.data)
        is_partial = request.method == 'PATCH'
        serializer = PrivateProfileSerializer(queryset, data=request.data, partial=is_partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)