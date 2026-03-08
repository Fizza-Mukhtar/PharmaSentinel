# userauth/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('username', 'email', 'role', 'is_staff', 'is_superuser', 'is_active')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')

    # Add role and phone to existing fieldsets
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('role', 'phone')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('role', 'phone')}),
    )

    search_fields = ('username', 'email')
    ordering = ('username',)

admin.site.register(CustomUser, CustomUserAdmin)
