from rest_framework import serializers
from apps.accounts.models import User
from .models import Follow



class FollowCreateSerializer(serializers.Serializer):
    username = serializers.CharField()


class UserFollowSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(source='profile.avatar')
    full_name = serializers.CharField(source="get_full_name")
    is_following = serializers.BooleanField(read_only=True)
    class Meta:
        model = User
        fields = ('username', 'full_name', 'avatar', 'is_following')