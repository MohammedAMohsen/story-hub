from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import AuthenticationFailed
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework import filters
from apps.follows.models import Follow
from django.db.models import Count, Exists, OuterRef, Value, BooleanField
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from rest_framework import status
from djoser.views import UserViewSet
from rest_framework_simplejwt.tokens import RefreshToken
from .google_auth import verify_google_token, get_or_create_user_from_google
from .services import change_user_email, confirm_user_email
from .models import Profile
from .serializers import (
    ChangeEmailSerializer,
    ConfirmEmailChangeSerializer,
    LogoutSerializer,
    PrivateProfileSerializer,
    PublicProfileSerializer,
    GoogleAuthSerializer,
    SetNewPasswordSerializer,
)


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

    @action(detail=False, methods=["POST"], url_path="set-new-password", url_name="set-new-password")
    def set_new_password(self, request):
        if request.user.has_usable_password():
            return Response(
                {"detail": "Password is already set. Use change password instead."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = SetNewPasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save(update_fields=['password'])
        return Response(
            {"detail": "Password has been set successfully."}
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
        if self.request.user.is_authenticated:
            is_following = Exists(Follow.objects.filter(follower=self.request.user, following=OuterRef('user')))
        else:
            is_following = Value(False, output_field=BooleanField())
        return (super()
            .get_queryset().filter(user__is_active=True)
            .annotate(
                followers_count=Count("user__follower_relationships", distinct=True),
                following_count=Count('user__following_relationships', distinct=True),
                story_count=Count('user__stories', distinct=True),
                is_following=is_following
            )
        )

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
        queryset = (
            Profile.objects
            .filter(user=request.user)
            .annotate(
                followers_count=Count("user__follower_relationships", distinct=True),
                following_count=Count('user__following_relationships', distinct=True),
                story_count=Count('user__stories', distinct=True),
            ).first()
        )
        if request.method == 'GET':
            serializer = PrivateProfileSerializer(queryset)
            return Response(serializer.data)
        is_partial = request.method == 'PATCH'
        serializer = PrivateProfileSerializer(queryset, data=request.data, partial=is_partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class GoogleAuthAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = verify_google_token(serializer.validated_data['token'])
        user = get_or_create_user_from_google(payload)
        if not user.is_active:
            raise AuthenticationFailed("No active account found with the given credentials")
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })