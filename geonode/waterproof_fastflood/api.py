import datetime
import logging
import time
import os
import shutil
from django.utils import timezone
from django.http import HttpResponse
from django.http.response import JsonResponse
from geonode.waterproof_fastflood.models import Damage, Fastflood_investment_scenario, Fastflood_json_params, StudyCase_damage_curve, StudyCase_depth_damage, StudyCases, StudyCases_Currency_Fastflood, StudyCases_NBS_Fastflood, StudyCases_Parameters_Bio, Watershed, Polygon, MaxDamageCost
from geonode.waterproof_nbs_ca.models import WaterproofNbsCa, WaterproofPrLulc
from geonode.waterproof_parameters.models import Cities,  Countries_factor, ManagmentCosts_Discount, Parameters_Biophysical, WaterproofPrLulcParameters
from geonode.waterproof_study_cases.models import Portfolio
from geonode.waterproof_intake.models import Basins
from geonode.waterproof_fastflood_reports.models import log_fastflood
from itertools import chain
from rest_framework.decorators import api_view
from rest_framework import serializers

from django.conf import settings
from django.db import connection
import requests
import json
logger = logging.getLogger(__name__)

@api_view(['GET'])
def watershedUsedByStudyCases(request,idx):
    
    try:
        id_ws = idx
        count = StudyCases.objects.filter(watershed=id_ws).count()
        return JsonResponse({'count': count}, safe=False)
    except Exception as e:
         return JsonResponse({"error": 'value must be integer'})


@api_view(['GET'])
def getWatershedByCity(request, id_city):
    if request.method == 'GET':
        try:
            id = int(id_city)
            filterWatershed = Watershed.objects.filter(city=id,added_by=request.user,is_complete=True).values(
                "id", "name", "description","ws_area" ,"demvalue")
            data = list(filterWatershed)
            return JsonResponse(data, safe=False)
        except Exception as e:
            return JsonResponse({"error": 'invalid id'})
        
@api_view(['GET'])
def get_watershed_by_id(request, id):
    if request.method == 'GET':
        try:
            filterWatershed = Watershed.objects.filter(id=id).values(
                "id", "name", "description","ws_area" ,"demvalue")
            data = list(filterWatershed)
            return JsonResponse(data, safe=False)
        except Exception as e:
            return JsonResponse({"error": 'invalid id'})

@api_view(['GET'])        
def getWatersheds(request):
    
    try:
        ws = Watershed.objects.all().values("id", "name", "polygon__bbox", "polygon__resolution", "polygon__id")
        return JsonResponse(list(ws), safe=False)
    except Exception as e:
        return JsonResponse({"error": e.args})
        
@api_view(['GET'])
def getInfoWatershedById(request, idx):
    if request.method == 'GET':
        print('Get Watershed by ID:', idx)
        try:
            watershed = Watershed.objects.filter(id=idx).values("id", "name", "polygon__bbox", "polygon__resolution", "polygon__id")            
            return JsonResponse(list(watershed), safe=False)
        except Exception as e:
            print('Error buscando la cuenca', e)
            return JsonResponse({"error": 'invalid id'})
        
