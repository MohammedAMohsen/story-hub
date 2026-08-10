from apps.notifications.models import Notification
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta
from .models import Follow

@receiver(post_save, sender=Follow)
def create_notification(sender, instance, created, **kwargs):
    if not created:
        return
    
    recipient = instance.following
    actor = instance.follower
    verb = Notification.VerbChoices.NEW_FOLLOWER

    if Notification.objects.filter(
        recipient=recipient,
        actor=actor,
        verb=verb,
        created_at__gte=timezone.now() - timedelta(hours=24),
    ).exists():
        return
    Notification.objects.create(
        recipient=recipient,
        actor=actor,
        verb=verb,
    )