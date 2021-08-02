import pandas as pd
import matplotlib
import highchartexport as hc_export
import json
import requests
import array

from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render
from django.core import serializers
from geonode.waterproof_parameters.models import Countries, Regions, Cities
from .models import investIndicators
from geonode.waterproof_study_cases.models import StudyCases
from pylab import title, figure, xlabel, ylabel, xticks, bar, legend, axis, savefig
from fpdf import FPDF
from django.http import HttpResponse


def pdf(request):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font('Arial', 'B', 20)
    pdf.set_text_color(57, 137, 169)
    pdf.cell(10, 50, 'Caso de estudio');


    pdf.set_font('Arial', '', 11)
    pdf.set_text_color(179, 179, 179)
    pdf.ln(0.15)
    pdf.cell(0, 70, 'Este informe es generado por WaterProof');
    pdf.ln(0.15)
    pdf.cell(0, 80, '(http://water-proof.org/) con el fin de proporcionar');
    pdf.ln(0.15)
    pdf.cell(0, 90, 'un portafolio de Soluciones basadas en las Naturales');
    pdf.ln(0.15)
    pdf.cell(0, 100, 'y su retorno de inversion.');
    pdf.ln(0.15)
    pdf.cell(0, 115, 'Desde este documento podrá tener una sitensis de');
    pdf.ln(0.15)
    pdf.cell(0, 125, 'los resultados de indicadores');

    requestJson = requests.get(settings.SITE_HOST_API + 'reports/getReportCostsAnalysisRoi/?studyCase=177')
    data = requestJson.json()

    categories = []
    totalCost = []
    totalDiscountedCost = []
    totalBenefits = []
    totalDiscountedBenefits = []

    for item in data:
        categories.append(item['record']);
        totalCost.append(item['totalCost']);
        totalDiscountedCost.append(item['totalDiscountedCost']);
        totalBenefits.append(item['totalBenefits']);
        totalDiscountedBenefits.append(item['totalDiscountedBenefits']);

    config = {
        'chart': {
            'type': 'column'
        },
        'title': {
            'text': 'Interactive graph of cost and benefits'
        },
        'colors': ['#008BAB', '#90D3E7', '#004B56', '#61D1C2'],
        'xAxis': {
            'categories': categories
        },
        'credits': {
            'enabled': 0
        },
        'series': [{
            'name': 'Total Cost',
            'data': totalCost
        },{
            'name': 'Total Discounted Cost',
            'data': totalDiscountedCost
        },{
            'name': 'Total Benefits',
            'type': 'spline',
            'dashStyle': 'shortdot',
            'data': totalBenefits
        },{
            'name': 'Total Discounted Benefits',
            'type': 'spline',
            'dashStyle': 'shortdot',
            'data': totalDiscountedBenefits
        }]
    }

    hc_export.save_as_png(config=config, filename="igocab.png")

    requestJson = requests.get(settings.SITE_HOST_API + 'reports/getCostAndBenefit/?studyCase=177')
    data = requestJson.json()

    dataCost = []
    dataBenefit = []

    for item in data:
        dataCost.append(item['costr']);
        dataBenefit.append(item['benefift']);

    config = {
        'chart': {
            'type': 'column'
        },
        'title': {
            'text': 'Cost and Benefits'
        },
        'colors': ['#008BAB', '#90D3E7'],
        'xAxis': {
            'categories': ['Cost and Benefits']
        },
        'credits': {
            'enabled': 0
        },
        'series': [{
            'name': 'Cost',
            'data': dataCost
        },{
            'name': 'Benefits',
            'data': dataBenefit
        }]
    }

    hc_export.save_as_png(config=config, filename="cab.png")

    requestJson = requests.get(settings.SITE_HOST_API + 'reports/getSensibilityAnalysisBenefits/?studyCase=177')
    data = requestJson.json()

    dataSensibilityAnalysisBenefitsTime = []
    dataSensibilityAnalysisBenefitsRange = []

    for item in data:
        dataSensibilityAnalysisBenefitsTime.append([item['timer'], float(item['totalMedBenefitR'])]);
        dataSensibilityAnalysisBenefitsRange.append([item['timer'], float(item['totalMinBenefitR']), float(item['totalMaxBenefittR'])]);

    config = {
        'title': {
            'text': 'Sensibility analysis - total discounted benefit (TDB)'
        },
        'credits': {
            'enabled': 0
        },
        'yAxis': {
            'title': {
                'text': 'Total descounted benefits'
            }
        },
        'xAxis': {
            'title': {
                'text': 'Time in years descoyunted benefits'
            }
        },
        'colors': ['#008BAB'],
        'series': [{
            'name': 'TDB',
            'color': "#4c99d8",
            'data': dataSensibilityAnalysisBenefitsTime
        }, {
            'name': 'Range',
            'data': dataSensibilityAnalysisBenefitsRange,
            'type': 'arearange',
            'lineWidth': 0,
            'linkedTo': ':previous',
            'color': "#90D3E7",
            'fillOpacity': 0.3,
            'zIndex': 0,
            'marker': {
                'enabled': 0
            }
        }]
    }

    hc_export.save_as_png(config=config, filename="satdb.png")


    pdf.image('header-logo.png', 10, 10, w=35)
    pdf.image('header-pdf.png', 100, 0, w=110)
    pdf.image('igocab.png', 20, 130, w=160)
    pdf.add_page()
    pdf.image('cab.png', 20, 30, w=160)
    pdf.image('satdb.png', 20, 200, w=160)

    response = HttpResponse(pdf.output(dest='S').encode('latin-1'))
    response['Content-Type'] = 'application/pdf'
    return response

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
            return result
    return result

def getNameCity(indicators):
    result = []
    for objectIndicatorcity in indicators:
        try:
            if objectIndicatorcity.intake.city.name not in result:
                result.append(objectIndicatorcity.intake.city.name)
        except:
            return result
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