@api_view(['POST'])
def save(request):
    if not request.user.is_authenticated:
        return render(request, 'waterproof_fastflood/studycases_login_error.html')
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
                now = datetime.datetime.now(tz=timezone.utc)                    
                if(id_study_case == ''):
                    sc = StudyCases()
                    sc.added_by = request.user
                    sc.create_date = now
                else:
                    sc = StudyCases.objects.get(pk=id_study_case)
                    name_old = sc.name
                exists = False
                if(name != name_old):
                    exists = StudyCases.objects.filter(name__iexact=name, added_by=request.user).exists()                
                if (not exists):
                    # sc.studycase_type = 'FASTFLOOD'                    
                    sc.edit_date = now
                    sc.name = name
                    sc.city = city
                    sc.description = description
                    sc.save()
                    watersheds = request.POST.getlist('watersheds[]')
                    sc.watershed.clear()
                    for ws in watersheds:
                        watershed = Watershed.objects.get(pk=ws)
                        watersheds = StudyCases.objects.filter(watershed=ws, pk=sc.id)
                        if(len(watersheds) == 0):
                            sc.watershed.add(watershed)

                    return JsonResponse({'id_study_case': sc.id}, safe=False)
                else:
                    return JsonResponse({'id_study_case': ''}, safe=False)
            elif(request.POST.get('folder_name')):
                id_study_case = request.POST['id_study_case']
                sc = StudyCases.objects.get(pk=id_study_case)
                sc.folder_name = request.POST['folder_name']
                sc.save()
                return JsonResponse({'id_study_case': sc.id}, safe=False)
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
                nlist = StudyCases_NBS_Fastflood.objects.filter(studycase=sc)
                for nb in nbs:
                    add = True
                    for nbssc in nlist:
                        if(nbssc.nbs.id == int(nb)):
                            add = False
                    if(add):
                        n = WaterproofNbsCa.objects.get(pk=nb)
                        nnbsscn = StudyCases_NBS_Fastflood()
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
            elif(request.POST.get('ocean_elevation')):
                id_study_case = request.POST['id_study_case']
                sc = StudyCases.objects.get(pk=id_study_case)
                sc.ocean_elevation = request.POST['ocean_elevation'].replace(',', '.')
                sc.commercial_value = request.POST['commercial_value']
                sc.industrial_value = request.POST['industrial_value']
                sc.exponential_parameters = request.POST['exponential_params']
                sc.width_mul = request.POST['width_mul']
                sc.width_exp = request.POST['width_exp']
                sc.depth_mul = request.POST['depth_mul']
                sc.depth_exp = request.POST['depth_exp']
                sc.min_cross = request.POST['min_cross']
                sc.channel_manning = request.POST['channel_mannings']
                sc.damage_currency_exchange = request.POST['exchange_rate']
                sc.damage_currency = request.POST['damage_currency']
                sc.edit_date = datetime.datetime.now()
                sc.save()
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
                sc.climate_scenario_id = request.POST['analysis_nbs']
                sc.analysis_currency = request.POST.get('analysis_currency')
                sc.studycase_type = request.POST['studycase_type']
                sc.analysis_period_value = request.POST.get('period_analysis')
                sc.annual_investment = request.POST['annual_investment'].replace(',', '.')
                sc.change_year = request.POST['change_year']
                sc.analysis_storm_duration = request.POST['analisys_storm'].replace(',', '.')
                sc.design_storm_duration = request.POST['storm_duration']
                sc.quantile = request.POST['quantile']                
                sc.analysis_type = 'INVESTMENT'
                sc.annual_investment = request.POST['annual_investment'].replace(',', '.')
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
                        nbssc = StudyCases_NBS_Fastflood.objects.get(pk=id_nbssa)
                        if(nbsa['value']):
                            nbssc.value = nbsa['value']
                            sc.edit_date = datetime.datetime.now()
                            nbssc.save()
                if(request.POST['currencys']):
                    currencys = request.POST['currencys']
                    currencys_list = json.loads(currencys[1:])
                    currencys_sc = StudyCases_Currency_Fastflood.objects.filter(studycase=sc)
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
                        currencys_sc = StudyCases_Currency_Fastflood()
                        currencys_sc.currency = currency['currency']
                        currencys_sc.value = currency['value']
                        currencys_sc.studycase = sc
                        currencys_sc.save()
                sc.edit_date = datetime.datetime.now()
                sc.save()
                return JsonResponse({'id_study_case': sc.id}, safe=False)            

#Devuelven los parametros biophysicos por macro region recibiendo como parametro el watershed_id
@api_view(['GET'])
def parametersBiophysicalByMacro(request, watershed_id):
    if request.method == 'GET':
        try:
            polygon = Polygon.objects.get(watershed=watershed_id)
            macro_region = Basins.objects.get(id=polygon.basin_id).label 
            parametersList = []
            parameters = Parameters_Biophysical.objects.filter(macro_region=macro_region,default='y').order_by('lucode').values()
            for parameter in parameters:
                parametersList.append({
                    "code": parameter['lucode'],
                    "macro_region": parameter['macro_region'],
                    "lulc": parameter['lulc_desc'],
                    "c_above": parameter['c_above'],
                    "c_below": parameter['c_below'],
                    "c_soil": parameter['c_soil'],
                    "c_dead": parameter['c_dead'],
                })
            return JsonResponse(parametersList, safe=False)
        except Exception as e:
                print('Error buscando los dataos',e)
                return JsonResponse({"error": e})
            
