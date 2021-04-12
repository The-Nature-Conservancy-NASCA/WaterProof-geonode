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
from geonode.waterproof_parameters.models import Countries, Regions, Cities, Climate_value
from geonode.waterproof_intake.models import Intake
from geonode.waterproof_treatment_plants.models import Header, Csinfra
from geonode.waterproof_nbs_ca.models import WaterproofNbsCa
from .models import StudyCases, Portfolio, ModelParameter

import requests
import datetime
import logging
import simplejson as json

logger = logging.getLogger(__name__)


@api_view(['GET'])
def getIntakeByID(request, id_intake):
    if request.method == 'GET':
        filterIntake = Intake.objects.filter(id=id_intake).values(
            "id", "name", "water_source_name")
        data = list(filterIntake)
        return JsonResponse(data, safe=False)


@api_view(['GET'])
def getIntakeByCity(request, name):
    if request.method == 'GET':
        filterIntakeCity = Intake.objects.filter(city__name__startswith=name, is_complete=True).values(
            "id", "name", "water_source_name")
        data = list(filterIntakeCity)
        return JsonResponse(data, safe=False)

@api_view(['GET'])
def getIntakeByPtap(request, id):
    if request.method == 'GET':
        filterIntakePtap = Csinfra.objects.filter(csinfra_plant__id=id).values(
            "csinfra_elementsystem__intake__id", "csinfra_elementsystem__intake__name", "csinfra_elementsystem__intake__water_source_name")
        data = list(filterIntakePtap)
        return JsonResponse(data, safe=False)


@api_view(['GET'])
def getPtapByCity(request, name):
    if request.method == 'GET':
        filterptap = Header.objects.filter(plant_city__name__startswith=name).values(
            "id", "plant_name")
        data = list(filterptap)
        return JsonResponse(data, safe=False)


@api_view(['POST'])
def delete(request, idx):
    sc = StudyCases.objects.get(id=idx)
    if not sc:
        print("Not found")
        context = {
            'status': '400', 'reason': 'Intake not found'
        }
        response = HttpResponse(json.dumps(context), content_type='application/json')
        response.status_code = 400
        return response
    else:
        # delete object
        print(sc.delete())
        # after deleting redirect to
        # home page
        context = {
            'status': '200', 'reason': 'sucess'
        }
        response = HttpResponse(json.dumps(context), content_type='application/json')
        response.status_code = 200
        return response


