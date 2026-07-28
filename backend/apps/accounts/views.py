from rest_framework.response import Response
from .services import change_user_email, confirm_user_email
from rest_framework.decorators import action
from .serializers import (
    ChangeEmailSerializer,
    ConfirmEmailChangeSerializer,
    LogoutSerializer
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

    @action(detail=False, methods=["POST"], url_path="confirm-email-change")
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