@api_view(['GET'])
def parametersBiophysicalByStudyCase(request, study_case_id):
    if request.method == 'GET':
        try: 
            parametersList = []
            parameters = StudyCases_Parameters_Bio.objects.filter(study_case=study_case_id).order_by('lucode').values()
            for parameter in parameters:
                parametersList.append({
                    "code": parameter['lucode'],
                    "macro_region": parameter['macro_region'],
                    "lulc": parameter['lulc_desc'],
                    "c_above": parameter['c_above'],
                    "c_below": parameter['c_below'],
                    "c_soil": parameter['c_soil'],
                    "c_dead": parameter['c_dead'],
                })
            return JsonResponse(parametersList, safe=False)
        except Exception as e:
                print('Error buscando los dataos',e)
                return JsonResponse({"error": e})

@api_view(['GET'])
def getDamageInfoByCountry(request, isoCountryValue):
    if request.method == 'GET':
        try:
            damageList = []
            damages = Damage.objects.filter(iso=isoCountryValue).values().order_by('flood_depth')
            for damage in damages:
                damageList.append({
                    "iso": damage['iso'],
                    "flood_depth": damage['flood_depth'],
                    "country": damage['country'],
                    "continent": damage['continent'],
                    "damage_class": damage['damage_class'],
                    "damage_factor": f"{round(float(damage['damage_factor']), 2):.2f}",
                })
            return JsonResponse(damageList, safe=False)
        except Exception as e:
                print('Error buscando los datos',e)
                return JsonResponse({"error": e})

@api_view(['GET'])
def getMaxDamageCostByCountry(request, countryIso):    
    try:
        maxDamageCostList = []
        maxDamageCosts = MaxDamageCost.objects.filter(iso=countryIso).values().order_by('damage_class')
        for maxDamageCost in maxDamageCosts:
            maxDamageCostList.append({
                "iso": maxDamageCost['iso'],
                "damage_class": maxDamageCost['damage_class'],
                "max_damage_cost": f"{round(float(maxDamageCost['max_damage_cost']), 2):.2f}",
            })
        return JsonResponse(maxDamageCostList, safe=False)
    except Exception as e:
            print('Error buscando los datos',e)
            return JsonResponse({"error": e})
                
@api_view(['GET'])
def getParameterByCountry(request, id_city):
    if request.method == 'GET':
        try:
            id = int(id_city)
            filtercity = Cities.objects.get(pk=id)
            filterpm = ManagmentCosts_Discount.objects.filter(country=filtercity.country).values()
            data = list(filterpm)
            return JsonResponse(data, safe=False)
        except Exception as e:
            return JsonResponse({"error": 'invalid id'})  

