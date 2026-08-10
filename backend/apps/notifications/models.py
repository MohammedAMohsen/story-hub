from django.db import models
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType


class Notification(models.Model):
    class VerbChoices(models.TextChoices):
        LIKED_STORY = "liked_story", "Liked Story"
        LIKED_COMMENT = "liked_comment", "Liked Comment"
        COMMENTED = "commented", "Commented"
        REPLIED = "replied", "Replied"
        NEW_FOLLOWER = "new_follower", "New Follower"
        COMPLETE_PROFILE = "complete_profile", "Complete Profile"

        # Things that can be added later:
        # STORY_PUBLISHED = ...
        # ACCOUNT_VERIFIED = ...
        # PASSWORD_CHANGED = ...

    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, blank=True, null=True)
    verb = models.CharField(max_length=20, choices=VerbChoices.choices, blank=False)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, blank=True, null=True)
    object_id = models.CharField(max_length=255, blank=True, null=True)
    target = GenericForeignKey('content_type', 'object_id')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(
                fields=["recipient", "-created_at"],
                name="noti_recipient_created_idx",
            ),
        ]

    def __str__(self):
        return f"{self.actor.username if self.actor else ''} '{self.verb}'  {self.recipient.username}"