from django.contrib import admin
from .models import Story, Category, Tag, Comment

class CommentInline(admin.TabularInline):
    model = Comment
    extra = 1

@admin.register(Story)
class UserAdmin(admin.ModelAdmin):
    list_display = (
        "author",
        "slug",
        "status",
        "created_at",
        'updated_at',
    )
    search_fields = (
        "title",
        "auther__username",
    )
    inlines = [CommentInline]

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name","slug",)
    search_fields = ("name",)

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("user", 'story', 'content', 'parent', 'created_at', 'updated_at')
    search_fields = ("user__username", 'story__title', 'content', 'id')