@api_view(['POST'])
def getNBS(request):
    if request.method == 'POST':
        nbs = []
        nbs_admin = WaterproofNbsCa.objects.filter(added_by__professional_role='ADMIN').values(
            "id", "name","unit_implementation_cost", "unit_maintenance_cost","periodicity_maitenance","unit_oportunity_cost", "currency__currency", "country__iso3")
        id_city = request.POST['city_id']
        logger.error(id_city) 
        process = request.POST['process']
        id_study_case = request.POST['id_study_case']
        filtercity = Cities.objects.get(pk=id_city)
        global_multiplier_factor = filtercity.country.global_multiplier_factor
        for n_admin in nbs_admin:
            n_admin['country__global_multiplier_factor'] = global_multiplier_factor
        if(process == 'Edit' or process == 'View' or process == 'Clone' or process == 'Quick'):
            sc = StudyCases.objects.get(pk=id_study_case)
            scnbs_list = StudyCases_NBS_Fastflood.objects.filter(studycase=sc)
            print("Process: %s" % process)
            if(process == 'Clone'):
                cloneId=request.POST['clone_id']
                scnbs_list_clone = StudyCases_NBS_Fastflood.objects.filter(studycase=cloneId)
                nbs_list=[]
                for sbn in scnbs_list_clone:
                    nbs_list.append(sbn.nbs_id)
                
                nbs_clone = WaterproofNbsCa.objects.filter(id__in=nbs_list, country=filtercity.country).exclude(added_by__professional_role='ADMIN').values(
                    "id", "name" ,"unit_implementation_cost", "unit_maintenance_cost","periodicity_maitenance","unit_oportunity_cost", "currency__currency","country__global_multiplier_factor", "country__iso3")
                nbs_per = WaterproofNbsCa.objects.filter(added_by=sc.added_by,country=filtercity.country).exclude(added_by__professional_role='ADMIN').values(
                    "id", "name" ,"unit_implementation_cost", "unit_maintenance_cost","periodicity_maitenance","unit_oportunity_cost", "currency__currency","country__global_multiplier_factor", "country__iso3")
                nbs_user=chain(nbs_clone, nbs_per)
                
            elif(process == 'Quick'):
                nbs_user = WaterproofNbsCa.objects.filter(country=filtercity.country).exclude(added_by__professional_role='ADMIN').values(
                    "id", "name" ,"unit_implementation_cost", "unit_maintenance_cost","periodicity_maitenance","unit_oportunity_cost", "currency__currency","country__global_multiplier_factor", "country__iso3")
            else:
                nbs_user = WaterproofNbsCa.objects.filter(added_by=sc.added_by, country=filtercity.country).exclude(added_by__professional_role='ADMIN').values(
                    "id", "name","unit_implementation_cost", "unit_maintenance_cost","periodicity_maitenance","unit_oportunity_cost", "currency__currency", "country__global_multiplier_factor", "country__iso3")
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
                    'country__global_multiplier_factor':n['country__global_multiplier_factor'],
                    'country': n['country__iso3'],
                    'currency': n['currency__currency']
                }
                nbs.append(nObject)
        elif(process == 'Create'):
            nbs_user = WaterproofNbsCa.objects.filter(added_by=request.user, country=filtercity.country).exclude(added_by__professional_role='ADMIN').values(
                "id", "name","unit_implementation_cost", "unit_maintenance_cost","periodicity_maitenance","unit_oportunity_cost", "currency__currency", "country__iso3")
            nbs_list = chain(nbs_admin, nbs_user)
            nbs = list(nbs_list)
        return JsonResponse(nbs, safe=False)
    
