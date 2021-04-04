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
from geonode.waterproof_parameters.models import Cities, Countries, Regions, ManagmentCosts_Discount, Climate_value
from geonode.waterproof_intake.models import Intake, ElementSystem
from geonode.waterproof_treatment_plants.models import Header
from geonode.waterproof_nbs_ca.models import WaterproofNbsCa
from django.utils import timezone
from django.forms.models import model_to_dict
from django.utils.translation import ugettext_lazy as _
from django.views.generic import CreateView, DetailView, ListView

from django_libs.views_mixins import AccessMixin

from .forms import StudyCasesForm
from .models import StudyCases, Portfolio, ModelParameter

import datetime
logger = logging.getLogger(__name__)


def list(request):
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
    if not request.user.is_authenticated:
        return render(request, 'waterproof_study_cases/studycases_login_error.html')
    else:
        if request.method == 'POST':
            return HttpResponseRedirect(reverse('study_cases_list'))
        else:
            logger.error(request)
            portfolios = Portfolio.objects.all()
            models = ModelParameter.objects.all()
            tratamentPlants = Header.objects.all()
            currencys = Countries.objects.values('currency').distinct().order_by('currency')
            scenarios = Climate_value.objects.all()
            financial_parameters = ManagmentCosts_Discount.objects.get(country=48)
            intakes = ElementSystem.objects.filter(normalized_category='CSINFRA').values(
                "id", "name", "intake__name", "intake__id", "graphId")
            nbs = WaterproofNbsCa.objects.filter(added_by__professional_role='ADMIN').values(
                "id", "name")
            return render(request,
                          'waterproof_study_cases/studycases_form.html',
                          context={
                              "serverApi": settings.WATERPROOF_API_SERVER,
                              'intakes': intakes,
                              'portfolios': portfolios,
                              'tratamentPlants': tratamentPlants,
                              'ModelParameters': models,
                              'financialParameters': financial_parameters,
                              'nbs': nbs,
                              'currencys': currencys,
                              'scenarios': scenarios
                          }
                          )


def edit(request, idx):
    if not request.user.is_authenticated:
        return render(request, 'waterproof_study_cases/studycases_login_error.html')
    else:
        if request.method == 'POST':
            return HttpResponseRedirect(reverse('study_cases_list'))
        else:
            study_case = StudyCases.objects.get(id=idx)
            listPortfolios = Portfolio.objects.all()
            portfolios = []
            intakes = []
            ptaps = []
            nbs = []
            listPortfoliosStudy = study_case.portfolios.all()
            listNBSStudy = study_case.nbs.all()
            listIntakesStudy = study_case.intakes.all()
            listPTAPStudy = study_case.ptaps.all()
            scenarios = Climate_value.objects.all()
            currencys = Countries.objects.values('currency').distinct().order_by('currency')
            for portfolio in listPortfolios:
                defaultValue = False
                for portfolioStudy in listPortfoliosStudy:
                    if portfolio.id == portfolioStudy.id:
                        defaultValue = True
                pObject = {
                    'id': portfolio.id,
                    'name': portfolio.name,
                    'default': defaultValue
                }
                portfolios.append(pObject)
            listNbs = WaterproofNbsCa.objects.filter(added_by__professional_role='ADMIN').values(
                "id", "name")
            for n in listNbs:
                defaultValue = False
                for nbsStudy in listNBSStudy:
                    if n['id'] == nbsStudy.id:
                        defaultValue = True
                nObject = {
                    'id': n['id'],
                    'name': n['name'],
                    'default': defaultValue
                }
                nbs.append(nObject)
            models = ModelParameter.objects.all()
            listPtaps = Header.objects.filter()
            for ptap in listPtaps:
                add = True
                for ptapStudy in listPTAPStudy:
                    if ptap.id == ptapStudy.pk:
                        add = False
                        break
                if(add):
                    ptaps.append(ptap)
            listIntakes = ElementSystem.objects.filter(normalized_category='CSINFRA').values(
                "id", "name", "intake__name", "intake__id", "graphId")
            for intake in listIntakes:
                add = True
                for intakeStudy in listIntakesStudy:
                    if intake['id'] == intakeStudy.pk:
                        add = False
                        break
                if(add):
                    intakes.append(intake)
            return render(
                request, 'waterproof_study_cases/studycases_edit.html',
                {
                    "serverApi": settings.WATERPROOF_API_SERVER,
                    'study_case': study_case,
                    'intakes': intakes,
                    'portfolios': portfolios,
                    'tratamentPlants': ptaps,
                    'ModelParameters': models,
                    'nbs': nbs,
                    'currencys': currencys,
                    'scenarios': scenarios
                }
            )


