from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.core.mail import send_mail
from django.conf import settings


def build_email_change_confirmation_link(user):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = PasswordResetTokenGenerator().make_token(user)
    return f"{settings.EMAIL_FRONTEND_PROTOCOL}://{settings.DOMAIN}/activate/{uid}/{token}"

def send_change_email(user):
    subject = "Confirm your new email address"
    message = (
        f"You're receiving this email because you need to finish activation process on {settings.SITE_NAME}.\n\n"
        f"Please go to the following page to activate account:\n\n"
        f"{build_email_change_confirmation_link(user)}\n\n"
        f"Thanks for using our site!\n\n"
        f"The localhost:8000 team\n\n"
    )
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.pending_email], fail_silently=False)