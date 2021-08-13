import pandas as pd
import matplotlib
import highchartexport as hc_export
import json
import requests
import array
import codecs

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
    pdf.image('header-logo.png', 10, 10, w=35)
    pdf.image('header-pdf.png', 100, 0, w=110)
    pdf.set_font('Arial', 'B', 20)
    pdf.set_text_color(57, 137, 169)
    pdf.ln(30)
    pdf.cell(0, 0, 'Caso de estudio');
    pdf.set_font('Arial', '', 11)
    pdf.set_text_color(179, 179, 179)
    pdf.ln(10)
    pdf.cell(0, 0, 'Este informe es generado por WaterProof')
    pdf.ln(5)
    pdf.cell(0, 0, '(http://water-proof.org/) con el fin de proporcionar')
    pdf.ln(5)
    pdf.cell(0, 0, 'un portafolio de Soluciones basadas en las Naturales')
    pdf.ln(5)
    pdf.cell(0, 0, 'y su retorno de inversion.')
    pdf.ln(10)
    pdf.cell(0, 0, 'Desde este documento podrá tener una sitensis de')
    pdf.ln(5)
    pdf.cell(0, 0, 'los resultados de indicadores')
    epw = pdf.w - 2*pdf.l_margin

    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(250, 250, 250)
    pdf.set_fill_color(0, 138, 173)
    pdf.set_draw_color(0, 138, 173)
    

    studyCaseName = "-"
    requestJson = requests.get(settings.SITE_HOST_API + 'reports/getSelectorStudyCasesId/?studyCase=' + request.GET['studyCase'],verify=False)
    data = requestJson.json()
    for item in data:
        studyCaseName = item['studyCasesName']
        

    numerOfWater = "-"
    numerOfDwtp = "-"
    requestJson = requests.get(settings.SITE_HOST_API + 'reports/getStudyCasesIntake/?studyCase=' + request.GET['studyCase'],verify=False)
    data = requestJson.json()
    for item in data:
        numerOfWater = item['numberStudyCase']
        numerOfDwtp = item['numberStudyCase']

    currencyCase = "-"
    timeCase = "-"
    requestJson = requests.get(settings.SITE_HOST_API + 'reports/getReportAnalisysBeneficsB/?studyCase=' + request.GET['studyCase'],verify=False)
    data = requestJson.json()
    for item in data:
        currencyCase = item['currency']
        timeCase = item['time']

    pdf.ln(8)
    pdf.cell(epw, 8,studyCaseName, border=1, align='C', fill=1)
    title = 0
    pdf.ln(8)
    pdf.set_text_color(100, 100, 100)
    pdf.set_fill_color(255, 255, 255)
    pdf.cell(epw/2, 32,"", border=1, fill=1)
    pdf.cell(epw/2, 32,"", border=1, fill=1)
    pdf.ln(0)
    pdf.cell(epw/2, 8,"City:   " +  request.GET['studyCity'])
    pdf.cell(epw/2, 8,"Number of water intakes that are part of the analysis:   " + str(numerOfWater))
    pdf.ln(8)
    pdf.cell(epw/2, 8,"Country:   " +  request.GET['studyCountry'])
    pdf.cell(epw/2, 8,"Number of DWTP in the analysis:   " + str(numerOfDwtp))
    pdf.ln(8)
    pdf.cell(epw/2, 8,"Region:   " +  request.GET['studyRegion'])
    pdf.cell(epw/2, 8,"Currency:   " + currencyCase)
    pdf.ln(8)
    pdf.cell(epw/2, 8,"Time frame (years):   " + str(timeCase))

    pdf.ln(8)

    pdf.set_font('Arial', '', 13)
    pdf.set_text_color(100, 100, 100)
    pdf.ln(15)
    pdf.cell(0, 20, 'Water intakes that are part of the analysis', align='C')

    pdf.ln(20)

    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(255, 255, 255)
    pdf.set_fill_color(0, 138, 173)
    pdf.set_draw_color(0, 138, 173)

    pdf.cell(epw/2, 8,"Water Intake", border=1, align='C', fill=1)
    pdf.cell(epw/2, 8,"System caracteristics", border=1, align='C', fill=1)
    pdf.set_text_color(100, 100, 100)
    pdf.set_fill_color(255, 255, 255)

    requestJson = requests.get(settings.SITE_HOST_API + 'reports/getCaracteristicsCsIntakePdf/?studyCase=' + request.GET['studyCase'],verify=False)

    data = requestJson.json()
    for item in data:
        pdf.ln(8)
        pdf.cell(epw/2, 8,item['name'], border=1, align='C', fill=1)
        pdf.cell(epw/2, 8,item['description'], border=1, align='C', fill=1)

    pdf.add_page()
    pdf.set_font('Arial', '', 13)
    pdf.set_text_color(100, 100, 100)
    pdf.ln(15)
    pdf.cell(0, 10, 'Caracteristics case study (Drinking water systems)', align='C', fill=1)
    pdf.ln(10)

    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(255, 255, 255)
    pdf.set_fill_color(0, 138, 173)
    pdf.set_draw_color(0, 138, 173)

    pdf.cell(epw/2, 8,"Drinking water Tratament plant", border=1, align='C', fill=1)
    pdf.cell(epw/2, 8,"Nombre intake", border=1, align='C', fill=1)
    pdf.set_text_color(100, 100, 100)
    pdf.set_fill_color(255, 255, 255)

    requestJson = requests.get(settings.SITE_HOST_API + 'reports/getCaracteristicsPtapDetailPdf/?studyCase=' + request.GET['studyCase'],verify=False)

    data = requestJson.json()
    for item in data:
        pdf.ln(8)
        pdf.cell(epw/2, 8,item['name'], border=1, align='C', fill=1)
        pdf.cell(epw/2, 8,item['description'], border=1, align='C', fill=1)

    pdf.set_font('Arial', '', 13)
    pdf.set_text_color(100, 100, 100)
    pdf.ln(15)
    pdf.cell(0, 10, 'Nature Based Solutions Conservation Activities', align='C')
    pdf.ln(10)

    pdf.set_font('Arial', '', 9)
    pdf.set_text_color(255, 255, 255)
    pdf.set_fill_color(0, 138, 173)
    pdf.set_draw_color(0, 138, 173)

    pdf.cell(epw/4, 10,"Name", border=1, align='C', fill=1)
    pdf.cell(epw/4, 5,"Percentage of benefit associated", border=1, align='C', fill=1)
    pdf.cell(epw/10, 10,"Benefit", border=1, align='C', fill=1)
    pdf.cell(epw/10, 5,"Implementa", border=1, align='C', fill=1)
    pdf.cell(epw/10, 5,"Matenance", border=1, align='C', fill=1)
    pdf.cell(epw/10, 5,"Periodicity", border=1, align='C', fill=1)
    pdf.cell(epw/10, 5,"Opportunity", border=1, align='C', fill=1)
    pdf.ln(4)
    pdf.cell(epw/4, 5,"")
    pdf.cell(epw/4, 5,"with intervenctions at time t=0", border=1, align='C', fill=1)
    pdf.cell(epw/10, 5,"")
    pdf.cell(epw/10, 5,"tion cost", border=1, align='C', fill=1)
    pdf.cell(epw/10, 5,"cost", border=1, align='C', fill=1)
    pdf.cell(epw/10, 5,"maintenance", border=1, align='C', fill=1)
    pdf.cell(epw/10, 5,"cost", border=1, align='C', fill=1)
    pdf.ln(4)
    pdf.set_text_color(100, 100, 100)
    pdf.set_fill_color(255, 255, 255)
    
    requestJson = requests.get(settings.SITE_HOST_API + 'reports/getconservationActivitiesPdf/?studyCase=' + request.GET['studyCase'],verify=False)

    data = requestJson.json()
    for item in data:
        pdf.cell(epw/4, 20,"", border=1, fill=1)
        pdf.cell(epw/4, 20,"", border=1, fill=1)
        pdf.cell(epw/10, 20,"", border=1, fill=1)
        pdf.cell(epw/10, 20,"", border=1, fill=1)
        pdf.cell(epw/10, 20,"", border=1, fill=1)
        pdf.cell(epw/10, 20,"", border=1, fill=1)
        pdf.cell(epw/10, 20,"", border=1, fill=1)
        pdf.ln(0)
        pdf.cell(epw/4, 5,str(item['name'])[0:30], align='C')
        pdf.cell(epw/4, 5,str(item['description'])[0:30], align='C')
        pdf.cell(epw/10, 20,str(item['benefit']), align='C')
        pdf.cell(epw/10, 20,str(item['implementation']), align='C')
        pdf.cell(epw/10, 20,str(item['maintenance']), align='C')
        pdf.cell(epw/10, 20,str(item['periodicity']), align='C')
        pdf.cell(epw/10, 20,str(item['oportunity']), align='C')
        pdf.ln(5)
        pdf.cell(epw/4, 5,str(item['name'])[30:60], align='C')
        pdf.cell(epw/4, 5,str(item['description'])[30:60], align='C')
        pdf.ln(5)
        pdf.cell(epw/4, 5,str(item['name'])[60:90], align='C')
        pdf.cell(epw/4, 5,str(item['description'])[60:90], align='C')
        pdf.ln(5)
        pdf.cell(epw/4, 5,str(item['name'])[90:120], align='C')
        pdf.cell(epw/4, 5,str(item['description'])[90:120], align='C')
        pdf.ln(5)

    requestJson = requests.get(settings.SITE_HOST_API + 'reports/getFinancialAnalysisPdfRunAnalisisPdf/?studyCase=' + request.GET['studyCase'],verify=False)
    data = requestJson.json()

    platformCost = "";
    discountRate = "";
    discountRateMinimum = "";
    discountRateMaximum = "";
    fullPorfolio = "";
    fullRoi = "";
    fullScenario = "";

    for item in data:
        platformCost = item['platformCost'];
        discountRate = item['discountRate'];
        discountRateMinimum = item['discountRateMinimum'];
        discountRateMaximum = item['discountRateMaximum'];
        fullPorfolio = item['fullPorfolio'];
        fullRoi = item['fullRoi'];
        fullScenario = item['fullScenario'];

    pdf.add_page()
    pdf.set_font('Arial', '', 13)
    pdf.set_text_color(100, 100, 100)
    pdf.ln(5)
    pdf.cell(0, 15, 'Financial Analysis', align='C')
    pdf.ln(15)
    pdf.set_font('Arial', '', 9)
    pdf.cell(epw/2, 8,"Platform cost year 1 (US$/yr)")
    pdf.cell(epw/2, 8,platformCost, align='R')
    pdf.ln(8)
    pdf.cell(epw/2, 8,"Discount rate (%)")
    pdf.cell(epw/2, 8,discountRate, align='R')
    pdf.ln(8)
    pdf.cell(epw/2, 8,"Sensivity analysis - Minimum discount rate")
    pdf.cell(epw/2, 8,discountRateMinimum, align='R')
    pdf.ln(8)
    pdf.cell(epw/2, 8,"Sensivity analysis - Maximum discount rate")
    pdf.cell(epw/2, 8,discountRateMaximum, align='R')
    pdf.ln(8)

    pdf.set_font('Arial', '', 13)
    pdf.ln(5)
    pdf.cell(0, 15, 'Objetives for portafolio', align='C')
    pdf.ln(15)
    pdf.set_font('Arial', '', 9)
   
    requestJson = requests.get(settings.SITE_HOST_API + 'reports/getObjetivesForPorfoliosPdf/?studyCase=' + request.GET['studyCase'],verify=False)
    data = requestJson.json()

    for item in data:
        pdf.cell(epw, 8,item['name'])
        pdf.ln(8)

    pdf.set_font('Arial', '', 13)
    pdf.ln(5)
    pdf.cell(0, 15, 'Run analysis: Full portafolio', align='C')
    pdf.ln(15)
    pdf.set_font('Arial', '', 9)
    pdf.cell(epw/2, 8,"Implementation time  of Nature-Based solution (yr)")
    pdf.cell(epw/2, 8,fullPorfolio, align='R')
    pdf.ln(8)
    pdf.cell(epw/2, 8,"ROI analysis time (yr)")
    pdf.cell(epw/2, 8,fullRoi, align='R')
    pdf.ln(8)
    pdf.cell(epw/2, 8,"Climate selection for baseline and NBS scenario analysis")
    pdf.cell(epw/2, 8,fullScenario, align='R')
    pdf.ln(8)

    pdf.add_page()
    requestJson = requests.get(settings.SITE_HOST_API + 'reports/getReportCostsAnalysisRoi/?studyCase=' + request.GET['studyCase'],verify=False)
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

    pdf.image('igocab.png', 20, 30, w=160)

    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(255, 255, 255)
    pdf.set_fill_color(0, 138, 173)
    pdf.set_draw_color(0, 138, 173)
    pdf.ln(130)
    pdf.cell(epw/5, 8, 'Time period', border=1, align='C', fill=1)
    pdf.cell(epw/5, 8, 'Total cost', border=1, align='C', fill=1)
    pdf.cell(epw/5, 8, 'Total discounted cost', border=1, align='C', fill=1)
    pdf.cell(epw/5, 8, 'Total benefits', border=1, align='C', fill=1)
    pdf.cell(epw/5, 8, 'Total disc benefits', border=1, align='C', fill=1)
    pdf.ln(8)
    pdf.set_font('Arial', '', 9)
    pdf.set_text_color(100, 100, 100)
    pdf.set_fill_color(255, 255, 255)

    contTitle = 1;
    for item in data:
        pdf.cell(epw/5, 4, str(contTitle), border=1, align='C', fill=1)
        pdf.cell(epw/5, 4, str(round(item['totalCost'],2)) , border=1, align='C', fill=1)
        pdf.cell(epw/5, 4, str(round(item['totalDiscountedCost'],2)) , border=1, align='C', fill=1)
        pdf.cell(epw/5, 4, str(round(item['totalBenefits'],2)) , border=1, align='C', fill=1)
        pdf.cell(epw/5, 4, str(round(item['totalDiscountedBenefits'],2)) , border=1, align='C', fill=1)
        contTitle = contTitle + 1
        pdf.ln(4)

    pdf.add_page()
    requestJson = requests.get(settings.SITE_HOST_API + 'reports/getCostAndBenefit/?studyCase=' + request.GET['studyCase'],verify=False)
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
    pdf.image('cab.png', 20, 30, w=160)

    requestJson = requests.get(settings.SITE_HOST_API + 'reports/getNetPresentValueSummary/?studyCase=' + request.GET['studyCase'],verify=False)
    data = requestJson.json()

    dataNetPresentValueSummary = []
    typeMoney = ''
    valimplementationr = ""
    valmaintenancer = ""
    valoportunityr = ""
    valtransactionr = ""
    valplatformr = ""
    valbenefitr = ""
    valtotalr = ""

    for item in data:
        typeMoney = item['currencyr']
        dataNetPresentValueSummary.append(round(item['implementationr'],2));
        dataNetPresentValueSummary.append(round(item['maintenancer'],2));
        dataNetPresentValueSummary.append(round(item['oportunityr'],2));
        dataNetPresentValueSummary.append(round(item['transactionr'],2));
        dataNetPresentValueSummary.append(round(item['platformr'],2));
        dataNetPresentValueSummary.append(round(item['benefitr'],2));
        dataNetPresentValueSummary.append(round(item['totalr'],2));

        valimplementationr = round(item['implementationr'],2)
        valmaintenancer = round(item['maintenancer'],2)
        valoportunityr = round(item['oportunityr'],2)
        valtransactionr = round(item['transactionr'],2)
        valplatformr = round(item['platformr'],2)
        valbenefitr = round(item['benefitr'],2)
        valtotalr = round(item['totalr'],2)



    config = {
        'chart': {
            'type': 'column'
        },
        'colors': ['#008BAB'],
        'title': {
            'text': 'Net present value summary'
        },
        'xAxis': {
            'categories': ['Implementation', 'Maintance', 'Oportunity', 'Transaction', 'Platform', 'Benefit', 'Total']
        },
        'credits': {
            'enabled': 0
        },
        'series': [{
            'name': 'NPV (' + typeMoney + ')',
            'data': dataNetPresentValueSummary
        }]
    }

    hc_export.save_as_png(config=config, filename="npvs.png")
    pdf.image('npvs.png', 20, 150, w=160)
    
    pdf.add_page()
    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(255, 255, 255)
    pdf.set_fill_color(0, 138, 173)
    pdf.set_draw_color(0, 138, 173)
    pdf.ln(0)
    pdf.cell(0, 8, 'Net present value sumary', border=1, align='C', fill=1)
    pdf.ln(8)
    pdf.set_font('Arial', '', 9)
    pdf.set_text_color(100, 100, 100)
    pdf.set_fill_color(255, 255, 255)

    pdf.cell(epw/2, 4, str("Cost: implementation"), border=1, align='C', fill=1)
    pdf.cell(epw/2, 4, str(round(valimplementationr,2)) , border=1, align='C', fill=1)
    pdf.ln(4)
    pdf.cell(epw/2, 4, str("Cost: maintenance"), border=1, align='C', fill=1)
    pdf.cell(epw/2, 4, str(round(valmaintenancer,2)) , border=1, align='C', fill=1)
    pdf.ln(4)
    pdf.cell(epw/2, 4, str("Cost: oportunity"), border=1, align='C', fill=1)
    pdf.cell(epw/2, 4, str(round(valoportunityr,2)) , border=1, align='C', fill=1)
    pdf.ln(4)
    pdf.cell(epw/2, 4, str("Cost: transaction"), border=1, align='C', fill=1)
    pdf.cell(epw/2, 4, str(round(valtransactionr,2)) , border=1, align='C', fill=1)
    pdf.ln(4)
    pdf.cell(epw/2, 4, str("Cost: platform"), border=1, align='C', fill=1)
    pdf.cell(epw/2, 4, str(round(valplatformr,2)) , border=1, align='C', fill=1)
    pdf.ln(4)
    pdf.cell(epw/2, 4, str("Benefit"), border=1, align='C', fill=1)
    pdf.cell(epw/2, 4, str(round(valbenefitr,2)) , border=1, align='C', fill=1)
    pdf.ln(4)
    pdf.cell(epw/2, 4, str("Total"), border=1, align='C', fill=1)
    pdf.cell(epw/2, 4, str(round(valtotalr,2)) , border=1, align='C', fill=1)
    pdf.ln(4)

    requestJson = requests.get(settings.SITE_HOST_API + 'reports/getSensibilityAnalysisBenefits/?studyCase=' + request.GET['studyCase'],verify=False)
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
    pdf.image('satdb.png', 20, 50, w=160)

    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(255, 255, 255)
    pdf.set_fill_color(0, 138, 173)
    pdf.set_draw_color(0, 138, 173)
    pdf.ln(110)
    pdf.cell(epw/4, 8, 'Total discounted benefit', border=1, align='C', fill=1)
    pdf.cell(epw/4, 8, 'Discounted benefit minimum', border=1, align='C', fill=1)
    pdf.cell(epw/4, 8, 'Discounted benefit medium', border=1, align='C', fill=1)
    pdf.cell(epw/4, 8, 'Discounted benefit maximum', border=1, align='C', fill=1)
    pdf.ln(8)
    pdf.set_font('Arial', '', 9)
    pdf.set_text_color(100, 100, 100)
    pdf.set_fill_color(255, 255, 255)

    for item in data:
        pdf.cell(epw/4, 3.5, str(item['timer']) , border=1, align='C', fill=1)
        pdf.cell(epw/4, 3.5, str(round(float(item['totalMinBenefitR']),2)) , border=1, align='C', fill=1)
        pdf.cell(epw/4, 3.5, str(round(float(item['totalMedBenefitR']),2)) , border=1, align='C', fill=1)
        pdf.cell(epw/4, 3.5, str(round(float(item['totalMaxBenefittR']),2)) , border=1, align='C', fill=1)
        pdf.ln(3.5)    

    pdf.add_page()

    requestJson = requests.get(settings.SITE_HOST_API + 'reports/getSensibilityAnalysisCost/?studyCase=' + request.GET['studyCase'],verify=False)
    data = requestJson.json()

    dataSensibilityAnalysisCostTime = []
    dataSensibilityAnalysisCostRange = []

    for item in data:
        dataSensibilityAnalysisCostTime.append([item['timer'], float(item['totalMedCostR'])]);
        dataSensibilityAnalysisCostRange.append([item['timer'], float(item['totalMinCostR']), float(item['totalMaxCostR'])]);

    config = {
        'title': {
            'text': 'Sensitivity analysis - total discounted cost (TDC)'
        },
        'credits': {
            'enabled': 0
        },
        'yAxis': {
            'title': {
                'text': 'Total descounted costs'
            }
        },
        'xAxis': {
            'title': {
                'text': 'Time in years descounted benefits'
            }
        },
        'colors': ['#008BAB'],
        'series': [{
            'name': 'TDC',
            'color': "#4c99d8",
            'data': dataSensibilityAnalysisCostTime
        }, {
            'name': 'Range',
            'data': dataSensibilityAnalysisCostRange,
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

    hc_export.save_as_png(config=config, filename="satdc.png")
    pdf.image('satdc.png', 20, 30, w=160)

    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(255, 255, 255)
    pdf.set_fill_color(0, 138, 173)
    pdf.set_draw_color(0, 138, 173)
    pdf.ln(130)
    pdf.cell(epw/4, 8, 'Total discounted cost', border=1, align='C', fill=1)
    pdf.cell(epw/4, 8, 'Discounted cost minimum', border=1, align='C', fill=1)
    pdf.cell(epw/4, 8, 'Discounted cost medium', border=1, align='C', fill=1)
    pdf.cell(epw/4, 8, 'Discounted cost maximum', border=1, align='C', fill=1)
    pdf.ln(8)
    pdf.set_font('Arial', '', 9)
    pdf.set_text_color(100, 100, 100)
    pdf.set_fill_color(255, 255, 255)

    for item in data:
        pdf.cell(epw/4, 4, str(item['timer']) , border=1, align='C', fill=1)
        pdf.cell(epw/4, 4, str(round(float(item['totalMinCostR']),2)) , border=1, align='C', fill=1)
        pdf.cell(epw/4, 4, str(round(float(item['totalMedCostR']),2)) , border=1, align='C', fill=1)
        pdf.cell(epw/4, 4, str(round(float(item['totalMaxCostR']),2)) , border=1, align='C', fill=1)
        pdf.ln(4)    

    pdf.add_page()

    requestJson = requests.get(settings.SITE_HOST_API + 'reports/getReportOportunityResultIndicators/?studyCase=' + request.GET['studyCase'],verify=False)
    data = requestJson.json()
    valueRoi = ""
    idTotalTreatmentCostSavings = ""
    idTimeFrame = ""
    idTotalEstimatedInvestment = ""
    idTotalAreaInvestmentSize = ""
    backgroundColorR = 0
    backgroundColorG = 0
    backgroundColorB = 0
    nameBackgroundColor = ""

    for item in data:
        if item['description'] != "TotalTreatmentCostSavings" and item['description'] !="TimeFrame" and item['description'] != "TotalEstimatedInvestment" and item['description'] !="TotalAreaInterventionSize(Hec)":
            valueRoi = str(round(float(item['value']),2))
            nameButtom = item['description'].split("::");
            if nameButtom[1] == "Dark Green":
                backgroundColorR = 21
                backgroundColorG = 88
                backgroundColorB = 22
            else:
                if nameButtom[1] == "Light Green":
                    backgroundColorR = 53
                    backgroundColorG = 177
                    backgroundColorB = 55
                else:
                    backgroundColorR = 175
                    backgroundColorG = 9
                    backgroundColorB = 0
            nameBackgroundColor = nameButtom[0];

        if item['description'] == "TotalTreatmentCostSavings":
            idTotalTreatmentCostSavings = str(round(float(item['value']),2))
        if item['description'] == "TimeFrame":
            idTimeFrame = str(round(float(item['value']),2))
        if item['description'] == "TotalEstimatedInvestment":
            idTotalEstimatedInvestment = str(round(float(item['value']),2))
        if item['description'] == "TotalAreaInterventionSize(Hec)":
            idTotalAreaInvestmentSize = str(round(float(item['value']),2))

    pdf.ln(10)
    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(100, 100, 100)
    pdf.set_fill_color(255, 255, 255)
    pdf.cell(epw, 10, 'Canculated ROI', align='C')
    pdf.cell(epw, 10, valueRoi , align='C')
    pdf.image('valor-bruto.png', 80, 30, w=50)
    pdf.ln(60)
    pdf.cell(epw, 10, 'ROI on nature based solutions opportunity', align='C')
    pdf.ln(15)
    pdf.set_text_color(255, 255, 255)
    pdf.set_fill_color(backgroundColorR, backgroundColorG, backgroundColorB)
    pdf.cell(epw, 10, nameBackgroundColor,  border=1, align='C', fill=1)
    pdf.ln(15)
    pdf.set_text_color(100, 100, 100)
    pdf.set_fill_color(255, 255, 255)
    pdf.cell(epw, 10, 'Total estimated investment', align='C')
    pdf.ln(5)
    pdf.cell(epw, 10, idTotalEstimatedInvestment, align='C')
    pdf.ln(5)
    pdf.cell(epw, 10, 'Total treatment cost savings', align='C')
    pdf.ln(5)
    pdf.cell(epw, 10, idTotalTreatmentCostSavings, align='C')
    pdf.ln(5)
    pdf.cell(epw, 10, 'Total area investment size', align='C')
    pdf.ln(5)
    pdf.cell(epw, 10, idTotalAreaInvestmentSize, align='C')
    pdf.ln(5)
    pdf.cell(epw, 10, 'Time frame (Years)', align='C')
    pdf.ln(5)
    pdf.cell(epw, 10, idTimeFrame, align='C')
    pdf.ln(5)

    requestJson = requests.get(settings.SITE_HOST_API + 'reports/getNetPresentValueSummary/?studyCase=' + request.GET['studyCase'],verify=False)
    data = requestJson.json()

    typeMoney = ""
    dataNetPresentValueSummary = []

    for item in data:
        typeMoney = item['currencyr']
        dataNetPresentValueSummary.append(item['implementationr']);
        dataNetPresentValueSummary.append(item['maintenancer']);
        dataNetPresentValueSummary.append(item['oportunityr']);
        dataNetPresentValueSummary.append(item['transactionr']);
        dataNetPresentValueSummary.append(item['platformr']);
        dataNetPresentValueSummary.append(item['benefitr']);
        dataNetPresentValueSummary.append(item['totalr']);

    

    config = {
        'chart': {
            'type': 'column'
        },
        'title': {
            'text': 'Net present value summary'
        },
        'colors': ['#008BAB'],
        'xAxis': {
            'categories': ['Implementation', 'Maintance', 'Oportunity', 'Transaction', 'Platform', 'Benefit', 'Total']
        },
        'credits': {
            'enabled': 0
        },
        'series': [{
            'name': 'NPV (' + typeMoney + ')',
            'data': dataNetPresentValueSummary
        }]
    }

    hc_export.save_as_png(config=config, filename="npvs.png")
    pdf.image('npvs.png', 20, 180, w=160)    

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
    region = ''
    year = ''
    if request.method == 'GET':
        try:            
            base_data = request.GET['folder']
            intake = request.GET['intake']
            region = request.GET['region']
            year = request.GET['year']
        except:
            base_data = 'mapserver'
            intake = ''
            region = ''
            year = ''
        

    return render(
                request,
                'waterproof_reports/compare_maps.html',
                {
                    'base_data': base_data,
                    'intake': intake,
                    'region': region,
                    'year': year
                }
            )