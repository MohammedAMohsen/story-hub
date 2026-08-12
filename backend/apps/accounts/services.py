from .tasks import send_change_email
from .models import User
from rest_framework import serializers


def change_user_email(user, pending_email):
    user.pending_email = pending_email
    user.save(update_fields=["pending_email"])
    send_change_email.delay(user.pk)

def confirm_user_email(user):
    if User.objects.filter(email=user.pending_email).exclude(pk=user.pk).exists():
        raise serializers.ValidationError('Email already exists.')
    user.email = user.pending_email
    user.pending_email = None
    user.save(update_fields=["email", "pending_email",])