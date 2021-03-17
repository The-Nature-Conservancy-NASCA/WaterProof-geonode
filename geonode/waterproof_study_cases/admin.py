"""Admin sites for the ``study_cases`` app."""
from django.contrib import admin

from .models import StudyCases


class StudyCasesAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'description'
    )


admin.site.register(StudyCases, StudyCasesAdmin)