@api_view(['POST'])
def save(request):
    if not request.user.is_authenticated:
        return render(request, 'waterproof_study_cases/studycases_login_error.html')
    else:
        if request.method == 'POST':
            if(request.POST.get('name')):
                city = Cities.objects.filter(
                    name__startswith=request.POST['city'], country__name__startswith=request.POST['country']).first()
                name = request.POST['name']
                name_old = ''
                id_study_case = request.POST['id_study_case']
                description = request.POST['description']
                sctype = request.POST['type']
                valid = True
                if(id_study_case == ''):
                    sc = StudyCases()
                    sc.added_by = request.user
                else:
                    sc = StudyCases.objects.get(pk=id_study_case)
                    name_old = sc.name
                if(name != name_old):
                    sclist = StudyCases.objects.filter(name=name)
                    if(len(sclist) > 0):
                        valid = False
                if (valid):
                    if(sctype == '1'):
                        sc.studycase_type = 'PTAP'
                    else:
                        sc.studycase_type = 'CUSTOM'
                    sc.create_date = datetime.datetime.now()
                    sc.name = name
                    sc.city = city
                    sc.description = description
                    sc.save()
                    intakes = request.POST.getlist('intakes[]')
                    sc.intakes.clear()
                    for intake in intakes:
                        it = Intake.objects.get(pk=intake)
                        intakelist = StudyCases.objects.filter(intakes=intake, pk=sc.id)
                        if(len(intakelist) == 0):
                            sc.intakes.add(it)
                    ptaps = request.POST.getlist('ptaps[]')
                    sc.ptaps.clear()
                    for ptap in ptaps:
                        pt = Header.objects.get(pk=ptap)
                        ptaplist = StudyCases.objects.filter(ptaps=ptap, pk=sc.id)
                        if(len(ptaplist) == 0):
                            sc.ptaps.add(pt)
                    return JsonResponse({'id_study_case': sc.id}, safe=False)
                else:
                    return JsonResponse({'id_study_case': ''}, safe=False)
            elif(request.POST.get('carbon_market')):
                cm = request.POST['carbon_market']
                id_study_case = request.POST['id_study_case']
                sc = StudyCases.objects.get(pk=id_study_case)
                if(cm == 'true'):
                    cm_value = request.POST['carbon_market_value']
                    cm_currency = request.POST['carbon_market_currency']
                    sc.cm_value = cm_value
                    sc.cm_currency = cm_currency
                    sc.benefit_carbon_market = True
                    sc.save()
                    return JsonResponse({'id_study_case': sc.id}, safe=False)
                else:
                    sc.benefit_carbon_market = False
                    sc.save()
                    return JsonResponse({'id_study_case': sc.id}, safe=False)
            elif(request.POST.getlist('portfolios[]')):
                portfolios = request.POST.getlist('portfolios[]')
                id_study_case = request.POST['id_study_case']
                sc = StudyCases.objects.get(pk=id_study_case)
                sc.portfolios.clear()
                for portfolio in portfolios:
                    pf = Portfolio.objects.get(pk=portfolio)
                    pflist = StudyCases.objects.filter(portfolios=pf, pk=sc.id)
                    if(len(pflist) == 0):
                        sc.portfolios.add(pf)
                return JsonResponse({'id_study_case': sc.id}, safe=False)
            elif(request.POST.getlist('nbs[]')):
                nbs = request.POST.getlist('nbs[]')
                id_study_case = request.POST['id_study_case']
                sc = StudyCases.objects.get(pk=id_study_case)
                sc.nbs.clear()
                for nb in nbs:
                    n = WaterproofNbsCa.objects.get(pk=nb)
                    nlist = StudyCases.objects.filter(nbs=n, pk=sc.id)
                    if(len(nlist) == 0):
                        sc.nbs.add(n)
                return JsonResponse({'id_study_case': sc.id}, safe=False)
            elif(request.POST.get('total_platform')):
                id_study_case = request.POST['id_study_case']
                sc = StudyCases.objects.get(pk=id_study_case)
                sc.program_Director = request.POST['director']
                sc.implementation_Manager = request.POST['implementation']
                sc.monitoring_Manager = request.POST['evaluation']
                sc.finance_Manager = request.POST['finance']
                sc.office_Costs = request.POST['office']
                sc.overhead = request.POST['overhead']
                sc.equipment_Purchased = request.POST['equipment']
                sc.discount_rate = request.POST['discount']
                sc.discount_rate_maximum = request.POST['minimum']
                sc.discount_rate_minimunm = request.POST['minimum']
                sc.transaction_cost = request.POST['transaction']
                sc.others = request.POST['others']
                sc.travel = request.POST['travel']
                sc.contracts = request.POST['contracts']
                sc.financial_currency = request.POST['financial_currency']
                sc.save()
                return JsonResponse({'id_study_case': sc.id}, safe=False)
            elif(request.POST.get('analysis_type')):
                id_study_case = request.POST['id_study_case']
                sc = StudyCases.objects.get(pk=id_study_case)
                sc.is_complete = True
                sc.time_implement = request.POST['period_nbs']
                id_climate = request.POST['analysis_nbs']
                cs = Climate_value.objects.get(pk=id_climate)
                sc.climate_scenario = cs
                sc.analysis_type = request.POST.get('analysis_type')
                sc.analysis_currency = request.POST.get('analysis_currency')
                sc.analysis_period_value = request.POST.get('period_analysis')
                analysistype = request.POST['analysis_type']
                sc.annual_investment = request.POST['annual_investment']
                if(analysistype == '1'):
                    sc.analysis_type = 'FULL'
                    sc.annual_investment = None
                    sc.rellocated_remainder = False
                else:
                    sc.analysis_type = 'INVESTMENT'
                    sc.annual_investment = request.POST['annual_investment']
                    rr = request.POST['rellocated_remainder']
                    if (rr == 'true'):
                        sc.rellocated_remainder = True
                    else:
                        sc.rellocated_remainder = False
                if(request.POST.get('conservation') != ''):
                    sc.analysis_conservation = request.POST['conservation']
                    sc.analysis_active_restoration = request.POST['active']
                    sc.analysis_passive_restoration = request.POST['passive']
                    sc.analysis_silvopastoral = request.POST['silvopastoral']
                    sc.analysis_agroforestry = request.POST['agroforestry']
                else:
                    sc.analysis_conservation = None
                    sc.analysis_active_restoration = None
                    sc.analysis_passive_restoration = None
                    sc.analysis_silvopastoral = None
                    sc.analysis_agroforestry = None
                sc.save()
                return JsonResponse({'id_study_case': sc.id}, safe=False)
