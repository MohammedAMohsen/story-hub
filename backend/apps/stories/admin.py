from django.contrib import admin
from .models import Story, Category, Tag


@admin.register(Story)
class UserAdmin(admin.ModelAdmin):
    list_display = (
        "author",
        "slug",
        "status",
        "updated_at",
        'updated_at',
    )
    search_fields = (
        "title",
        "auther__username",
    )

@admin.register(Category)
class UserAdmin(admin.ModelAdmin):
    list_display = ("name","slug",)
    search_fields = ("name",)

@admin.register(Tag)
class UserAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)