from django.contrib import messages
from django.conf import settings
from django.contrib.auth.models import User
from django.http import HttpResponse, Http404, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.template.response import TemplateResponse
from rest_framework.decorators import api_view
from rest_framework.parsers import JSONParser
from itertools import chain
from django.urls import reverse
from .models import StudyCases
from . import forms
from geonode.waterproof_parameters.models import Countries, Regions, Cities, Climate_value, Parameters_Biophysical, ManagmentCosts_Discount, Countries_factor
from geonode.waterproof_intake.models import Intake, Polygon, UserCostFunctions
from geonode.waterproof_treatment_plants.models import Header, Csinfra, Function
from geonode.waterproof_nbs_ca.models import WaterproofNbsCa
from .models import StudyCases, Portfolio, ModelParameter, StudyCases_NBS, StudyCases_Currency

import requests
import datetime
import logging
import simplejson as json

logger = logging.getLogger(__name__)


@api_view(['GET'])
def getIntakeByID(request, id_intake):
    if request.method == 'GET':
        filterIntake = Intake.objects.filter(id=id_intake).values(
            "id", "name", "description", "water_source_name")
        data = list(filterIntake)
        return JsonResponse(data, safe=False)


@api_view(['GET'])
def getIntakeByCity(request, id_city):
    if request.method == 'GET':
        filterIntakeCity = Intake.objects.filter(city__id=id_city, is_complete=True).values(
            "id", "name", "water_source_name")
        data = list(filterIntakeCity)
        return JsonResponse(data, safe=False)


@api_view(['GET'])
def getIntakeByPtap(request, id):
    if request.method == 'GET':
        filterIntakePtap = Csinfra.objects.filter(csinfra_plant__id=id).values(
            "csinfra_elementsystem__intake__id", "csinfra_elementsystem__intake__name", "csinfra_elementsystem__intake__water_source_name").order_by('csinfra_elementsystem__intake__name')
        data = list(filterIntakePtap)
        return JsonResponse(data, safe=False)


@api_view(['GET'])
def getPtapByCity(request, id_city):
    if request.method == 'GET':
        filterptap = Header.objects.filter(plant_city__id=id_city).values(
            "id", "plant_name")
        data = list(filterptap)
        return JsonResponse(data, safe=False)


@api_view(['GET'])
def getPtapByID(request, id_ptap):
    if request.method == 'GET':
        filterptap = Header.objects.filter(id=id_ptap).values(
            "id", "plant_name", "plant_description")
        data = list(filterptap)
        return JsonResponse(data, safe=False)


@api_view(['GET'])
def getParameterByCountry(request, id_city):
    if request.method == 'GET':
        filtercity = Cities.objects.get(pk=id_city)
        filterpm = ManagmentCosts_Discount.objects.filter(country=filtercity.country).values()
        data = list(filterpm)
        return JsonResponse(data, safe=False)


