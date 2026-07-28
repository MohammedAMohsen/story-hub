from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Profile

class ProfileInline(admin.StackedInline):
    model = Profile
    extra = 0

@admin.register(User)
class UserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + ((
        "Extra Fields",
        {
            "fields":("pending_email",)
        },
    ),)
    list_display = (
        "id",
        "email",
        "username",
        "is_staff",
        "is_active",
    )
    search_fields = (
        "email",
        "username",
    )
    inlines = [ProfileInline]


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    pass