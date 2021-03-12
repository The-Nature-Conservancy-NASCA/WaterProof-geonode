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
from rest_framework.decorators import api_view
from rest_framework.parsers import JSONParser
from django.urls import reverse
from .models import StudyCases
from . import forms
from geonode.waterproof_parameters.models import Cities , Countries ,Regions
from geonode.waterproof_intake.models import Intake, ElementSystem
from geonode.waterproof_treatment_plants.models import Header
from geonode.waterproof_nbs_ca.models import WaterproofNbsCa
from django.utils import timezone
from django.forms.models import model_to_dict
from django.utils.translation import ugettext_lazy as _
from django.views.generic import CreateView, DetailView, ListView

from django_libs.views_mixins import AccessMixin

from .forms import StudyCasesForm
from .models import StudyCases , Portfolio, ModelParameter

import datetime
logger = logging.getLogger(__name__)


def listStudyCases(request):
    if request.method == 'GET':
        if request.user.is_authenticated:
            if (request.user.professional_role == 'ADMIN'):
                userCountry = Countries.objects.get(iso3=request.user.country)
                region = Regions.objects.get(id=userCountry.region_id)
                studyCases = StudyCases.objects.all()
                city = Cities.objects.get(id=1)
                return render(
                    request,
                    'waterproof_study_cases/studycases_list.html',
                    {
                        'casesList': studyCases,
                        'city': city,
                        'userCountry': userCountry,
                        'region': region,
                    }
                )

            if (request.user.professional_role == 'ANALYS'):
                studyCases = StudyCases.objects.all()
                userCountry = Countries.objects.get(iso3=request.user.country)
                region = Regions.objects.get(id=userCountry.region_id)
                city = Cities.objects.all()
                return render(
                    request,
                    'waterproof_study_cases/studycases_list.html',
                    {
                        'casesList': studyCases,
                        'city': city,
                        'userCountry': userCountry,
                        'region': region,
                    }
                )
        else:
            studyCases = StudyCases.objects.all()
            userCountry = Countries.objects.get(iso3='COL')
            region = Regions.objects.get(id=userCountry.region_id)
            city = Cities.objects.all()
            return render(
                request,
                'waterproof_study_cases/studycases_list.html',
                {
                    'casesList': studyCases,
                    'city': city,
                }
            )

def create(request):
    # POST submit FORM
    if request.method == 'POST':
        return HttpResponseRedirect(reverse('study_cases_list'))
    else:
        portfolios = Portfolio.objects.all()
        models = ModelParameter.objects.all()
        tratamentPlants = Header.objects.all()
        intakes = ElementSystem.objects.filter(normalized_category='CSINFRA').values(
            "id", "name", "intake__name", "intake__id", "graphId")
        form = forms.StudyCasesForm()
        nbs = WaterproofNbsCa.objects.filter(added_by__professional_role ='ADMIN').values(
            "id", "name")
        
        return render(request,
                      'waterproof_study_cases/studycases_form.html',
                      context={"form": form,
                               "serverApi": settings.WATERPROOF_API_SERVER,
                               'intakes': intakes,
                               'portfolios': portfolios,
                               'tratamentPlants':tratamentPlants,
                               'ModelParameters': models,
                               'nbs': nbs
                               }
                      )

