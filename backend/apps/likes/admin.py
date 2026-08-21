from django.contrib import admin
from .models import Like


@admin.register(Like)
class LoveAdmin(admin.ModelAdmin):
    list_display = ("user", "created_at", 'content_type', 'content_object')
