"""
Forms for the ``django - Waterproof Fastflood `` application.

"""
from django import forms
from django.utils.translation import ugettext_lazy as _

from .models import Watershed

class WatershedForm(forms.ModelForm):    

    class Meta:
        model = Watershed
        fields = ('name', 
                'description'                
        )
        """
                'id_region', 
                'id_city')
        widgets = {'id_region': forms.HiddenInput(),
                    'id_city': forms.HiddenInput()}
        """
    def save(self, *args, **kwargs):
        
        obj = super(WatershedForm, self).save(*args, **kwargs)
        return obj