from django.contrib import admin
from .models import Bookmark

@admin.register(Bookmark)
class LoveAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "story",
        "saved_at",
    )
    search_fields = (
        "story__title",
        "user__username",
    )