from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail
from .models import User
from .emails import (
    build_email_change_message,
    build_activation_message,
    build_reset_password_message,
)


@shared_task
def send_change_email(user_id):
    user = User.objects.get(pk=user_id)
    subject = "Confirm your new email address"
    message = build_email_change_message(user)
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.pending_email], fail_silently=False)


@shared_task
def send_activation_email(user_id):
    user = User.objects.get(pk=user_id)
    subject = "Activate your account"
    message = build_activation_message(user)
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=False)


@shared_task
def send_reset_password_email(user_id):
    user = User.objects.get(pk=user_id)
    subject = "Reset your password"
    message = build_reset_password_message(user)
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=False)