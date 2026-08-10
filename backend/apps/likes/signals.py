from apps.notifications.models import Notification
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta
from .models import Like

@receiver(post_save, sender=Like)
def create_notification(sender, instance, created, **kwargs):
    if not created:
        return
    target = instance.content_object
    if instance.content_type.model == "comment":
        recipient = target.user
        verb = Notification.VerbChoices.LIKED_COMMENT
    elif instance.content_type.model == "story":
        recipient = target.author
        verb = Notification.VerbChoices.LIKED_STORY
    else:
        return
    if instance.user == recipient:
        return
    if Notification.objects.filter(
        recipient=recipient,
        actor=instance.user,
        verb=verb,
        content_type=instance.content_type,
        object_id=instance.object_id,
        created_at__gte=timezone.now() - timedelta(hours=24),
    ).exists():
        return
    Notification.objects.create(
        recipient=recipient,
        actor=instance.user,
        verb=verb,
        content_type=instance.content_type,
        object_id=instance.object_id,
    )