@api_view(['GET'])
def getStudyCaseCurrencys(request):
    if request.method == 'GET':
        id = int(request.GET.get('id'))
        currencys = []
        sc = StudyCases.objects.get(id=id)
        sc_currency = request.GET.get('currency')
        list_currency_type = []
        if(sc_currency):            
            sc_factor = Countries_factor.objects.filter(currency=sc_currency).first()
            scnbs = StudyCases_NBS_Fastflood.objects.filter(studycase=sc)
            
            for nbs in scnbs:
                nbsCurrency = WaterproofNbsCa.objects.filter(pk=nbs.nbs_id).values('currency_id__currency').distinct()
                for nbsc in nbsCurrency:
                    nbs_cu = nbsc['currency_id__currency']
                    if( nbs_cu and nbs_cu != sc_currency and not any(element['currency'] in nbs_cu for element in currencys)):
                        currency = {}
                        currency['currency'] = nbs_cu
                        scc = StudyCases_Currency_Fastflood.objects.filter(
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
                scc = StudyCases_Currency_Fastflood.objects.filter(studycase=sc, currency=sc_cm_currency).first()
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
                scc = StudyCases_Currency_Fastflood.objects.filter(studycase=sc, currency=sc_f_currency).first()
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
            scc = StudyCases_Currency_Fastflood.objects.filter(studycase=sc)
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
def saveBiophysicals(request):
    if request.method == 'POST':
        data = request.data 
        
        biophysical = data.get("sc_bio", [])
        id_study_case = data.get("id_study_case")
        watershed_id = data.get("watershed_id")
        
        sc = StudyCases.objects.get(pk=id_study_case)
        user_id = sc.added_by
        polygon = Polygon.objects.get(watershed=watershed_id)
        macro_region = Basins.objects.get(id=polygon.basin_id).label 

        parameters = Parameters_Biophysical.objects.filter(macro_region=macro_region, default='y').order_by('lucode').values()

        initParams = StudyCases_Parameters_Bio.objects.filter(study_case=sc)
        if initParams.exists():
            initParams.delete()

        fields_to_copy = [
            'lucode', 'macro_region', 'lulc_desc', 'kc', 'root_depth', 'usle_c', 'usle_p',
            'load_n', 'eff_n', 'load_p', 'crit_len_n', 'crit_len_p', 'proportion_subsurface_n',
            'cn_a', 'cn_b', 'cn_c', 'cn_d',
            'kc_1', 'kc_2', 'kc_3', 'kc_4', 'kc_5', 'kc_6', 'kc_7', 'kc_8', 'kc_9', 'kc_10', 'kc_11', 'kc_12',
            'sed_exp', 'rough_rank', 'cover_rank', 'p_ret', 'p_exp', 'n_exp', 'native_veg', 'lulc_veg'
        ]

        for parameter in parameters:

            pb_data = {field: parameter[field] for field in fields_to_copy}

            pb = StudyCases_Parameters_Bio(**pb_data)

            match = next((bio for bio in biophysical if bio['lulcode'] == parameter['lucode']), None)
            if match:
                pb.c_above = match.get('c_above', 0)
                pb.c_below = match.get('c_below', 0)
                pb.c_soil = match.get('c_soil', 0)
                pb.c_dead = match.get('c_dead', 0)
            else:
                pb.c_above = 0
                pb.c_below = 0
                pb.c_soil = 0
                pb.c_dead = 0
            
            pb.study_case = sc
            pb.user_id = user_id.id
            
            pb.save()
            
        return JsonResponse({'id_study_case': sc.id}, safe=False)
       
@api_view(['POST'])
def saveDamageData(request):
    if request.method == 'POST':
        data = request.data 
        
        id_study_case = data.get("id_study_case")
        sc = StudyCases.objects.get(pk=id_study_case)
        damageCurve = data.get("damage_data", [])
        maxDamage = data.get("max_damage_data",[] )
        
        for item in maxDamage:
            StudyCase_depth_damage.objects.update_or_create(
            study_case=sc, 
            defaults={       
                "residential": item.get("residential", 0),
                "commercial": item.get("commercial", 0),
                "industrial": item.get("industrial", 0),
                "infraroad": item.get("infraroad", 0),
                "agriculture": item.get("agriculture", 0),
            }
        )
            
        depthDamageData = StudyCase_damage_curve.objects.filter(study_case=sc)
        if depthDamageData.exists():
            depthDamageData.delete()
        
        for item in damageCurve:
            StudyCase_damage_curve.objects.create(
                study_case=sc,
                flood_depth = item.get("flood_depth", 0),
                residential = item.get("residential", 0),
                commercial = item.get("commercial", 0),
                industrial = item.get("industrial", 0),
                infraroad = item.get("infraroad", 0),
                agriculture = item.get("agriculture", 0),
            )
            
        return JsonResponse({'id_study_case': sc.id}, safe=False)
    
@api_view(['POST'])
def delete(request, idx):
    sc = StudyCases.objects.get(id=idx)
    if not sc:
        print("Not found")
        context = {
            'status': '400', 'reason': 'Study Case not found'
        }
        response = HttpResponse(json.dumps(context), content_type='application/json')
        response.status_code = 400
        return response
    else:
        # Check if folder_name exists and delete associated files/folders
        if sc.folder_name:
            base_path = '/app/outputs/fastflood'
            folder_name = sc.folder_name

            # Path to the directory
            directory_path = os.path.join(base_path, folder_name)

            # Path to the zip file
            zip_file_path = os.path.join(base_path, f"{folder_name}.zip")

            # Try to delete the directory
            if os.path.exists(directory_path):
                try:
                    shutil.rmtree(directory_path)
                    logger.info(f"Successfully deleted directory: {directory_path}")
                    print(f"Successfully deleted directory: {directory_path}")
                except Exception as e:
                    logger.error(f"Error deleting directory {directory_path}: {str(e)}")
                    print(f"Error deleting directory {directory_path}: {str(e)}")
            else:
                logger.warning(f"Directory not found: {directory_path}")
                print(f"Directory not found: {directory_path}")

            # Try to delete the zip file
            if os.path.exists(zip_file_path):
                try:
                    os.remove(zip_file_path)
                    logger.info(f"Successfully deleted zip file: {zip_file_path}")
                    print(f"Successfully deleted zip file: {zip_file_path}")
                except Exception as e:
                    logger.error(f"Error deleting zip file {zip_file_path}: {str(e)}")
                    print(f"Error deleting zip file {zip_file_path}: {str(e)}")
            else:
                logger.warning(f"Zip file not found: {zip_file_path}")
                print(f"Zip file not found: {zip_file_path}")

        # delete object from database
        print(sc.delete())
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
            'status': '400', 'reason': 'Study case not found'
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
def run(request):
    if not request.user.is_authenticated:
        return render(request, 'waterproof_fastflood/studycases_login_error.html')
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
            
@api_view(['GET'])
def getStudyCasesLogStatus(request, id_study_case):
    if request.method == 'GET':
        try:
            study_case_id_log = int(id_study_case) 
            study_case_log = log_fastflood.objects.filter(study_case_id=study_case_id_log).order_by('step_id')
            class LogSerializer(serializers.ModelSerializer):
                class Meta:
                    model = log_fastflood
                    fields = '__all__'

            serializer = LogSerializer(study_case_log, many=True)
            return JsonResponse(serializer.data, safe=False)
        except Exception as e:
            return JsonResponse({"error": e})

@api_view(['POST'])
def createJson(dataRequest):
    if dataRequest.method == 'POST':
        data = dataRequest.data
        studyCaseId = data.get('id_study_case')
        sc = StudyCases.objects.get(id=studyCaseId)
        watershed = sc.watershed.first()
        WI_ID = "WI_" + str(watershed.id)
        # if sc.is_run_analysis:
        json_params = {
            f"{p.id}": p.value
            for p in Fastflood_json_params.objects.all()
        }
        polygon = Polygon.objects.get(watershed=watershed.id)
        zone = Basins.objects.get(id=polygon.basin_id)
        zone_label = zone.label
        folder = sc.folder_name
        study_case_scenario = Fastflood_investment_scenario.objects.get(id=sc.climate_scenario_id)
        projectPath =f"/app/outputs/fastflood/{folder}"

        json_data = {
            "ProjectPath": projectPath,
            "NameBasinFolder": WI_ID,
            "AccessData": projectPath+"/AccessData.json",
            "FastFloodPath": "/app/fastflood/fastflood",
            "CatchmentPath": projectPath+"/"+WI_ID+"/in/watershed/watershed.shp",
            "DEMPath": projectPath+"/"+WI_ID+"/in/06-FLOOD/Raster/DEM.tif",
            "ManningPath": projectPath+"/"+WI_ID+"/in/06-FLOOD/Raster/Manning.tif",
            "InfiltrationPath": projectPath+"/"+WI_ID+"/in/06-FLOOD/Raster/Infiltration.tif",
            "FastFloodLulcPath": projectPath+"/"+WI_ID+"/in/06-FLOOD/Raster/Lu.tif",
            "CurrentLulcPath": projectPath+"/"+WI_ID+"/in/03-RIOS/LULC_"+zone_label+".tif",
            "BauLulcPath": projectPath+"/"+WI_ID+"/in/02-INVEST/CARBON/LULC_"+zone_label+"_BAU.tif",
            "PortfolioPath": projectPath+"/"+WI_ID+"/out/03-RIOS/1_investment_portfolio_adviser_workspace/activity_portfolios/activity_portfolio_total.tif",   
            "DamagesDataBasePath": "/data/global_datasets",
            "DemResolution": watershed.demvalue,
            "DemDataBase": "cop",
            "SplitArea": {
                "Commercial": sc.commercial_value/100,
                "Industrial": sc.industrial_value/100
            },
            "NbS": getNbsJson(sc.id),
            "LulcParams": {
                "Manning": {
                    "10-forest": float(json_params["1"]),
                    "20-shrubs": float(json_params["2"]),
                    "30-grass": float(json_params["3"]),
                    "40-crops": float(json_params["4"]),
                    "50-building": float(json_params["5"]),
                    "60-bare": float(json_params["6"]),
                    "70-snow": float(json_params["7"]),
                    "80-water": float(json_params["8"]),
                    "90-wetland": float(json_params["9"]),
                    "100-mangroves": float(json_params["10"]),
                    "110-moss": float(json_params["11"])
                },
                "InfiltrationChange": {
                "2-Forest,7-Shrublands": float(json_params["12"]),
                "2-Forest,8-Sparsevegetation": float(json_params["13"]),
                "2-Forest,4-Agriculture": float(json_params["14"]),
                "2-Forest,3-Grassland": float(json_params["15"]),
                "2-Forest,6-BareAreas": float(json_params["16"]),
                "2-Forest,5-Urban": float(json_params["17"]),
                "3-Grassland,4-Agriculture": float(json_params["31"]),
                "3-Grassland,6-BareAreas": float(json_params["18"]),
                "3-Grassland,5-Urban": float(json_params["19"]),
                "4-Agriculture,6-BareAreas": float(json_params["21"]),
                "4-Agriculture,5-Urban": float(json_params["22"]),
                "8-Sparsevegetation,4-Agriculture": float(json_params["24"]),
                "8-Sparsevegetation,6-BareAreas": float(json_params["23"]),
                "8-Sparsevegetation,5-Urban": float(json_params["33"]),
                "7-Shrublands,8-Sparsevegetation": float(json_params["25"]),
                "7-Shrublands,4-Agriculture": float(json_params["26"]),
                "7-Shrublands,3-Grassland": float(json_params["27"]),
                "7-Shrublands,6-BareAreas": float(json_params["28"]),
                "7-Shrublands,5-Urban": float(json_params["29"]),
                "6-BareAreas,5-Urban": float(json_params["30"])                
                },
            },
            "DamagesExchangeRate": float(sc.damage_currency_exchange),
            "ClimateParams": {	
                "ReturnPeriod": [1000, 500, 200, 100, 50, 40, 20, 10, 5, 2],
                "Scenario": study_case_scenario.code,
                "AnalysisStormDuration": sc.analysis_storm_duration,
                "DesignStormDuration_Historic": int(sc.design_storm_duration),
                "DesignStormDuration_ClimateChange": int(study_case_scenario.day),
                "StormQuantile": int(sc.quantile),
                "Period": int(sc.change_year)
            },
            "FastFloodParams": {
                "BoundaryCondition": sc.ocean_elevation,
                "ChannelParams": {
                    "Status": sc.exponential_parameters,
                    "WidthMul": float(sc.width_mul),
                    "WidthExp": float(sc.width_exp),
                    "DepthMul": float(sc.depth_mul),
                    "DepthExp": float(sc.depth_exp),
                    "CrossSection": float(sc.min_cross),
                    "ChannelManning": float(sc.channel_manning)
                }       
            }
        }
        
        internal_base = settings.WATERPROOF_MODELS_PY3_API_INTERNAL

        payload = {
            "case_folder": folder,
            "data": json_data
        }

        try:
            task_resp = requests.post(
                internal_base + 'task-save-ff-json',
                json=payload,
                timeout=10
            )
            task_id = task_resp.json()['task_id']

            for _ in range(30):  # máx 1 minuto (30 * 2s)
                poll = requests.get(f"{internal_base}tasks/{task_id}", timeout=10)
                result = poll.json()
                if result['task_status'] in ('SUCCESS', 'FAILURE'):
                    task_result = result['task_result']
                    if result['task_status'] == 'SUCCESS':
                        return JsonResponse({
                            "status": "ok",
                            "response_data": task_result
                        })
                    else:
                        return JsonResponse({
                            "status": "error",
                            "message": "Task failed",
                            "response": task_result
                        }, status=500)
                time.sleep(2)

            return JsonResponse({
                "status": "error",
                "message": "timeout waiting for task completion"
            }, status=504)
        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": str(e)
            }, status=502)
    else:
        return JsonResponse({"error": "Study case is not ready for analysis"}, status=400)

