import os
from rest_framework import serializers


MAX_IMAGE_SIZE = 10 * 1024 * 1024
ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
}

def validate_avatar_cover(file):
    if file.size > MAX_IMAGE_SIZE:
        raise serializers.ValidationError( "Avatar size must not exceed 10 MB.")
    extension = os.path.splitext(file.name)[1].lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise serializers.ValidationError("Unsupported image format.")
    return file