from rest_framework import serializers
from .models import Bookmark
from apps.stories.serializers import StorySerializer


class BookmarkCreateSerializer(serializers.Serializer):
    story_slug = serializers.SlugField()


class BookmarkSerializer(serializers.ModelSerializer):
    story = StorySerializer(read_only=True)
    class Meta:
        model = Bookmark
        fields = ('saved_at', 'story')