def getNbsJson(id_study_case):
    nbs_list = StudyCases_NBS_Fastflood.objects.select_related('nbs').filter(studycase=id_study_case).order_by('nbs')
    nbs_json = {}

    for index, n in enumerate(nbs_list):
        nb = n.nbs 
        nb_key = f"{index}-{nb.name}"

        nbs_sc = WaterproofPrLulc.objects.filter(nbsid=nb.id)
        lulc_data = {}

        for lulc in nbs_sc:
            lulc_param = WaterproofPrLulcParameters.objects.get(pk=lulc.lucode.pk)
            lulc_name = lulc_param.LULC_desc

            key = f"{lulc.lucode.pk}-{lulc_name}"
            lulc_data[key] = {
                "Manning": float(lulc.manning),
                "Infiltration": float(lulc.infiltration)
            }

        nbs_json[nb_key] = lulc_data
    return nbs_json

@api_view(['GET'])
def getCurrencyExchange(request):
    if request.method == 'GET':
        id = int(request.GET.get('id'))
        currencys = []
        sc = StudyCases.objects.get(id=id)
        sc_currency = request.GET.get('currency')
        sc_factor = Countries_factor.objects.filter(currency=sc_currency).first()
        base_factor = Countries_factor.objects.filter(currency='USD').first()
        value = base_factor.factor_EUR / sc_factor.factor_EUR
        
        return JsonResponse({'value': value}, safe=False)
    
