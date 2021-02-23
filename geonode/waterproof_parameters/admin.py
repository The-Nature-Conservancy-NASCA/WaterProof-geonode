from django.contrib import admin

from .models import Countries

class ParemetersAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'iso3',
    )

admin.site.register(Countries, ParemetersAdmin)