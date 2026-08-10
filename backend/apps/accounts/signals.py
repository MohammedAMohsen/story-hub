from .models import User, Profile
from django.dispatch import receiver
from django.db.models.signals import post_save
from apps.notifications.models import Notification


@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
        Notification.objects.create(recipient=instance, verb=Notification.VerbChoices.COMPLETE_PROFILE)