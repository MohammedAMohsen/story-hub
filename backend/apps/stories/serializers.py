from rest_framework import serializers
from apps.accounts.validators import validate_avatar_cover
from .models import Story, Category, Tag, Comment


class TagField(serializers.Field):
    def to_representation(self, value):
        return [tag.name for tag in value.all()]
    
    def to_internal_value(self, data):
        if not isinstance(data, list):
            raise serializers.ValidationError("Tags must be a list of texts.")
        tags = []
        seen_names = set()
        for raw_name in data:
            name = raw_name.strip().lower()
            if not name:
                continue
            if len(name) > 30:
                raise serializers.ValidationError(f"The tag '{name}' is too long (30 characters maximum).")
            if name in seen_names:
                continue
            seen_names.add(name)
            tag,_ = Tag.objects.get_or_create(name=name)
            tags.append(tag)
        return tags


class StoryWriteSerializer(serializers.ModelSerializer):
    tags = TagField(required=False)
    class Meta:
        model = Story
        fields = ('title', 'content', 'category', 'tags', 'cover', 'status')

    def validate_cover(self, value):
        return validate_avatar_cover(value)

    def validate_content(self, value):
        if len(value) < 20:
            raise serializers.ValidationError('The content is very short.')
        return value

    def create(self, validated_data):
        tags = validated_data.pop('tags', [])
        story = Story.objects.create(**validated_data)
        story.tags.set(tags)
        return story

    def update(self, instance, validated_data):
        tags = validated_data.pop('tags', None)
        instance = super().update(instance, validated_data)
        if tags is not None:
            instance.tags.set(tags)
        return instance


class StorySerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='author.username')
    full_name = serializers.CharField(source='author.get_full_name')
    avatar = serializers.ImageField(source='author.profile.avatar')
    category = serializers.SerializerMethodField(read_only=True)
    tags = TagField(read_only=True)
    comments_count = serializers.IntegerField(read_only=True)
    class Meta:
        model = Story
        fields = (
            'username', 'full_name', 'avatar', 'slug',
            'title', 'content', 'category', 'tags', 'cover',
            'status', 'created_at', 'updated_at',
            'comments_count', #likes_count,
        )
    def get_category(self, obj):
        return obj.category.name if obj.category else None


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id',"name",'slug')


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
    class Meta:
        model = Comment
        fields = (
            'id', 'username', 'full_name', 'avatar',
            'content', 'created_at', 'updated_at', 'parent', 'replies_count', #likes_count,
        )