@api_view(['POST'])
def studycase_exist_by_name(request):
    if request.method == 'POST':
        try:
            # Try to get data from JSON body first
            if hasattr(request, 'data') and request.data:
                name = request.data.get('name')
            else:
                # Fallback to POST data
                import json
                data = json.loads(request.body.decode('utf-8'))
                name = data.get('name')

            if not name:
                return JsonResponse({'error': 'Name is required'}, status=400)

            user = request.user
            print("Checking existence for study case name:", name, "and user:", user)
            exists = StudyCases.objects.filter(name__iexact=name, added_by=user).exists()
            return JsonResponse(exists, safe=False)
        except Exception as e:
            print("Error in studycase_exist_by_name:", str(e))
            return JsonResponse({'error': str(e)}, status=400)

@api_view(['POST'])
def watershed_exist_by_name(request):
    if request.method == 'POST':
        try:
            # Try to get data from JSON body first
            if hasattr(request, 'data') and request.data:
                name = request.data.get('name')
            else:
                # Fallback to POST data
                import json
                data = json.loads(request.body.decode('utf-8'))
                name = data.get('name')

            if not name:
                return JsonResponse({'error': 'Name is required'}, status=400)

            user = request.user
            print("Checking existence for watershed name:", name, "and user:", user)
            exists = Watershed.objects.filter(name__iexact=name, added_by=user).exists()
            return JsonResponse(exists, safe=False)
        except Exception as e:
            print("Error in watershed_exist_by_name:", str(e))
            return JsonResponse({'error': str(e)}, status=400)

