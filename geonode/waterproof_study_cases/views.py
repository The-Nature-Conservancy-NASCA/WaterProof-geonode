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
from django.db.models import Q
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
from ..waterproof_reports.models import zip

import datetime
import json
logger = logging.getLogger(__name__)

def list(request):
    if request.method == 'GET':
        try:            
            city_id = request.GET['city']
        except:
            city_id = ''
        if request.user.is_authenticated:
            if (request.user.professional_role == 'ADMIN'):
                userCountry = Countries.objects.get(iso3=request.user.country)
                region = Regions.objects.get(id=userCountry.region_id)
                if (city_id != ''):
                    studyCases = StudyCases.objects.filter(city=city_id).order_by('-edit_date')
                    city = Cities.objects.get(id=city_id)
                else:
                    studyCases = StudyCases.objects.all().order_by('-edit_date')
                    city = Cities.objects.get(id=1)
                intake_geoms = get_geoms_intakes(studyCases)
       
                return render(
                    request,
                    'waterproof_study_cases/studycases_list.html',
                    {
                        'casesList': studyCases,
                        'city': city,
                        'userCountry': userCountry,
                        'region': region,
                        'intakes': json.dumps(intake_geoms),
                        'serverApi': settings.WATERPROOF_API_SERVER
                    }
                )

            if (request.user.professional_role != 'ADMIN'):
                if (city_id != ''):
                    query = Q(city=city_id,added_by=request.user)
                    query.add(Q(city=city_id,is_public=True), Q.OR)
                    studyCases = StudyCases.objects.filter(query).order_by('-edit_date')
                    city = Cities.objects.get(id=city_id)
                else:
                    query = Q(added_by=request.user)
                    query.add(Q(is_public=True), Q.OR)
                    studyCases = StudyCases.objects.filter(query).order_by('-edit_date')
                    city = Cities.objects.get(id=1)
                
                userCountry = Countries.objects.get(iso3=request.user.country)
                region = Regions.objects.get(id=userCountry.region_id)
                intake_geoms = get_geoms_intakes(studyCases)
                
                return render(
                    request,
                    'waterproof_study_cases/studycases_list.html',
                    {
                        'casesList': studyCases,
                        'city': city,
                        'intakes': json.dumps(intake_geoms),
                        'serverApi': settings.WATERPROOF_API_SERVER
                    }
                )
        else:
            if (city_id != ''):
                query = Q(city=city_id)
                query.add(Q(is_public=True), Q.AND)
                studyCases = StudyCases.objects.filter(query).order_by('-edit_date')
                city = Cities.objects.get(id=city_id)
            else:
                studyCases = StudyCases.objects.filter(is_public=True).order_by('-edit_date')
                city = Cities.objects.get(id=1)
            return render(
                request,
                'waterproof_study_cases/studycases_list.html',
                {
                    'casesList': studyCases,
                    'intakes': []
                }
            )

def myCases(request):
    if request.method == 'GET':
        try:            
            city_id = request.GET['city']
        except:
            city_id = ''
        if request.user.is_authenticated:
            userCountry = Countries.objects.get(iso3=request.user.country)
            region = Regions.objects.get(id=userCountry.region_id)
            studyCases = StudyCases.objects.filter(added_by=request.user).order_by('-edit_date')
            return render(
                request,
                'waterproof_study_cases/studycases_my_cases.html',
                {
                    'casesList': studyCases,
                    'userCountry': userCountry,
                    'region': region,
                }
            )
        else:
            if (city_id != ''):
                query = Q(city=city_id)
                query.add(Q(is_public=True), Q.AND)
                studyCases = StudyCases.objects.filter(query).order_by('-edit_date')
                city = Cities.objects.get(id=city_id)
            else:
                studyCases = StudyCases.objects.filter(is_public=True).order_by('-edit_date')
                city = Cities.objects.get(id=1)
            return render(
                request,
                'waterproof_study_cases/studycases_my_cases.html',
                {
                    'casesList': studyCases,
                    'serverApi': settings.WATERPROOF_API_SERVER,
                    'intakes': []
                }
            )
     
