from rest_framework import serializers
from .models import Comment


class CommentWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ('content','parent')

    def validate(self, attrs):
        parent = attrs.get("parent")
        if parent:
            if parent.parent is not None:
                raise serializers.ValidationError("Replies cannot have replies.")
            story = self.context.get('story')
            if story and parent.story != story:
                raise serializers.ValidationError("You cannot reply to a comment from another story.")
        return attrs


class CommentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    full_name = serializers.CharField(source='user.get_full_name')
    avatar = serializers.ImageField(source='user.profile.avatar')
    replies_count = serializers.IntegerField(read_only=True)
    likes_count = serializers.SerializerMethodField(read_only=True)
    is_liked = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = Comment
        fields = (
            'id', 'username', 'full_name', 'avatar','content',
            'created_at', 'updated_at','parent', 'replies_count',
            'likes_count', 'is_liked',
        )
    def get_likes_count(self, obj):
        return obj.likes.count()
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if not request.user.is_authenticated:
            return False
        return obj.likes.filter(user=request.user).exists()
    
    # TODO (PostgreSQL):
    # Replace both `likes_count` and `is_liked` SerializerMethodFields with
    # database annotations (Count + Exists) after migrating to PostgreSQL.
    #
    # Why not now?
    # This project currently uses SQLite, which has limitations when querying
    # GenericRelation objects whose target model uses a UUID primary key
    # (Comment.id). These limitations lead to incorrect results and even
    # OverflowError exceptions in some GenericForeignKey lookups.
    #
    # Current workaround:
    # - likes_count -> obj.likes.count()
    # - is_liked    -> obj.likes.filter(user=request.user).exists()
    #
    # PostgreSQL correctly handles these GenericRelation + UUID queries, making
    # annotated Count("likes") and Exists(...) the preferred and more efficient
    # implementation.
