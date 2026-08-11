from django.contrib import admin
from .models import Comment


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("user", 'story', 'content', 'parent', 'created_at', 'updated_at')
    search_fields = ("user__username", 'story__title', 'content', 'id')
