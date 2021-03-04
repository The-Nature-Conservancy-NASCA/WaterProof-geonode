from django.contrib import messages
from django.conf import settings
from django.contrib.auth.models import User
from django.http import HttpResponse, Http404, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.template.response import TemplateResponse
from rest_framework.decorators import api_view
from rest_framework.parsers import JSONParser
from django.urls import reverse
from .models import StudyCases
from . import forms
from geonode.waterproof_parameters.models import Countries, Regions , Cities
from geonode.waterproof_intake.models import  Intake, ElementSystem
from .models import StudyCases , Portfolio, ModelParameter

import requests
import datetime
import logging

logger = logging.getLogger(__name__)


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
            ptaps = request.POST.getlist('ptaps[]')
            logger.error(ptaps)
            for ptap in ptaps:
                pt = ElementSystem.objects.get(pk=ptap)
                sc.dws_intakes.add(pt)
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
                return JsonResponse({'id_study_case': sc.id}, safe=False)
        elif(request.POST.getlist('portfolios[]')):
            portfolios = request.POST.getlist('portfolios[]')
            id_study_case = request.POST['id_study_case']
            sc = StudyCases.objects.get(pk=id_study_case)
            for portfolio in portfolios:
                it = Portfolio.objects.get(pk=portfolio)
                sc.portfolios.add(it)
            return JsonResponse({'id_study_case': sc.id}, safe=False)
        elif(request.POST.getlist('status')):
            portfolios = request.POST.getlist('status')
            id_study_case = request.POST['id_study_case']
            sc = StudyCases.objects.get(pk=id_study_case)
    
            return JsonResponse({'id_study_case': sc.id}, safe=False)
    