@api_view(['GET'])
def get_storm_durations(request, watershed_id):
    """
    Retorna las duraciones de tormenta disponibles para un watershed dado.
    Si existe el archivo available_durations.json, retorna los valores del archivo.
    Si no existe, retorna los valores por defecto.
    """
    if request.method == 'GET':
        try:
            # Valores por defecto
            default_storm_durations = [3, 6, 12, 24, 48, 72, 120, 240]

            # Construir el path al archivo
            path_available_durations = os.path.join(
                '/app/outputs/fastflood',
                'WI_' + str(watershed_id),
                'in',
                '06-FLOOD',
                'available_durations.json'
            )

            # Verificar si el archivo existe
            if os.path.exists(path_available_durations):
                try:
                    with open(path_available_durations, 'r') as f:
                        filter_storm_duration = json.load(f)
                        storm_durations = filter_storm_duration.get('duration', default_storm_durations)
                        logger.info(f"Storm durations loaded from file for watershed {watershed_id}: {storm_durations}")
                        return JsonResponse({
                            'watershed_id': watershed_id,
                            'storm_durations': storm_durations,
                            'source': 'file'
                        }, safe=False)
                except Exception as e:
                    logger.error(f"Error reading storm durations file for watershed {watershed_id}: {str(e)}")
                    return JsonResponse({
                        'watershed_id': watershed_id,
                        'storm_durations': default_storm_durations,
                        'source': 'default',
                        'warning': f'Error reading file: {str(e)}'
                    }, safe=False)
            else:
                logger.info(f"File not found: {path_available_durations}. Using default values.")
                return JsonResponse({
                    'watershed_id': watershed_id,
                    'storm_durations': default_storm_durations,
                    'source': 'default'
                }, safe=False)

        except Exception as e:
            logger.error(f"Error in get_storm_durations for watershed {watershed_id}: {str(e)}")
            return JsonResponse({'error': str(e)}, status=400)

