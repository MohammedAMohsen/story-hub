from django.db import models
from django.conf import settings
from django.contrib.contenttypes.fields import GenericRelation
from apps.likes.models import Like
from apps.stories.models import Story
import uuid



class Comment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False,)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments')
    story = models.ForeignKey(Story, on_delete=models.CASCADE, related_name='comments')
    parent = models.ForeignKey("self", on_delete=models.CASCADE, null=True, blank=True, related_name="replies")
    content = models.TextField(blank=False)
    likes = GenericRelation(Like, related_query_name='comment')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.content[:40])