@api_view(['GET'])
def getStudyCaseCurrencys(request):
    if request.method == 'GET':
        id = request.GET.get('id')
        currencys = []
        sc = StudyCases.objects.get(id=id)
        sc_currency = request.GET.get('currency')
        list_currency_type = []
        if(sc_currency):            
            sc_factor = Countries_factor.objects.filter(currency=sc_currency).first()
            scptaps = sc.ptaps.all()
            scintakes = sc.intakes.all()
            scnbs = StudyCases_NBS.objects.filter(studycase=sc)
            for ptap in scptaps:
                ptapCurrency = Function.objects.filter(function_plant=ptap).values('function_currency').distinct()
                for ptapc in ptapCurrency:
                    ptap_cu = ptapc['function_currency']
                    if(ptap_cu and ptap_cu != sc_currency):
                        currency = {}
                        currency['currency'] = ptap_cu
                        scc = StudyCases_Currency.objects.filter(
                            studycase=sc, currency=ptap_cu).first()
                        if(scc):
                            value = scc.value
                        else:
                            factor = Countries_factor.objects.filter(currency=ptap_cu).first()
                            value = factor.factor_EUR / sc_factor.factor_EUR
                        currency['value'] = str(value)
                        if (not currency['currency'] in list_currency_type):
                            list_currency_type.append(currency['currency'])
                            currencys.append(currency)
            for intake in scintakes:
                intakeCurrency = UserCostFunctions.objects.filter(intake=intake).values('currency__currency').distinct()
                for intakec in intakeCurrency:
                    intake_cu = intakec['currency__currency']
                    if(intake_cu and intake_cu != sc_currency and not any(element['currency'] in intake_cu for element in currencys)):
                        currency = {}
                        currency['currency'] = intake_cu
                        scc = StudyCases_Currency.objects.filter(
                            studycase=sc, currency=intake_cu).first()
                        if(scc):
                            value = scc.value
                        else:
                            factor = Countries_factor.objects.filter(currency=intake_cu).first()
                            value = factor.factor_EUR / sc_factor.factor_EUR
                        currency['value'] = str(value)
                        if (not currency['currency'] in list_currency_type):
                            list_currency_type.append(currency['currency'])
                            currencys.append(currency)
            for nbs in scnbs:
                nbsCurrency = WaterproofNbsCa.objects.filter(pk=nbs.nbs_id).values('currency_id__currency').distinct()
                for nbsc in nbsCurrency:
                    nbs_cu = nbsc['currency_id__currency']
                    if( nbs_cu and nbs_cu != sc_currency and not any(element['currency'] in nbs_cu for element in currencys)):
                        currency = {}
                        currency['currency'] = nbs_cu
                        scc = StudyCases_Currency.objects.filter(
                            studycase=sc, currency=nbs_cu).first()
                        if(scc):
                            value = scc.value
                        else:
                            factor = Countries_factor.objects.filter(currency=nbs_cu).first()
                            value = factor.factor_EUR / sc_factor.factor_EUR
                        currency['value'] = str(value)
                        if (not currency['currency'] in list_currency_type):
                            list_currency_type.append(currency['currency'])
                            currencys.append(currency)
            sc_cm_currency = sc.cm_currency
            if(sc_cm_currency and sc_cm_currency != sc_currency and not any(element['currency'] in sc_cm_currency for element in currencys)):
                sc_cm_factor = Countries_factor.objects.filter(currency=sc_cm_currency).first()
                currency = {}
                currency['currency'] = sc_cm_currency
                scc = StudyCases_Currency.objects.filter(studycase=sc, currency=sc_cm_currency).first()
                if(scc):
                    value = scc.value
                else:
                    value = sc_cm_factor.factor_EUR / sc_factor.factor_EUR
                currency['value'] = str(value)
                if (not currency['currency'] in list_currency_type):
                    list_currency_type.append(currency['currency'])
                    currencys.append(currency)
            sc_f_currency = sc.financial_currency
            if(sc_f_currency and sc_f_currency != sc_currency and not any(element['currency'] in sc_f_currency for element in currencys)):
                sc_f_factor = Countries_factor.objects.filter(currency=sc_f_currency).first()
                currency = {}
                currency['currency'] = sc_f_currency
                scc = StudyCases_Currency.objects.filter(studycase=sc, currency=sc_f_currency).first()
                if(scc):
                    value = scc.value
                else:
                    value = sc_f_factor.factor_EUR / sc_factor.factor_EUR
                currency['value'] = str(value)
                if (not currency['currency'] in list_currency_type):
                    list_currency_type.append(currency['currency'])
                    currencys.append(currency)
            data = list(currencys)
        else:
            scc = StudyCases_Currency.objects.filter(studycase=sc)
            for c in scc:
                currency = {}
                currency['currency'] = c.currency
                value = c.value
                currency['value'] = str(value)
                if (not currency['currency'] in list_currency_type):
                    list_currency_type.append(currency['currency'])
                    currencys.append(currency)
            data = list(currencys)
        return JsonResponse(data, safe=False)


@api_view(['POST'])
def getNBS(request):
    if request.method == 'POST':
        nbs = []
        nbs_admin = WaterproofNbsCa.objects.filter(added_by__professional_role='ADMIN').values(
            "id", "name","unit_implementation_cost", "unit_maintenance_cost","periodicity_maitenance","unit_oportunity_cost", "currency__currency", "country__global_multiplier_factor")
        id_city = request.POST['city_id'] 
        process = request.POST['process']
        id_study_case = request.POST['id_study_case']
        filtercity = Cities.objects.get(pk=id_city)
        if(process == 'Edit' or process == 'View' or process == 'Clone'):
            sc = StudyCases.objects.get(pk=id_study_case)
            scnbs_list = StudyCases_NBS.objects.filter(studycase=sc)
            if(process == 'Clone'):
                nbs_user = WaterproofNbsCa.objects.filter(added_by=request.user, country=filtercity.country).exclude(added_by__professional_role='ADMIN').values(
                    "id", "name" ,"unit_implementation_cost", "unit_maintenance_cost","periodicity_maitenance","unit_oportunity_cost", "currency__currency")
            else:
                nbs_user = WaterproofNbsCa.objects.filter(added_by=sc.added_by, country=filtercity.country).exclude(added_by__professional_role='ADMIN').values(
                    "id", "name","unit_implementation_cost", "unit_maintenance_cost","periodicity_maitenance","unit_oportunity_cost", "currency__currency")
            nbs_list = chain(nbs_admin, nbs_user)
            for n in nbs_list:
                defaultValue = False
                id_nbs = n['id'],
                id_nbssc = None,
                value_nbs = None
                for nbsStudy in scnbs_list:
                    if n['id'] == nbsStudy.nbs.id:
                        defaultValue = True
                        id_nbssc = nbsStudy.id
                        value_nbs = nbsStudy.value
                nObject = {
                    'id': id_nbs,
                    'id_nbssc': id_nbssc,
                    'name': n['name'],
                    'default': defaultValue,
                    'value': value_nbs,
                    'unit_implementation_cost':n['unit_implementation_cost'],
                    'unit_maintenance_cost':n['unit_maintenance_cost'],
                    'periodicity_maitenance':n['periodicity_maitenance'],
                    'unit_oportunity_cost':n['unit_oportunity_cost'],
                }
                nbs.append(nObject)
        elif(process == 'Create'):
            nbs_user = WaterproofNbsCa.objects.filter(added_by=request.user, country=filtercity.country).exclude(added_by__professional_role='ADMIN').values(
                "id", "name","unit_implementation_cost", "unit_maintenance_cost","periodicity_maitenance","unit_oportunity_cost", "currency__currency")
            nbs_list = chain(nbs_admin, nbs_user)
            nbs = list(nbs_list)
        return JsonResponse(nbs, safe=False)


