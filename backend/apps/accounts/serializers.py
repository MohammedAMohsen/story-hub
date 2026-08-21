from djoser.serializers import UserCreatePasswordRetypeSerializer, UserSerializer
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from django.utils.text import slugify
from .models import User, Profile
from .validators import validate_username, validate_email, validate_avatar_cover, validate_name



class CustomUserCreateSerializer(UserCreatePasswordRetypeSerializer):
    class Meta(UserCreatePasswordRetypeSerializer.Meta):
        model = User
        fields = ('first_name', 'last_name', 'email', "password")

    def validate_first_name(self, value):
        return validate_name(value)

    def validate_last_name(self, value):
        return validate_name(value)

    def validate_email(self, value):
        return validate_email(value)

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
    full_name = serializers.CharField(source='get_full_name')
    avatar = serializers.ImageField(source='profile.avatar')
    class Meta(UserSerializer.Meta):
        model = User
        fields = ('id', 'first_name', 'last_name', 'full_name', 'avatar', 'username', 'email', 'date_joined')
        extra_kwargs = {
            'date_joined': {'read_only': True}
        }

    def validate_first_name(self, value):
        return validate_name(value)

    def validate_last_name(self, value):
        return validate_name(value)
    
    def validate_username(self, value):
        return validate_username(value)


class ChangeEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    def validate_email(self, value):
        value = validate_email(value)
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


class PrivateProfileSerializer(serializers.ModelSerializer):
    followers_count = serializers.IntegerField(read_only=True)
    following_count = serializers.IntegerField(read_only=True)
    story_count = serializers.IntegerField(read_only=True)
    class Meta:
        model = Profile
        fields = (
            'avatar','cover','bio', 'birth_date','location',
            'website', 'github', 'linkedin','is_identity_verified',
            'followers_count', 'following_count', 'story_count'
        )
        extra_kwargs = {
            'is_identity_verified': {'read_only': True}
        }
    def validate_avatar(self, value):
        return validate_avatar_cover(value)

    def validate_cover(self, value):
        return validate_avatar_cover(value)


class PublicProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    full_name = serializers.CharField(source='user.get_full_name')
    followers_count = serializers.IntegerField(read_only=True)
    following_count = serializers.IntegerField(read_only=True)
    is_following = serializers.BooleanField(read_only=True)
    story_count = serializers.IntegerField(read_only=True)
    class Meta:
        model = Profile
        fields = (
            'username', 'full_name', 'avatar', 'cover','bio',
            'website', 'github', 'linkedin','is_identity_verified',
            'followers_count', 'following_count', 'is_following','story_count'
        )


class GoogleAuthSerializer(serializers.Serializer):
    token = serializers.CharField()


class SetNewPasswordSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_new_password(self, value):
        user = self.context['request'].user
        validate_password(value, user=user)
        return value