def clone(request, idx):
    if not request.user.is_authenticated:
        return render(request, 'waterproof_study_cases/studycases_login_error.html')
    else:
        if request.method == 'POST':
            return HttpResponseRedirect(reverse('study_cases_list'))
        else:
            study_case = StudyCases.objects.get(id=idx)
            name = study_case.name
            study_case.name = name + '_clone'
            listPortfolios = Portfolio.objects.all()
            portfolios = []
            intakes = []
            ptaps = []
            nbs = []
            currencys = Countries.objects.values('currency').distinct().order_by('currency')
            listPortfoliosStudy = study_case.portfolios.all()
            listNBSStudy = study_case.nbs.all()
            listIntakesStudy = study_case.intakes.all()
            listPTAPStudy = study_case.ptaps.all()
            scenarios = Climate_value.objects.all()
            for portfolio in listPortfolios:
                defaultValue = False
                for portfolioStudy in listPortfoliosStudy:
                    if portfolio.id == portfolioStudy.id:
                        defaultValue = True
                pObject = {
                    'id': portfolio.id,
                    'name': portfolio.name,
                    'default': defaultValue
                }
                portfolios.append(pObject)
            listNbs = WaterproofNbsCa.objects.filter(added_by__professional_role='ADMIN').values(
                "id", "name")
            for n in listNbs:
                defaultValue = False
                for nbsStudy in listNBSStudy:
                    if n['id'] == nbsStudy.id:
                        defaultValue = True
                nObject = {
                    'id': n['id'],
                    'name': n['name'],
                    'default': defaultValue
                }
                nbs.append(nObject)
            models = ModelParameter.objects.all()
            listPtaps = Header.objects.filter()
            for ptap in listPtaps:
                add = True
                for ptapStudy in listPTAPStudy:
                    if ptap.id == ptapStudy.pk:
                        add = False
                        break
                if(add):
                    ptaps.append(ptap)
            listIntakes = ElementSystem.objects.filter(normalized_category='CSINFRA').values(
                "id", "name", "intake__name", "intake__id", "graphId")
            for intake in listIntakes:
                add = True
                for intakeStudy in listIntakesStudy:
                    if intake['id'] == intakeStudy.pk:
                        add = False
                        break
                if(add):
                    intakes.append(intake)
            return render(
                request, 'waterproof_study_cases/studycases_clone.html',
                {
                    "serverApi": settings.WATERPROOF_API_SERVER,
                    'study_case': study_case,
                    'intakes': intakes,
                    'portfolios': portfolios,
                    'tratamentPlants': ptaps,
                    'ModelParameters': models,
                    'nbs': nbs,
                    'currencys': currencys,
                    'scenarios': scenarios
                }
            )


def view(request, idx):
    if request.method == 'POST':
        return HttpResponseRedirect(reverse('study_cases_list'))
    else:
        study_case = StudyCases.objects.get(id=idx)
        listPortfolios = Portfolio.objects.all()
        portfolios = []
        listPortfoliosStudy = study_case.portfolios.all()
        scenarios = Climate_value.objects.all()
        for portfolio in listPortfolios:
            defaultValue = False
            for portfolioStudy in listPortfoliosStudy:
                if portfolio.id == portfolioStudy.id:
                    defaultValue = True
            pObject = {
                'id': portfolio.id,
                'name': portfolio.name,
                'default': defaultValue
            }
            portfolios.append(pObject)
        models = ModelParameter.objects.all()
        nbs = WaterproofNbsCa.objects.filter(added_by__professional_role='ADMIN').values(
            "id", "name")

        return render(
            request, 'waterproof_study_cases/studycases_view.html',
            {
                "serverApi": settings.WATERPROOF_API_SERVER,
                'study_case': study_case,
                'portfolios': portfolios,
                'ModelParameters': models,
                'nbs': nbs,
                'scenarios': scenarios
            }
        )
