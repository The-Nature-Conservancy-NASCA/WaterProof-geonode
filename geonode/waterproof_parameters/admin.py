from django.contrib import admin

from .models import Countries

class ParemetersAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'iso3',
        'currency',
        'currency_symbol'
    )
    
    


admin.site.register(Countries, ParemetersAdmin)