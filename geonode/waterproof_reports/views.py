from django.http import JsonResponse
from django.shortcuts import render
from django.core import serializers
from geonode.waterproof_parameters.models import Countries, Regions, Cities
from .models import investIndicators
from geonode.waterproof_study_cases.models import StudyCases



def dashboard(request):
    return render(request, 'waterproof_reports/dashboard.html', {})

def pivot_data(request):
    dataset = Countries.objects.all()
    data = serializers.serialize('json', dataset)
    return JsonResponse(data, safe=False)

def reportMenu(request):
                return render(
                    request,
                    'waterproof_reports/reports_menu.html',
                    {})

def getNames(indicators):
    result = []
    for objectIndicator in indicators:  
        try:
            if objectIndicator.intake.name not in result:
                result.append(objectIndicator.intake.name)
        except:
            print ("")
    return result

def getNameCity(indicators):
    result = []
    for objectIndicatorcity in indicators:
        try:
            if objectIndicatorcity.intake.city.name not in result:
                result.append(objectIndicatorcity.intake.city.name)
        except:
            print ("")
    return result

def physicalIndicators(request, idx):

                indicators = investIndicators.objects.filter(study_case__id=idx)
                indicatorsNames = getNames(indicators)
                indicatorsNameCity = getNameCity(indicators)
                return render(
                    request,
                    'waterproof_reports/physicalIndicators.html',
                    {
                        'Indicators': indicators,
                        'NamesIndicators': indicatorsNames,
                        'NameCityIndicators': indicatorsNameCity
                    })


def financialIndicators(request):

                indicators = investIndicators.objects.all()
                indicatorsNames = getNames(indicators)
                indicatorsNameCity = getNameCity(indicators)
                return render(
                    request,
                    'waterproof_reports/financialIndicators.html',
                    {
                        'Indicators': indicators,
                        'NamesIndicators': indicatorsNames,
                        'NameCityIndicators': indicatorsNameCity
                    })

def decisionIndicators(request):

                indicators = investIndicators.objects.all()
                indicatorsNames = getNames(indicators)
                indicatorsNameCity = getNameCity(indicators)
                return render(
                    request,
                    'waterproof_reports/decisionIndicators.html',
                    {
                        'Indicators': indicators,
                        'NamesIndicators': indicatorsNames,
                        'NameCityIndicators': indicatorsNameCity
                    })

def geographicIndicators(request):

                indicators = investIndicators.objects.all()
                indicatorsNames = getNames(indicators)
                indicatorsNameCity = getNameCity(indicators)
                return render(
                    request,
                    'waterproof_reports/geographicIndicators.html',
                    {
                        'Indicators': indicators,
                        'NamesIndicators': indicatorsNames,
                        'NameCityIndicators': indicatorsNameCity
                    })


def compareMaps(request):

    base_data = ''
    intake = ''
    if request.method == 'GET':
        try:            
            base_data = request.GET['folder']
            intake = request.GET['intake']
        except:
            base_data = 'mapserver'
            intake = ''
        

    return render(
                request,
                'waterproof_reports/compare_maps.html',
                {
                    'base_data': base_data,
                    'intake': intake,
                }
            )