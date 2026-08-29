from rest_framework import serializers
from apps.accounts.models import User


class FollowCreateSerializer(serializers.Serializer):
    username = serializers.CharField()


class UserFollowSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(source='profile.avatar')
    bio = serializers.CharField(source="profile.bio")
    full_name = serializers.CharField(source="get_full_name")
    story_count = serializers.IntegerField(read_only=True)
    followers_count = serializers.IntegerField(read_only=True)
    is_following = serializers.BooleanField(read_only=True)
    class Meta:
        model = User
        fields = ('username', 'full_name', 'avatar', 'is_following', 'bio', 'followers_count', 'story_count')