from djoser.serializers import UserCreatePasswordRetypeSerializer, UserSerializer
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from rest_framework import serializers
from django.utils.text import slugify
from .models import User


RESERVED_USERNAMES = {
    "admin", "administrator",
    "root", "superuser",
    "system", "support",
}

BLOCKED_EMAIL_DOMAINS = {
    "mailinator.com",
    "10minutemail.com",
    "tempmail.com",
}


class CustomUserCreateSerializer(UserCreatePasswordRetypeSerializer):
    class Meta(UserCreatePasswordRetypeSerializer.Meta):
        model = User
        fields = ('first_name', 'last_name', 'email', "password")

    def validate_email(self, value):
        if value.split('@')[-1].lower() in BLOCKED_EMAIL_DOMAINS:
            raise serializers.ValidationError("Temporary email addresses are not allowed.")
        return value.lower()

    def perform_create(self, validated_data):
        base_username = slugify(validated_data['email'].split('@')[0])
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f'{base_username}{counter}'
            counter += 1
        validated_data['username'] = username
        return super().perform_create(validated_data)


class CustomUserSerializer(UserSerializer):
    full_name = serializers.SerializerMethodField()
    class Meta(UserSerializer.Meta):
        model = User
        fields = ('id', 'first_name', 'last_name', 'full_name', 'username', 'email', 'date_joined')
        extra_kwargs = {
            'date_joined': {'read_only': True}
        }

    def validate_username(self, value):
        if value.lower() in RESERVED_USERNAMES:
            raise serializers.ValidationError("This username is reserved.")
        return value.lower()

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"


class ChangeEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    def validate_email(self, value):
        if value.split('@')[-1].lower() in BLOCKED_EMAIL_DOMAINS:
            raise serializers.ValidationError("Temporary email addresses are not allowed.")
        user = self.context["request"].user
        if value == user.email:
            raise serializers.ValidationError("This is already your current email.")
        if (
            User.objects.filter(email=value).exclude(pk=user.pk).exists() or
            User.objects.filter(pending_email=value).exclude(pk=user.pk).exists()
        ):
            raise serializers.ValidationError("This email is already in use.")
        return value.lower()


class ConfirmEmailChangeSerializer(serializers.Serializer):

    uid = serializers.CharField()
    token = serializers.CharField()
    default_error_messages = {
        "invalid_link": "Invalid or expired confirmation link.",
        "no_pending_email": "No pending email change request found.",
    }
    def validate(self, attrs):
        try:
            uid = force_str(urlsafe_base64_decode(attrs["uid"]))
            user = User.objects.get(pk=uid)
        except User.DoesNotExist:
            self.fail("User dose not exist.")
        if not PasswordResetTokenGenerator().check_token(user, attrs['token']):
            self.fail("invalid_link")
        if not user.pending_email:
            self.fail("no_pending_email")
        attrs['user'] = user
        return attrs


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()
    def validate(self, attrs):
        self.token = attrs['refresh']
        return attrs
    def save(self, **kwargs):
        try:
            token = RefreshToken(self.token)
            token.blacklist()
        except Exception:
            raise serializers.ValidationError("Invalid token")