def delete(request):
    studyCases = StudyCases.objects.all()
    return render (
        request, 'waterproof_study_cases/static/study_cases/js/study_cases_list.js',
        {
            'casesList': studyCases,
            "serverApi": settings.WATERPROOF_API_SERVER,
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
            portfolios = Portfolio.objects.all()
            models = ModelParameter.objects.all()
            currencys = Countries.objects.values('pk', 'currency', 'name', 'iso3').distinct().exclude(currency='').order_by('currency')
            scenarios = Climate_value.objects.all()
            return render(request,
                          'waterproof_study_cases/studycases_form.html',
                          context={
                              "serverApi": settings.WATERPROOF_API_SERVER,
                              "servermodelApi": settings.WATERPROOF_MODELS_PY2_API,
                              'portfolios': portfolios,
                              'ModelParameters': models,
                              'currencys': currencys,
                              'scenarios': scenarios,
                              'costFunctions' : [],
                              'id_user' : request.user.id,
                              'invest_doc': settings.WATERPROOF_INVEST_DOC,
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
            csinfras = []
            ptaps = []
            listPortfoliosStudy = study_case.portfolios.all()
            intakes_in_study_cases = study_case.intakes.all()
            listPTAPStudy = study_case.ptaps.all()
            scenarios = Climate_value.objects.all()
            
            currencys = Countries.objects.values('pk', 'currency','name', 'iso3').exclude(currency__exact='').order_by('currency')
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
            listPtaps = Header.objects.filter()
            for ptap in listPtaps:
                add = True
                for ptapStudy in listPTAPStudy:
                    if ptap.id == ptapStudy.pk:
                        add = False
                        break
                if(add):
                    ptaps.append(ptap)
            
            list_csinfra = ElementSystem.objects.filter(normalized_category='CSINFRA', intake__id__in=intakes_in_study_cases).values(
                "id", "name", "intake__name", "intake__id", "intake__water_source_name" , "intake__description" ,"graphId")
            
            for intake in list_csinfra:    
                add = True
                for intakeStudy in intakes_in_study_cases:
                    if intake['id'] == intakeStudy.pk:
                        add = False
                        break
                if(add):
                    csinfras.append(intake)
                                
           
            functions = []
            if study_case.cost_functions:
                functions = json.loads(study_case.cost_functions)
            
            return render(
                request, 'waterproof_study_cases/studycases_edit.html',
                {
                    "serverApi": settings.WATERPROOF_API_SERVER,
                    "servermodelApi": settings.WATERPROOF_MODELS_PY2_API,
                    'study_case': study_case,
                    'csinfras': csinfras,
                    'portfolios': portfolios,
                    'tratamentPlants': ptaps,
                    'ModelParameters': models,
                    'currencys': currencys,
                    'scenarios': scenarios,
                    'costFunctions' : functions,
                    'id_user' : request.user.id,
                    'invest_doc': settings.WATERPROOF_INVEST_DOC,
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
            cm_currency = study_case.cm_currency
            currencys = Countries.objects.values('pk', 'currency', 'name', 'iso3').distinct().exclude(currency__exact='').order_by('currency')
            listPortfoliosStudy = study_case.portfolios.all()
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
            listIntakes = ElementSystem.objects.filter(normalized_category='CSINFRA', intake__id__in=listIntakesStudy).values(
                "id", "name", "intake__name", "intake__id", "intake__water_source_name" , "intake__description" ,"graphId")
            for intake in listIntakes:
                add = True
                for intakeStudy in listIntakesStudy:
                    if intake['id'] == intakeStudy.pk:
                        add = False
                        break
                if(add):
                    intakes.append(intake)
            functions = []
            if study_case.cost_functions:
                functions = json.loads(study_case.cost_functions)
            return render(
                request, 'waterproof_study_cases/studycases_clone.html',
                {
                    "serverApi": settings.WATERPROOF_API_SERVER,
                    "servermodelApi": settings.WATERPROOF_MODELS_PY2_API,
                    'study_case': study_case,
                    'csinfras': intakes,
                    'portfolios': portfolios,
                    'tratamentPlants': ptaps,
                    'ModelParameters': models,
                    'currencys': currencys,
                    'scenarios': scenarios,
                    'costFunctions' : functions,
                    'cm_currency': cm_currency,
                    'id_user' : request.user.id,
                    'invest_doc': settings.WATERPROOF_INVEST_DOC,
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
        currency_name = ''
        cm_currency_name = ''
        fn_currency_name = ''
        
        if (not study_case.analysis_currency is None and study_case.analysis_currency != '-1' ):
            if (study_case.analysis_currency == 'USD'):
                currency_name = Countries.objects.filter(iso3='USA').first().name
            else: 
                currency_name = Countries.objects.filter(currency=study_case.analysis_currency).first().name
        
        print ("study_case.cm_currency : %s" % study_case.cm_currency)
        if (not study_case.cm_currency is None and study_case.cm_currency != '-1'):
            if (study_case.cm_currency == 'USD'):
                cm_currency_name = Countries.objects.filter(iso3='USA').first().name                
            else:
                cm_currency_name = Countries.objects.filter(currency=study_case.cm_currency).first().name

        if (not study_case.financial_currency is None and study_case.financial_currency != '-1'):
            if (study_case.financial_currency == 'USD'):
                fn_currency_name = Countries.objects.filter(iso3='USA').first().name
            else:
                fn_currency_name = Countries.objects.filter(currency=study_case.financial_currency).first().name

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

        functions = []
        if study_case.cost_functions:
            functions = json.loads(study_case.cost_functions)

        return render(
            request, 'waterproof_study_cases/studycases_view.html',
            {
                "serverApi": settings.WATERPROOF_API_SERVER,
                'study_case': study_case,
                'portfolios': portfolios,
                'ModelParameters': models,
                'scenarios': scenarios,
                'analisys_currency_name': currency_name,
                'cm_currency_name' : cm_currency_name,
                'fn_currency_name' : fn_currency_name,
                'costFunctions' : functions,
                'invest_doc': settings.WATERPROOF_INVEST_DOC,
            }
        )

def report(request, idx):
    if request.method == 'POST':
        return HttpResponseRedirect(reverse('study_cases_list'))
    else:
        downloadZip = zip.objects.filter(study_case_id__id=idx).first()

        study_case = StudyCases.objects.get(id=idx)
        return render(
            request, 'waterproof_reports/reports_menu.html',
            {
                "serverApi": settings.WATERPROOF_API_SERVER,
                'study_case': study_case,
                'filterzip': downloadZip,
                'idx': idx
            }
        )

def get_geoms_intakes(studyCases):
    intake_geoms = []
    for sc in studyCases:
        intakes = sc.intakes.all()
        for intake in intakes:
            ig = dict()
            ig['study_case_id'] = sc.pk
            ig['study_case_name'] = sc.name
            ig['intake_id'] = intake.pk
            ig['geom'] = json.loads(intake.polygon_set.first().geomIntake)['features'][0]['geometry'] # geom.geojson
            ig['intake_name'] = intake.name
            intake_geoms.append(ig)
    return intake_geoms