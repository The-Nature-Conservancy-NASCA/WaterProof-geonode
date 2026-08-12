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
from geonode.waterproof_intake.models import Intake, ElementSystem, Polygon
from geonode.waterproof_treatment_plants.models import Header
from geonode.waterproof_nbs_ca.models import WaterproofNbsCa
from django.utils import timezone
from django.forms.models import model_to_dict
from django.utils.translation import ugettext as _
from django.views.generic import CreateView, DetailView, ListView

from django_libs.views_mixins import AccessMixin
from geonode.people.models import Profile
from .forms import StudyCasesForm
from .models import StudyCases, Portfolio, ModelParameter,Notification_registry
from ..waterproof_reports.models import zip

from datetime import datetime,timedelta
from django.core.mail import send_mail
import requests
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
            studyCases = StudyCases.objects.select_related("city", "added_by").filter(added_by=request.user).order_by('-edit_date')
            # email= csAutodestruction()
            return render(
                request,
                'waterproof_study_cases/studycases_my_cases.html',
                {
                    'casesList': studyCases,
                    'userCountry': userCountry,
                    'region': region,
                    # 'email': email
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
            listPortfolios = Portfolio.objects.all()
            portfolios = []
            for portfolio in listPortfolios:                
                pObject = {
                    'id': portfolio.id,
                    'name': _(portfolio.name),
                    'default': portfolio.default
                }
                portfolios.append(pObject)

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

def quick_create(request):
    print('quick Cs')
    # POST submit FORM
    if not request.user.is_authenticated:
        return render(request, 'waterproof_study_cases/studycases_login_error.html')
    else:
        if request.method == 'POST':
            return HttpResponseRedirect(reverse('study_cases_list'))
        else:
            listPortfolios = Portfolio.objects.all()
            portfolios = []
            for portfolio in listPortfolios:                
                pObject = {
                    'id': portfolio.id,
                    'name': _(portfolio.name),
                    'default': portfolio.default
                }
                portfolios.append(pObject)

            models = ModelParameter.objects.all()
            currencys = Countries.objects.values('pk', 'currency', 'name', 'iso3').distinct().exclude(currency='').order_by('currency')
            scenarios = Climate_value.objects.all()
            dateValue = datetime.now()
            return render(request,
                          'waterproof_study_cases/studycases_quick.html',
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
                              'dateValue':dateValue,
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
                    'name': _(portfolio.name),
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
                    polygons_data = Polygon.objects.filter(intake_id=intakeStudy.pk).values('area')
                    intake['area'] = "{:,.2f}".format(sum(poly['area'] / 10000 for poly in polygons_data))
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
                    'name': _(portfolio.name),
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
                    polygons_data = Polygon.objects.filter(intake_id=intakeStudy.pk).values('area')
                    intake['area'] = "{:,.2f}".format(sum(poly['area'] / 10000 for poly in polygons_data))
                    intakes.append(intake)
            print('------------LOG-------------')
            for ints in intakes:
              print(ints)
            print('------------LOG-------------')
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

def cloneQuick(request, idx):
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
                    'name': _(portfolio.name),
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
                    polygons_data = Polygon.objects.filter(intake_id=intakeStudy.pk).values('area')
                    intake['area'] = "{:,.2f}".format(sum(poly['area'] / 10000 for poly in polygons_data))
                    intakes.append(intake)
            print('------------LOG-------------')
            for ints in intakes:
              print(ints)
            print('------------LOG-------------')
            functions = []
            if study_case.cost_functions:
                functions = json.loads(study_case.cost_functions)
            return render(
                request, 'waterproof_study_cases/studycases_clone_quick.html',
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
                'name': _(portfolio.name),
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
        
def quickReport(request, idx):
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

def csAutodestruction():
    print('----------------------------- Study Cases Autodestruction --------------------------------')
    # print(settings.SITE_HOST_API)
    if (settings.SITE_HOST_API != "https://dev.water-proof.org/"):
        # Variables para almacenar los datos
        alertCS = []
        alertUsers = []
        notificationArray=[]
        actualDate= datetime.now() 

        # Llamado de datos
        studyCases = StudyCases.objects.all().order_by('id')
        notifications = Notification_registry.objects.all().order_by('id')
        
        # Filtrado de datos
        for notification in notifications:
            notificationArray.append(notification.studycase_id)
        
        for sc in studyCases: #filtra los casos de estudios por la fecha
            if sc.create_date.replace(tzinfo=None) < actualDate + timedelta(days=-90) and cs.id != 1524 :
                alertCS.append(sc)             #Guarda los casos de estudio que necesitan ser notificados
                
        for cs in alertCS: #Filtra los usuarios que tienen un caso de estudio para eliminar
            if cs.added_by_id != None:
                people = Profile.objects.get(id=cs.added_by_id)
                if people not in alertUsers:
                    alertUsers.append(people)   #Guarda los usuarios a los que se les va a notificar
                    
        for user in alertUsers:
            if user.is_staff == False:# trae los casos de estudio para enviar el correo
                studyCasesAlert = []
                studyCasesDeleted = []
                count=0
                for cs in alertCS:
                    if user.id == cs.added_by_id:                               
                        if cs.id in notificationArray:   # analiza si el caso de estudio ya fue notificado
                            count = Notification_registry.objects.filter(studycase_id=cs.id).count()
                            registry = Notification_registry.objects.filter(studycase_id=cs.id)
                            if count == 1:
                                if registry[0].date_action < actualDate + timedelta(days=-7) :
                                    csCreateDate= cs.create_date.strftime('%Y/%m/%d').replace("/","-").replace("-0","-")
                                    studyCasesAlert.append(f"- ID: {str(cs.id)} - Name: {cs.name} , Creation date: {csCreateDate}") #se almacena la tupla en un arreglo para mostrarlo posteriormente
                                    newNotification = Notification_registry(studycase_id=cs.id,action='Notification 2',date_action=datetime.now(tz=timezone.utc))
                                    newNotification.save()
                                    print(f'case: {cs.id} - Notification: {count+1}')
                                else:
                                    print("Aún no se debe hacer la siguiente notificación para el caso de estudio: ",cs.id)
                            elif count == 2:
                                if registry[1].date_action < actualDate + timedelta(days=-14) :
                                    csCreateDate= cs.create_date.strftime('%Y/%m/%d').replace("/","-").replace("-0","-")
                                    studyCasesAlert.append(f"- ID: {str(cs.id)} - Name: {cs.name} , Creation date: {csCreateDate}") #se almacena la tupla en un arreglo para mostrarlo posteriormente
                                    newNotification = Notification_registry(studycase_id=cs.id,action='Notification 3',date_action=datetime.now(tz=timezone.utc))
                                    newNotification.save()
                                    print(f'case: {cs.id} - Notification: {count+1}')
                                else:
                                    print("Aún no se debe hacer la siguiente notificación para el caso de estudio: ",cs.id)
                            else:
                                scCreationDate = cs.create_date.strftime('%Y/%m/%d').replace("/","-").replace("-0","-")
                                csElimination(cs.id,user.id,scCreationDate)
                                studyCasesDeleted.append([cs.id,cs.name,cs.create_date.strftime('%Y/%m/%d').replace("/","-").replace("-0","-")])
                                print(f'--------- Se eliminó el caso de estudio: {cs.id} después de haber notificado {count} veces a el usuario: {user.id} -------------------------')
                        else:    
                            csCreateDate= cs.create_date.strftime('%Y/%m/%d').replace("/","-").replace("-0","-")
                            studyCasesAlert.append(f"- ID: {str(cs.id)} - Name: {cs.name} , Creation date: {csCreateDate}") #se almacena la tupla en un arreglo para mostrarlo posteriormente
                            print(f'case: {cs.id} - Notification: {count+1}')
                            newNotification = Notification_registry(studycase_id=cs.id,action='Notification 1',date_action=datetime.now(tz=timezone.utc))
                            newNotification.save()
                printParams(user.id,user.email,user.is_staff,studyCasesAlert)
                if studyCasesAlert:
                    print(f'Sending email to notify user: {user.id}')
                    sendEmail([user.email],user.language,studyCasesAlert,False,count+1)
                if studyCasesDeleted:
                    print(f'Sending email to notify user: {user.id}, about  the study cases were deleted')
                    sendEmail([user.email],user.language,studyCasesDeleted,True,count+1)

def printParams(userId,userEmail,staff,scList):  
    print("User:",userId,"Email:",userEmail,"staff:",staff,"CS:",scList)
   
def sendEmail(user, language,sc_list,elimination,notification_number=''):
    # strArray = str(sc_list)
    strArray = '\n'.join(str(item) for item in sc_list)
    
    if language == 'es':
        if elimination == False:
            subject= f'Aviso de eliminación de información WaterProof  {notification_number}'
            message='Estimado usuario \n \nTe saludamos desde WaterProof, herramienta web en la cual deseamos apoyar a gestores de proyectos a orientar sus inversiones en SbN. Como sabes este servicio es gratuito y debido a la alta demanda de ejecuiciones debemos hacer una gestión del espacio en disco de nuestro servidor. Por esa razón te pedimos que por favor elimines la información de casos de estudio que no usas, como es el caso de los siguientes casos de estudio: \n \n'
            messageCases=[]
            for case in strArray:
                messageCases.append(case)
            message = message+'\n'+''.join(messageCases)
            message = message+'\n \nGracias \n \n Equipo técnico de WaterProof'
        else:
            subject= f'Aviso de eliminación de información WaterProof'
            message='Estimado usuario \n \nTe saludamos desde WaterProof, herramienta web en la cual deseamos apoyar a gestores de proyectos a orientar sus inversiones en SbN. Debido a la alta demanda de ejecuciones debemos hacer una gestión del espacio en disco de nuestro servidor, eliminaremos la información de los siguientes casos de estudio: \n \n'
            messageCases=[]
            for case in strArray:
                messageCases.append(case)
            message = message+'\n'+''.join(messageCases)
            message = message+'\n \nGracias \n \n Equipo técnico de WaterProof'
    else:
        if elimination == False:
            subject= f'Study case elimination warning {notification_number}'
            message='Dear user. \n \nWe greet you from WaterProof, a web tool in which we want to support project managers to guide their investments in NbS. As you know, this service is free and due to the high demand for executions we must manage the disk space of our server. For that reason we ask that you please delete information from case studies that you do not use, such as the following case studies: \n \n'
            messageCases=[]
            for case in strArray:
                messageCases.append(case)
            message = message+'\n'+''.join(messageCases)
            message = message+'\n \nThanks \n \n Waterproof technical team'
        else: 
            subject= f'Study case elimination'
            message='Dear user. \n  \nWe greet you from WaterProof, a web tool in which we want to support project managers to guide their investments in NbS. As you know, this service is free and due to the high demand for executions we must manage the disk space of our server. For that reason we have deleted information from following case studies: \n'
            messageCases=[]
            for case in strArray:
                messageCases.append(case)
            message = message+'\n'+''.join(messageCases)
            message = message+'\n \nThanks \n \n Waterproof technical team'
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=user,
            fail_silently=False,
        )
        print('Email was sended')
        return True
    except Exception as e:
        print(f"An error occurred while sending the email: {e}")
        return False
    
def csElimination(studyCaseId,userId,creationDate):
    serverApi= settings.WATERPROOF_API_SERVER
    proxy='/proxy/?url='
    amp = '%26'
    url=settings.SITE_HOST_API
    try:
        deleteCs = requests.post(url+'/study_cases/delete/'+str(studyCaseId))
        print("Se ha eliminando el caso de estudio",studyCaseId)
    except Exception as e:
        print("Ha ocurrido un error eliminando el caso de estudio",studyCaseId,e)
    try:
        deleteFiles = requests.get(serverApi+proxy+'delete?study_case_id='+str(studyCaseId)+amp+'user_id='+str(userId)+amp+'date='+creationDate)
        print("Se han eliminando los archivos del caso de estudio",studyCaseId)
    except Exception as e:
        print("Ha ocurrido un error eliminando los archivos del caso de estudio",studyCaseId,e)
          
# def sendEmailAlertError(user, language,sc_id,sc_name):
def sendEmailAlertError(sc_id):
    # strArray = str(sc_list)
    # print(sc_id)
    study_case = StudyCases.objects.get(id=sc_id)
    sc_name= study_case.name
    user = Profile.objects.get(id=study_case.added_by.id)
    # print(user)
    language = user.language
    if language == 'es':
        subject= f'Error en la Ejecución de tu Proceso - {sc_id} - {sc_name}'
        message=f'Estimado usuario \n \nSaludos desde WaterProof, la herramienta web diseñada para apoyar a gestores de proyectos en la orientación de sus inversiones en Soluciones basadas en la Naturaleza (SbN). \n \nLamentamos informarte que se ha producido un error durante la ejecución de tu proceso: {sc_id} - {sc_name}. Te recomendamos contactar con el administrador para revisar la información asociada a este proceso y si es necesario, intentar nuevamente más tarde.  \n \n'
        message = message+'\n \nAgradecemos tu comprensión y estamos a tu disposición para cualquier consulta adicional. \n \nGracias \n \n Equipo técnico de WaterProof'
    else:
        subject= f'Error in the Execution of Your Process - {sc_id} - {sc_name}'
        message=f'Dear user. \n \nGreetings from WaterProof, the web tool designed to support project managers in guiding their investments in Nature-based Solutions (NbS). \n \nWe regret to inform you that an error occurred during the execution of your process: {sc_id} - {sc_name}. We recommend contacting the administrator to review the information associated with this process, and if necessary, try again later. \n \n'
        message = message+'\n \nWe appreciate your understanding and are available for any further inquiries.\n \nThanks \n \n Waterproof technical team'
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[user.email],
            fail_silently=False,
        )
        print('Email was sended')
        return True
    except Exception as e:
        print(f"An error occurred while sending the email: {e}")
        return False