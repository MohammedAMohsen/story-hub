from apps.notifications.models import Notification
from django.dispatch import receiver
from django.db.models.signals import post_save
from django.contrib.contenttypes.models import ContentType
from .models import Comment


@receiver(post_save, sender=Comment)
def create_notification(sender, instance, created, **kwargs):
    if not created:
        return
    if instance.parent:
        recipient = instance.parent.user
        verb = Notification.VerbChoices.REPLIED
    else:
        recipient = instance.story.author
        verb = Notification.VerbChoices.COMMENTED
    if instance.user == recipient:
        return
    Notification.objects.create(
        recipient = recipient,
        actor = instance.user,
        verb = verb,
        content_type = ContentType.objects.get_for_model(Comment),
        object_id = instance.id,
    )