"""
Views for the ``django-StudyCases`` application.

"""

import logging

from math import fsum
from django.conf import settings
from django.contrib import messages
from django.contrib.auth.models import User
from django.http import HttpResponse, Http404, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.template.response import TemplateResponse
from rest_framework.decorators import api_view
from rest_framework.parsers import JSONParser
from django.urls import reverse
from .models import StudyCases
from . import forms
from geonode.waterproof_nbs_ca.models import Countries, Region, Currency
from geonode.waterproof_intake.models import City, Intake, ElementSystem
from geonode.waterproof_treatment_plants.models import TreatmentPlants
from django.utils import timezone
from django.forms.models import model_to_dict
from django.utils.translation import ugettext_lazy as _
from django.views.generic import CreateView, DetailView, ListView

from django_libs.views_mixins import AccessMixin

from .forms import StudyCasesForm
from .models import StudyCases , Portfolio

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
        portfolios = Portfolio.objects.all()
        filterIntakeCSInfra = ElementSystem.objects.filter(normalized_category='CSINFRA').values(
            "id", "name", "intake__name", "intake__id", "graphId")
        form = forms.StudyCasesForm()
        return render(request,
                      'waterproof_study_cases/studycases_form.html',
                      context={"form": form,
                               "serverApi": settings.WATERPROOF_API_SERVER,
                               'intakes': filterIntakeCSInfra,
                               'portfolios': portfolios
                               }
                      )


@api_view(['GET'])
def getSCInfra(request, id_scinfra):
    if request.method == 'GET':
        filterIntakeCSInfra = ElementSystem.objects.filter(id=id_scinfra).values(
            "id", "name", "intake__name", "intake__id", "intake__water_source_name", "graphId")
        data = list(filterIntakeCSInfra)
        return JsonResponse(data, safe=False)


@api_view(['POST'])
def save(request):
    if request.method == 'POST':
        if(request.POST.get('name')):     
            name = request.POST['name']
            description = request.POST['description']
            sc = StudyCases()
            sc.dws_create_date = datetime.datetime.now()
            sc.dws_name = name
            sc.dws_description =description
            sc.save()
            intakes = request.POST.getlist('intakes[]')
            for intake in intakes:
                it = ElementSystem.objects.get(pk=intake)
                sc.dws_intakes.add(it)
            return JsonResponse({'id_study_case': sc.id}, safe=False)
        elif(request.POST.get('carbon_market')):
            cm = request.POST['carbon_market']
            if(cm):
                id_study_case = request.POST['id_study_case']
                sc = StudyCases.objects.get(pk=id_study_case)
                cm_value = request.POST['carbon_market_value']
                cm_currency = request.POST['carbon_market_currency']
                currency = Currency.objects.filter(code=cm_currency)[0]
                sc.cm_currency = currency
                sc.cm_value = cm_value
                sc.dws_benefit_carbon_market = True
                sc.save()
                return JsonResponse({'id_study_case': 1}, safe=False)
        elif(request.POST.getlist('portfolios[]')):
            portfolios = request.POST.getlist('portfolios[]')
            id_study_case = request.POST['id_study_case']
            sc = StudyCases.objects.get(pk=id_study_case)
            for portfolio in portfolios:
                it = Portfolio.objects.get(pk=portfolio)
                sc.portfolios.add(it)
            return JsonResponse({'id_study_case': sc.id}, safe=False)
    
