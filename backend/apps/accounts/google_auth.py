from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.conf import settings
from django.utils.text import slugify
from rest_framework import serializers
from .models import User


def verify_google_token(token):
    try:
        payload = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
    except ValueError:
        raise serializers.ValidationError("Invalid or expired Google token.")

    if not payload.get("email_verified"):
        raise serializers.ValidationError("This Google email is not verified.")

    return payload


def _generate_unique_username(base):
    username = base
    counter = 1
    while User.objects.filter(username=username).exists():
        username = f"{base}{counter}"
        counter += 1
    return username


def get_or_create_user_from_google(payload):
    email = payload["email"]
    try:
        return User.objects.get(email=email)
    except User.DoesNotExist:
        base_username = slugify(email.split("@")[0])
        user = User(
            email=email,
            username=_generate_unique_username(base_username),
            first_name=payload.get("given_name", ""),
            last_name=payload.get("family_name", ""),
            is_active=True,
        )
        user.set_unusable_password()
        user.save()
        return user