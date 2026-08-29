from rest_framework import serializers
import re


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


def validate_name(value):
    pattern = r"^[a-zA-Z\u0621-\u064A]+(?:[ '\-][a-zA-Z\u0621-\u064A]+)?$"
    if len(value) < 3:
        raise serializers.ValidationError('The name must be more than 3 letters long.')
    if not re.match(pattern, value):
        raise serializers.ValidationError("Real letters only at min, with one separator (space, - or ') at most.")
    return value


def validate_username(value):
    if value.lower() in RESERVED_USERNAMES:
        raise serializers.ValidationError("This username is reserved.")
    if "." in value:
        print(value.split())
        raise serializers.ValidationError("This username should not contain `.` ")
    return value.lower()


def validate_email(value):
    domain = value.split("@")[-1].lower()
    if domain in BLOCKED_EMAIL_DOMAINS:
        raise serializers.ValidationError("Temporary email addresses are not allowed.")
    return value.lower()