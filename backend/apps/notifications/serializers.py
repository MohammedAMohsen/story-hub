from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    actor = serializers.SerializerMethodField()
    target = serializers.SerializerMethodField()
    class Meta:
        model = Notification
        fields = ('actor', 'verb', 'target', 'created_at', 'is_read')

    def get_actor(self, obj):
        return {
            'username': obj.actor.username if obj.actor else None,
            'full_name': obj.actor.get_full_name() if obj.actor else None,
            'avatar': (obj.actor.profile.avatar.url if obj.actor.profile.avatar else None) if obj.actor else None,
        }

    def get_target(self, obj):
        if obj.target is None:
            return None
        if obj.content_type.model == "story":
            return {'type': 'story', 'slug': obj.target.slug, 'title': obj.target.title}
        if obj.content_type.model == "comment":
            return {
                'type': 'comment', 'id': obj.target.id,
                'content': obj.target.content[:50],
                'story_slug': obj.target.story.slug,
                'parent': str(obj.target.parent_id) if obj.target.parent_id else None
            }
        return None