@api_view(['POST'])
def getBiophysical(request):
    if request.method == 'POST':
        biophysical_list = []
        id_intake = request.POST['id_intake']
        macro_region = Polygon.objects.filter(intake__pk=id_intake).values(
            "basin__label").first()
        biophysical = Parameters_Biophysical.objects.filter(
            macro_region=macro_region['basin__label'], default='y').values()
        if(request.POST['id_study_case']):
            id_study_case = request.POST['id_study_case']
            biophysical_sc = Parameters_Biophysical.objects.filter(
                study_case_id=id_study_case, intake_id=id_intake).values()
            for bio in biophysical:
                add_bio = True
                bio['edit'] = False
                for biosc in biophysical_sc:
                    if(bio['lucode'] == biosc['lucode']):
                        add_bio = False
                        biosc['edit'] = True
                        biophysical_list.append(biosc)
                if(add_bio):
                    biophysical_list.append(bio)

        else:
            biophysical_list = biophysical
        data = list(biophysical_list)
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
def private(request, idx):
    sc = StudyCases.objects.get(id=idx)
    if not sc:
        print("Not found")
        context = {
            'status': '400', 'reason': 'tudy case not found'
        }
        response = HttpResponse(json.dumps(context), content_type='application/json')
        response.status_code = 400
        return response
    else:
        # private object
        sc.is_public = False
        sc.edit_date = datetime.datetime.now()
        sc.save()
        # after public redirect to
        # home page
        context = {
            'status': '200', 'reason': 'sucess'
        }
        response = HttpResponse(json.dumps(context), content_type='application/json')
        response.status_code = 200
        return response
    
@api_view(['POST'])
def public(request, idx):
    sc = StudyCases.objects.get(id=idx)
    if not sc:
        print("Not found")
        context = {
            'status': '400', 'reason': 'Study case not found'
        }
        response = HttpResponse(json.dumps(context), content_type='application/json')
        response.status_code = 400
        return response
    else:
        # public object
        sc.is_public = True
        sc.edit_date = datetime.datetime.now()
        sc.save()
        # after public redirect to
        # home page
        context = {
            'status': '200', 'reason': 'sucess'
        }
        response = HttpResponse(json.dumps(context), content_type='application/json')
        response.status_code = 200
        return response


@api_view(['POST'])
def saveBiophysicals(request):
    if not request.user.is_authenticated:
        return render(request, 'waterproof_study_cases/studycases_login_error.html')
    else:
        if request.method == 'POST':
            if(request.POST['biophysicals']):
                biophysicals = request.POST['biophysicals']
                biophysicals_list = json.loads(biophysicals[1:])
                id_study = request.POST['id_study_case']
                biophysical_sc = Parameters_Biophysical.objects.filter(
                    study_case_id=id_study)
                for biosc in biophysical_sc:
                    delete = True
                    for bio in biophysicals_list:
                        if(str(biosc.lucode) == bio['lucode'] and str(biosc.intake_id) == bio['intake_id']):
                            bio['study_case_id'] = id_study
                            bio['default'] = 'N'
                            for key in bio:
                                value = bio[key]
                                setattr(biosc, key, value)
                            biosc.save()
                            biophysicals_list.remove(bio)
                            delete = False
                    if(delete):
                        biosc.delete()
                for bio in biophysicals_list:
                    macro_region = Polygon.objects.filter(intake__pk=bio['intake_id']).values(
                        "basin__label").first()
                    biophysical = Parameters_Biophysical.objects.filter(
                        macro_region=macro_region['basin__label'], default='y', lucode=bio['lucode']).values().first()
                    pb = Parameters_Biophysical()
                    bio['lulc_desc'] = biophysical['lulc_desc']
                    bio['kc'] = biophysical['kc']
                    bio['macro_region'] = biophysical['macro_region']
                    bio['study_case_id'] = id_study
                    bio['default'] = 'N'
                    for key in bio:
                        value = bio[key]
                        setattr(pb, key, value)
                    pb.user_id = request.user.id
                    pb.save()
    return JsonResponse({'id_study_case': id_study}, safe=False)


