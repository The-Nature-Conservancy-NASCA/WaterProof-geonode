"""
Forms for the ``django - Study Case`` application.

"""
from django import forms
from django.conf import settings
from django.utils.translation import ugettext_lazy as _

from .models import StudyCases


class StudyCasesForm(forms.ModelForm):
    
    class Meta:
        model = StudyCases
        fields = (
            'dws_name', 
            'dws_description'
        )    
    def save(self, *args, **kwargs):
        
        obj = super(StudyCasesForm, self).save(*args, **kwargs)
        return obj
