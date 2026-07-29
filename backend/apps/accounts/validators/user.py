from datetime import date
from rest_framework import serializers


RESERVED_USERNAMES = {
    "admin",
    "administrator",
    "root",
    "superuser",
    "system",
    "support",
}


BLOCKED_EMAIL_DOMAINS = {
    "mailinator.com",
    "10minutemail.com",
    "tempmail.com",
}


def validate_username(value):
    if value.lower() in RESERVED_USERNAMES:
        raise serializers.ValidationError("This username is reserved.")
    if value.split("."):
        print(value.split())
        raise serializers.ValidationError("This username should not contain `.` ")
    return value.lower()


def validate_email(value):
    domain = value.split("@")[-1].lower()
    if domain in BLOCKED_EMAIL_DOMAINS:
        raise serializers.ValidationError("Temporary email addresses are not allowed.")
    return value.lower()