@api_view(['POST'])
def save(request):
    if not request.user.is_authenticated:
        return render(request, 'waterproof_study_cases/studycases_login_error.html')
    else:
        if request.method == 'POST':
            if(request.POST.get('name')):
                id_city = request.POST['city_id']
                city = Cities.objects.get(pk=id_city)
                name = request.POST['name']
                name_old = ''
                id_study_case = request.POST['id_study_case']
                description = request.POST['description']
                sctype = request.POST['type']
                functions = request.POST['functions']
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
                    sc.edit_date = datetime.datetime.now()
                    sc.name = name
                    sc.city = city
                    sc.description = description
                    sc.cost_functions = functions
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
                    sc.edit_date = datetime.datetime.now()
                    sc.save()
                    return JsonResponse({'id_study_case': sc.id}, safe=False)
                else:
                    sc.benefit_carbon_market = False
                    sc.edit_date = datetime.datetime.now()
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
                nlist = StudyCases_NBS.objects.filter(studycase=sc)
                for nb in nbs:
                    add = True
                    for nbssc in nlist:
                        if(nbssc.nbs.id == int(nb)):
                            add = False
                    if(add):
                        n = WaterproofNbsCa.objects.get(pk=nb)
                        nnbsscn = StudyCases_NBS()
                        nnbsscn.studycase = sc
                        nnbsscn.nbs = n
                        nnbsscn.save()
                for nbssc in nlist:
                    delete = True
                    for nb in nbs:
                        if(int(nb) == nbssc.nbs.id):
                            delete = False
                    if(delete):
                        nbssc.delete()
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
                sc.discount_rate_maximum = request.POST['maximum']
                sc.discount_rate_minimunm = request.POST['minimum']
                sc.transaction_cost = request.POST['transaction']
                sc.others = request.POST['others']
                sc.travel = request.POST['travel']
                sc.contracts = request.POST['contracts']
                sc.financial_currency = request.POST['financial_currency']
                sc.edit_date = datetime.datetime.now()
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
                if(request.POST['nbsactivities']):
                    nbsactivities = request.POST['nbsactivities']
                    nbsactivities_list = json.loads(nbsactivities[1:])
                    for nbsa in nbsactivities_list:
                        id_nbssa = nbsa['id']
                        nbssc = StudyCases_NBS.objects.get(pk=id_nbssa)
                        if(nbsa['value']):
                            nbssc.value = nbsa['value']
                            sc.edit_date = datetime.datetime.now()
                            nbssc.save()
                if(request.POST['currencys']):
                    currencys = request.POST['currencys']
                    currencys_list = json.loads(currencys[1:])
                    currencys_sc = StudyCases_Currency.objects.filter(studycase=sc)
                    for currency_sc in currencys_sc:
                        delete = True
                        for currency in currencys_list:
                            if(currency_sc.currency == currency['currency']):
                                currency_sc.value = currency['value']
                                currency_sc.save()
                                currencys_list.remove(currency)
                                delete = False
                        if(delete):
                            currencys_sc.delete()
                    for currency in currencys_list:
                        currencys_sc = StudyCases_Currency()
                        currencys_sc.currency = currency['currency']
                        currencys_sc.value = currency['value']
                        currencys_sc.studycase = sc
                        currencys_sc.save()
                sc.edit_date = datetime.datetime.now()
                sc.save()
                return JsonResponse({'id_study_case': sc.id}, safe=False)
            
@api_view(['POST'])
def run(request):
    if not request.user.is_authenticated:
        return render(request, 'waterproof_study_cases/studycases_login_error.html')
    else:
        if request.method == 'POST':
            if(request.POST.get('run_analysis')):
                run = request.POST.get('run_analysis')
                id_study_case = request.POST['id_study_case']
                sc = StudyCases.objects.get(pk=id_study_case)
                sc.is_run_analysis = False
                if(run == 'true'):
                    sc.is_run_analysis = True
                sc.edit_date = datetime.datetime.now()
                sc.save()
                return JsonResponse({'id_study_case': sc.id}, safe=False)