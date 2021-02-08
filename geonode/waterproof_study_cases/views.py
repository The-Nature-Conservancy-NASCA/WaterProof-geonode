"""
Views for the ``django-StudyCases`` application.

"""

import logging

from math import fsum
from django.conf import settings
from django.contrib import messages
from django.contrib.auth.models import User
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.shortcuts import render, redirect, get_object_or_404
from django.template.response import TemplateResponse
from django.urls import reverse
from .models import StudyCases
from . import forms
from geonode.waterproof_nbs_ca.models import Countries, Region, Currency
from geonode.waterproof_intake.models import City, Intake
from geonode.waterproof_treatment_plants.models import TreatmentPlants
from django.utils import timezone
from django.utils.translation import ugettext_lazy as _
from django.views.generic import CreateView, DetailView, ListView

from django_libs.views_mixins import AccessMixin

from .forms import StudyCasesForm
from .models import StudyCases

import datetime
logger = logging.getLogger(__name__)


def listStudyCases(request):
    if request.method == 'GET':
        if request.user.is_authenticated:
            if (request.user.professional_role == 'ADMIN'):
                userCountry = Countries.objects.get(code=request.user.country)
                region = Region.objects.get(id=userCountry.region_id)
                currency = Currency.objects.get(id=userCountry.id)
                studyCases = StudyCases.objects.all()
                city = City.objects.get(id=1)
                return render(
                    request,
                    'waterproof_study_cases/studycases_list.html',
                    {
                        'casesList': studyCases,
                        'city': city,
                        'userCountry': userCountry,
                        'region': region,
                        'currency': currency
                    }
                )

            if (request.user.professional_role == 'ANALYS'):
                studyCases = StudyCases.objects.all()
                userCountry = Countries.objects.get(code=request.user.country)
                currency = Currency.objects.get(id=userCountry.id)
                region = Region.objects.get(id=userCountry.region_id)
                city = City.objects.all()
                return render(
                    request,
                    'waterproof_study_cases/studycases_list.html',
                    {
                        'casesList': studyCases,
                        'city': city,
                        'userCountry': userCountry,
                        'region': region,
                        'currency': currency
                    }
                )
        else:
            studyCases = StudyCases.objects.all()
            userCountry = Countries.objects.get(code='COL')
            region = Region.objects.get(id=userCountry.region_id)
            city = City.objects.all()
            return render(
                request,
                'waterproof_study_cases/studycases_list.html',
                {
                    'casesList': studyCases,
                    'city': city,
                }
            )


def create(request):
    logger.debug(request.method)
    # POST submit FORM
    if request.method == 'POST':
        form = forms.StudyCasesForm(request.POST)
        if form.is_valid():
            study_case = form.save(commit=False)
            study_case.dws_create_date = datetime.datetime.now()
            study_case.save()
            messages.success(request, ("Study case created."))
            return HttpResponseRedirect(reverse('study_cases_list'))
    else:
        intakes = Intake.objects.all()
        form = forms.StudyCasesForm()
        return render(request,
                  'waterproof_study_cases/studycases_form.html',
                  context={"form": form,
                           "serverApi": settings.WATERPROOF_API_SERVER,
                           'intakes': intakes
                           }
                  )
