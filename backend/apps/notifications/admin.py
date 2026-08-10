from django.contrib import admin
from .models import Notification

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = (
        "actor",
        "verb",
        "recipient",
        'target',
        "created_at",
        'is_read',
    )
    list_editable = ('is_read',)
    search_fields = (
        "actor__username",
        "recipient__username",
        '=object_id',
        
    )
    list_filter = (
        "verb",
    )