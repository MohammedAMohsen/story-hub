from django.contrib import admin
from .models import Like


@admin.register(Like)
class LoveAdmin(admin.ModelAdmin):
    pass
