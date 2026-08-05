from django.db import models
from apps.stories.models import Story
from django.conf import settings


class Bookmark(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookmarks')
    story = models.ForeignKey(Story, on_delete=models.CASCADE, related_name='bookmarks')
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Bookmark"
        verbose_name_plural = "Bookmarks"
        constraints = [
            models.UniqueConstraint(    
                fields=['user', 'story'], 
                name='unique_user_story_bookmark'
            )
        ]

    def __str__(self):
        return f"{self.story} saved by {self.user.username}"