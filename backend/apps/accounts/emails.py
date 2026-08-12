from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.conf import settings


def build_user_token(user):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = PasswordResetTokenGenerator().make_token(user)
    return uid, token

def build_confirmation_link(user, path):
    uid, token = build_user_token(user)
    return f"{settings.EMAIL_FRONTEND_PROTOCOL}://{settings.DOMAIN}/{path}/{uid}/{token}"


def build_email_change_confirmation_link(user):
    return build_confirmation_link(user, "confirm-email")

def build_email_change_message(user):
    return (
        f"You're receiving this email because you requested to change your email address on {settings.SITE_NAME}.\n\n"
        f"Please click the following link to confirm your new email address:\n\n"
        f"{build_email_change_confirmation_link(user)}\n\n"
        f"Thanks for using our site!\n\n"
        f"The {settings.SITE_NAME} team\n\n"
    )


def build_activation_confirmation_link(user):
    return build_confirmation_link(user, "activate")

def build_activation_message(user):
    return (
        f"You're receiving this email because you created an account on {settings.SITE_NAME}.\n\n"
        f"Please go to the following page to activate your account:\n\n"
        f"{build_activation_confirmation_link(user)}\n\n"
        f"Thanks for using our site!\n\n"
        f"The {settings.SITE_NAME} team\n"
    )


def build_reset_password_confirmation_link(user):
    return build_confirmation_link(user, "reset-password")

def build_reset_password_message(user):
    return (
        f"You're receiving this email because you requested a password reset on {settings.SITE_NAME}.\n\n"
        f"Please go to the following page to reset your password:\n\n"
        f"{build_reset_password_confirmation_link(user)}\n\n"
        f"If you did not request this, you can safely ignore this email.\n\n"
        f"Thanks for using our site!\n\n"
        f"The {settings.SITE_NAME} team\n"
    )