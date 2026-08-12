"""
Forms for the ``django - Records`` application.

"""
from django import forms
from django.conf import settings
from django.utils.translation import ugettext_lazy as _


class RecordsForm(forms.ModelForm):

    fechaIni = forms.DateField()
    fechaFin = forms.DateField()
