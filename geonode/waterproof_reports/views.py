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
from .models import investIndicators, zip
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
    pdf.cell(0, 0, 'Caso de estudio')
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
    pdf.cell(0, 0, 'Desde este documento podrá tener una sintesis de')
    pdf.ln(5)
    pdf.cell(0, 0, 'los resultados de indicadores')
    epw = pdf.w - 2*pdf.l_margin

    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(250, 250, 250)
    pdf.set_fill_color(0, 138, 173)
    pdf.set_draw_color(0, 138, 173)

    studyCaseName = "-"
    requestJson = requests.get(settings.SITE_HOST_API +
                               'reports/getSelectorStudyCasesId/?studyCase=' + request.GET['studyCase'], verify=False)
    data = requestJson.json()
    for item in data:
        studyCaseName = item['studyCasesName']

    numerOfWater = "-"
    numerOfDwtp = "-"
    requestJson = requests.get(settings.SITE_HOST_API +
                               'reports/getStudyCasesIntake/?studyCase=' + request.GET['studyCase'], verify=False)
    data = requestJson.json()
    for item in data:
        numerOfWater = item['numberStudyCase']
        numerOfDwtp = item['numberStudyCase']

    currencyCase = "-"
    timeCase = "-"
    changeInVolumeOfWater = "-"
    changeInBaseFlow = "-"
    changeIntotalSediments = "-"
    changeInNitrogenLoad = "-"
    changeInPhosphorus = "-"
    changeInCarbonStorage = "-"

    requestJson = requests.get(settings.SITE_HOST_API +
                               'reports/getReportAnalisysBeneficsB/?studyCase=' + request.GET['studyCase'], verify=False)
    data = requestJson.json()
    for item in data:
        currencyCase = item['currency']
        timeCase = item['time']
        changeInVolumeOfWater = str(round(float(item['changeInVolumeOfWater']), 2))
        changeInBaseFlow = str(round(float(item['changeInBaseFlow']), 2))
        changeIntotalSediments = str(round(float(item['changeIntotalSediments']), 2))
        changeInNitrogenLoad = str(round(float(item['changeInNitrogenLoad']), 2))
        changeInPhosphorus = str(round(float(item['changeInPhosphorus']), 2))
        changeInCarbonStorage = str(round(float(item['changeInCarbonStorage']), 2))

    pdf.ln(8)
    pdf.cell(epw, 8, studyCaseName, border=1, align='C', fill=1)
    title = 0
    pdf.ln(8)
    pdf.set_text_color(100, 100, 100)
    pdf.set_fill_color(255, 255, 255)
    pdf.cell(epw/2, 32, "", border=1, fill=1)
    pdf.cell(epw/2, 32, "", border=1, fill=1)
    pdf.ln(0)
    pdf.cell(epw/2, 8, "City:   " + request.GET['studyCity'])
    pdf.cell(epw/2, 8, "Number of water intakes that are part of the analysis:   " + str(numerOfWater))
    pdf.ln(8)
    pdf.cell(epw/2, 8, "Country:   " + request.GET['studyCountry'])
    pdf.cell(epw/2, 8, "Number of DWTP in the analysis:   " + str(numerOfDwtp))
    pdf.ln(8)
    pdf.cell(epw/2, 8, "Region:   " + request.GET['studyRegion'])
    pdf.cell(epw/2, 8, "Currency:   " + currencyCase)
    pdf.ln(8)
    pdf.cell(epw/2, 8, "Time frame (years):   " + str(timeCase))

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

    pdf.cell(epw/2, 8, "Water Intake", border=1, align='C', fill=1)
    pdf.cell(epw/2, 8, "System caracteristics", border=1, align='C', fill=1)
    pdf.set_text_color(100, 100, 100)
    pdf.set_fill_color(255, 255, 255)

    requestJson = requests.get(settings.SITE_HOST_API +
                               'reports/getCaracteristicsCsIntakePdf/?studyCase=' +
                               request.GET['studyCase'], verify=False)

    data = requestJson.json()
    for item in data:
        pdf.ln(8)
        pdf.cell(epw/2, 8, item['name'], border=1, align='C', fill=1)
        pdf.cell(epw/2, 8, item['description'], border=1, align='C', fill=1)

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

    pdf.cell(epw/2, 8, "Drinking water Tratament plant", border=1, align='C', fill=1)
    pdf.cell(epw/2, 8, "Nombre intake", border=1, align='C', fill=1)
    pdf.set_text_color(100, 100, 100)
    pdf.set_fill_color(255, 255, 255)

    requestJson = requests.get(
        settings.SITE_HOST_API + 'reports/getCaracteristicsPtapDetailPdf/?studyCase=' + request.GET['studyCase'], verify=False)

    data = requestJson.json()
    for item in data:
        pdf.ln(8)
        pdf.cell(epw/2, 8, item['name'], border=1, align='C', fill=1)
        pdf.cell(epw/2, 8, item['description'], border=1, align='C', fill=1)

    pdf.set_font('Arial', '', 13)
    pdf.set_text_color(100, 100, 100)
    pdf.ln(15)
    pdf.cell(0, 10, 'Nature Based Solutions Conservation Activities', align='C')
    pdf.ln(10)

    pdf.set_font('Arial', '', 9)
    pdf.set_text_color(255, 255, 255)
    pdf.set_fill_color(0, 138, 173)
    pdf.set_draw_color(0, 138, 173)

    pdf.cell(epw/4, 10, "Name", border=1, align='C', fill=1)
    pdf.cell(epw/4, 5, "Percentage of benefit associated", border=1, align='C', fill=1)
    pdf.cell(epw/10, 10, "Benefit", border=1, align='C', fill=1)
    pdf.cell(epw/10, 5, "Implementa", border=1, align='C', fill=1)
    pdf.cell(epw/10, 5, "Matenance", border=1, align='C', fill=1)
    pdf.cell(epw/10, 5, "Periodicity", border=1, align='C', fill=1)
    pdf.cell(epw/10, 5, "Opportunity", border=1, align='C', fill=1)
    pdf.ln(4)
    pdf.cell(epw/4, 5, "")
    pdf.cell(epw/4, 5, "with intervenctions at time t=0", border=1, align='C', fill=1)
    pdf.cell(epw/10, 5, "")
    pdf.cell(epw/10, 5, "tion cost", border=1, align='C', fill=1)
    pdf.cell(epw/10, 5, "cost", border=1, align='C', fill=1)
    pdf.cell(epw/10, 5, "maintenance", border=1, align='C', fill=1)
    pdf.cell(epw/10, 5, "cost", border=1, align='C', fill=1)
    pdf.ln(4)
    pdf.set_text_color(100, 100, 100)
    pdf.set_fill_color(255, 255, 255)

    requestJson = requests.get(
        settings.SITE_HOST_API + 'reports/getconservationActivitiesPdf/?studyCase=' + request.GET['studyCase'], verify=False)

    data = requestJson.json()
    for item in data:
        pdf.cell(epw/4, 20, "", border=1, fill=1)
        pdf.cell(epw/4, 20, "", border=1, fill=1)
        pdf.cell(epw/10, 20, "", border=1, fill=1)
        pdf.cell(epw/10, 20, "", border=1, fill=1)
        pdf.cell(epw/10, 20, "", border=1, fill=1)
        pdf.cell(epw/10, 20, "", border=1, fill=1)
        pdf.cell(epw/10, 20, "", border=1, fill=1)
        pdf.ln(0)
        pdf.cell(epw/4, 5, str(item['name'])[0:30], align='C')
        pdf.cell(epw/4, 5, str(item['description'])[0:30], align='C')
        pdf.cell(epw/10, 20, str(item['benefit']), align='C')
        pdf.cell(epw/10, 20, str(item['implementation']), align='C')
        pdf.cell(epw/10, 20, str(item['maintenance']), align='C')
        pdf.cell(epw/10, 20, str(item['periodicity']), align='C')
        pdf.cell(epw/10, 20, str(item['oportunity']), align='C')
        pdf.ln(5)
        pdf.cell(epw/4, 5, str(item['name'])[30:60], align='C')
        pdf.cell(epw/4, 5, str(item['description'])[30:60], align='C')
        pdf.ln(5)
        pdf.cell(epw/4, 5, str(item['name'])[60:90], align='C')
        pdf.cell(epw/4, 5, str(item['description'])[60:90], align='C')
        pdf.ln(5)
        pdf.cell(epw/4, 5, str(item['name'])[90:120], align='C')
        pdf.cell(epw/4, 5, str(item['description'])[90:120], align='C')
        pdf.ln(5)

    requestJson = requests.get(
        settings.SITE_HOST_API + 'reports/getFinancialAnalysisPdfRunAnalisisPdf/?studyCase=' + request.GET['studyCase'], verify=False)
    data = requestJson.json()

    platformCost = ""
    discountRate = ""
    discountRateMinimum = ""
    discountRateMaximum = ""
    fullPorfolio = ""
    fullRoi = ""
    fullScenario = ""

    for item in data:
        platformCost = item['platformCost']
        discountRate = item['discountRate']
        discountRateMinimum = item['discountRateMinimum']
        discountRateMaximum = item['discountRateMaximum']
        fullPorfolio = item['fullPorfolio']
        fullRoi = item['fullRoi']
        fullScenario = item['fullScenario']

    pdf.add_page()
    pdf.set_font('Arial', '', 13)
    pdf.set_text_color(100, 100, 100)
    pdf.ln(5)
    pdf.cell(0, 15, 'Financial Analysis', align='C')
    pdf.ln(15)
    pdf.set_font('Arial', '', 9)
    pdf.cell(epw/2, 8, "Platform cost year 1 (US$/yr)")
    pdf.cell(epw/2, 8, platformCost, align='R')
    pdf.ln(8)
    pdf.cell(epw/2, 8, "Discount rate (%)")
    pdf.cell(epw/2, 8, discountRate, align='R')
    pdf.ln(8)
    pdf.cell(epw/2, 8, "Sensivity analysis - Minimum discount rate")
    pdf.cell(epw/2, 8, discountRateMinimum, align='R')
    pdf.ln(8)
    pdf.cell(epw/2, 8, "Sensivity analysis - Maximum discount rate")
    pdf.cell(epw/2, 8, discountRateMaximum, align='R')
    pdf.ln(8)

    pdf.set_font('Arial', '', 13)
    pdf.ln(5)
    pdf.cell(0, 15, 'Objetives for portafolio', align='C')
    pdf.ln(15)
    pdf.set_font('Arial', '', 9)

    requestJson = requests.get(
        settings.SITE_HOST_API + 'reports/getObjetivesForPorfoliosPdf/?studyCase=' + request.GET['studyCase'], verify=False)
    data = requestJson.json()

    for item in data:
        pdf.cell(epw, 8, item['name'])
        pdf.ln(8)

    pdf.set_font('Arial', '', 13)
    pdf.ln(5)
    pdf.cell(0, 15, 'Run analysis: Full portafolio', align='C')
    pdf.ln(15)
    pdf.set_font('Arial', '', 9)
    pdf.cell(epw/2, 8, "Implementation time  of Nature-Based solution (yr)")
    pdf.cell(epw/2, 8, fullPorfolio, align='R')
    pdf.ln(8)
    pdf.cell(epw/2, 8, "ROI analysis time (yr)")
    pdf.cell(epw/2, 8, fullRoi, align='R')
    pdf.ln(8)
    pdf.cell(epw/2, 8, "Climate selection for baseline and NBS scenario analysis")
    pdf.cell(epw/2, 8, fullScenario, align='R')
    pdf.ln(8)

    pdf.add_page()
    requestJson = requests.get(settings.SITE_HOST_API +
                               'reports/getReportCostsAnalysisRoi/?studyCase=' +
                               request.GET['studyCase'], verify=False)
    data = requestJson.json()

    categories = []
    totalCost = []
    totalDiscountedCost = []
    totalBenefits = []
    totalDiscountedBenefits = []

    for item in data:
        categories.append(item['record'])
        totalCost.append(item['totalCost'])
        totalDiscountedCost.append(item['totalDiscountedCost'])
        totalBenefits.append(item['totalBenefits'])
        totalDiscountedBenefits.append(item['totalDiscountedBenefits'])

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
        }, {
            'name': 'Total Discounted Cost',
            'data': totalDiscountedCost
        }, {
            'name': 'Total Benefits',
            'type': 'spline',
            'dashStyle': 'shortdot',
            'data': totalBenefits
        }, {
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

    contTitle = 1
    for item in data:
        pdf.cell(epw/5, 4, str(contTitle), border=1, align='C', fill=1)
        pdf.cell(epw/5, 4, str(round(item['totalCost'], 2)), border=1, align='C', fill=1)
        pdf.cell(epw/5, 4, str(round(item['totalDiscountedCost'], 2)), border=1, align='C', fill=1)
        pdf.cell(epw/5, 4, str(round(item['totalBenefits'], 2)), border=1, align='C', fill=1)
        pdf.cell(epw/5, 4, str(round(item['totalDiscountedBenefits'], 2)), border=1, align='C', fill=1)
        contTitle = contTitle + 1
        pdf.ln(4)

    pdf.add_page()
    requestJson = requests.get(settings.SITE_HOST_API + 'reports/getCostAndBenefit/?studyCase=' +
                               request.GET['studyCase'], verify=False)
    data = requestJson.json()

    dataCost = []
    dataBenefit = []

    for item in data:
        dataCost.append(item['costr'])
        dataBenefit.append(item['benefift'])

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
        }, {
            'name': 'Benefits',
            'data': dataBenefit
        }]
    }

    hc_export.save_as_png(config=config, filename="cab.png")
    pdf.image('cab.png', 20, 30, w=160)

    requestJson = requests.get(settings.SITE_HOST_API +
                               'reports/getNetPresentValueSummary/?studyCase=' + request.GET['studyCase'], verify=False)
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
        dataNetPresentValueSummary.append(round(item['implementationr'], 2))
        dataNetPresentValueSummary.append(round(item['maintenancer'], 2))
        dataNetPresentValueSummary.append(round(item['oportunityr'], 2))
        dataNetPresentValueSummary.append(round(item['transactionr'], 2))
        dataNetPresentValueSummary.append(round(item['platformr'], 2))
        dataNetPresentValueSummary.append(round(item['benefitr'], 2))
        dataNetPresentValueSummary.append(round(item['totalr'], 2))

        valimplementationr = round(item['implementationr'], 2)
        valmaintenancer = round(item['maintenancer'], 2)
        valoportunityr = round(item['oportunityr'], 2)
        valtransactionr = round(item['transactionr'], 2)
        valplatformr = round(item['platformr'], 2)
        valbenefitr = round(item['benefitr'], 2)
        valtotalr = round(item['totalr'], 2)

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
    pdf.cell(epw/2, 4, str(round(valimplementationr, 2)), border=1, align='C', fill=1)
    pdf.ln(4)
    pdf.cell(epw/2, 4, str("Cost: maintenance"), border=1, align='C', fill=1)
    pdf.cell(epw/2, 4, str(round(valmaintenancer, 2)), border=1, align='C', fill=1)
    pdf.ln(4)
    pdf.cell(epw/2, 4, str("Cost: oportunity"), border=1, align='C', fill=1)
    pdf.cell(epw/2, 4, str(round(valoportunityr, 2)), border=1, align='C', fill=1)
    pdf.ln(4)
    pdf.cell(epw/2, 4, str("Cost: transaction"), border=1, align='C', fill=1)
    pdf.cell(epw/2, 4, str(round(valtransactionr, 2)), border=1, align='C', fill=1)
    pdf.ln(4)
    pdf.cell(epw/2, 4, str("Cost: platform"), border=1, align='C', fill=1)
    pdf.cell(epw/2, 4, str(round(valplatformr, 2)), border=1, align='C', fill=1)
    pdf.ln(4)
    pdf.cell(epw/2, 4, str("Benefit"), border=1, align='C', fill=1)
    pdf.cell(epw/2, 4, str(round(valbenefitr, 2)), border=1, align='C', fill=1)
    pdf.ln(4)
    pdf.cell(epw/2, 4, str("Total"), border=1, align='C', fill=1)
    pdf.cell(epw/2, 4, str(round(valtotalr, 2)), border=1, align='C', fill=1)
    pdf.ln(4)

    requestJson = requests.get(
        settings.SITE_HOST_API + 'reports/getSensibilityAnalysisBenefits/?studyCase=' + request.GET['studyCase'], verify=False)
    data = requestJson.json()

    dataSensibilityAnalysisBenefitsTime = []
    dataSensibilityAnalysisBenefitsRange = []

    for item in data:
        dataSensibilityAnalysisBenefitsTime.append([item['timer'], float(item['totalMedBenefitR'])])
        dataSensibilityAnalysisBenefitsRange.append([item['timer'], float(
            item['totalMinBenefitR']), float(item['totalMaxBenefittR'])])

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
        pdf.cell(epw/4, 3.5, str(item['timer']), border=1, align='C', fill=1)
        pdf.cell(epw/4, 3.5, str(round(float(item['totalMinBenefitR']), 2)), border=1, align='C', fill=1)
        pdf.cell(epw/4, 3.5, str(round(float(item['totalMedBenefitR']), 2)), border=1, align='C', fill=1)
        pdf.cell(epw/4, 3.5, str(round(float(item['totalMaxBenefittR']), 2)), border=1, align='C', fill=1)
        pdf.ln(3.5)

    pdf.add_page()

    requestJson = requests.get(settings.SITE_HOST_API +
                               'reports/getSensibilityAnalysisCost/?studyCase=' + request.GET['studyCase'], verify=False)
    data = requestJson.json()

    dataSensibilityAnalysisCostTime = []
    dataSensibilityAnalysisCostRange = []

    for item in data:
        dataSensibilityAnalysisCostTime.append([item['timer'], float(item['totalMedCostR'])])
        dataSensibilityAnalysisCostRange.append(
            [item['timer'], float(item['totalMinCostR']), float(item['totalMaxCostR'])])

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
        pdf.cell(epw/4, 4, str(item['timer']), border=1, align='C', fill=1)
        pdf.cell(epw/4, 4, str(round(float(item['totalMinCostR']), 2)), border=1, align='C', fill=1)
        pdf.cell(epw/4, 4, str(round(float(item['totalMedCostR']), 2)), border=1, align='C', fill=1)
        pdf.cell(epw/4, 4, str(round(float(item['totalMaxCostR']), 2)), border=1, align='C', fill=1)
        pdf.ln(4)

    pdf.add_page()

    requestJson = requests.get(
        settings.SITE_HOST_API + 'reports/getReportOportunityResultIndicators/?studyCase=' + request.GET['studyCase'], verify=False)
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
        if item['description'] != "TotalTreatmentCostSavings" and item['description'] != "TimeFrame" and item['description'] != "TotalEstimatedInvestment" and item['description'] != "TotalAreaInterventionSize(Hec)":
            valueRoi = str(round(float(item['value']), 2))
            nameButtom = item['description'].split("::")
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
            nameBackgroundColor = nameButtom[0]

        if item['description'] == "TotalTreatmentCostSavings":
            idTotalTreatmentCostSavings = str(round(float(item['value']), 2))
        if item['description'] == "TimeFrame":
            idTimeFrame = str(round(float(item['value']), 2))
        if item['description'] == "TotalEstimatedInvestment":
            idTotalEstimatedInvestment = str(round(float(item['value']), 2))
        if item['description'] == "TotalAreaInterventionSize(Hec)":
            idTotalAreaInvestmentSize = str(round(float(item['value']), 2))

    pdf.ln(10)
    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(100, 100, 100)
    pdf.set_fill_color(255, 255, 255)
    pdf.cell(epw, 10, 'Canculated ROI', align='C')
    pdf.cell(epw, 10, valueRoi, align='C')
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

    requestJson = requests.get(settings.SITE_HOST_API +
                               'reports/getNetPresentValueSummary/?studyCase=' + request.GET['studyCase'], verify=False)
    data = requestJson.json()

    typeMoney = ""
    dataNetPresentValueSummary = []

    for item in data:
        typeMoney = item['currencyr']
        dataNetPresentValueSummary.append(item['implementationr'])
        dataNetPresentValueSummary.append(item['maintenancer'])
        dataNetPresentValueSummary.append(item['oportunityr'])
        dataNetPresentValueSummary.append(item['transactionr'])
        dataNetPresentValueSummary.append(item['platformr'])
        dataNetPresentValueSummary.append(item['benefitr'])
        dataNetPresentValueSummary.append(item['totalr'])

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

    pdf.add_page()

    requestJson = requests.get(settings.SITE_HOST_API +
                               'reports/getSelectorStudyCasesId/?studyCase=' + request.GET['studyCase'], verify=False)
    data = requestJson.json()

    for item in data:
        pdf.cell(epw, 10, item['studyCasesName'], align='C')

    pdf.image('picture-one.jpg', 10, 30, w=45)
    pdf.image('picture-two.jpg', 58, 30, w=45)
    pdf.image('picture-three.jpg', 106, 30, w=45)
    pdf.image('picture-four.jpg', 154, 30, w=45)

    pdf.ln(50)

    pdf.set_font('Arial', '', 9)
    pdf.set_text_color(255, 255, 255)
    pdf.set_fill_color(0, 138, 173)
    pdf.set_draw_color(0, 138, 173)
    pdf.cell(45, 8, 'Physical risk quantity', border=1, align='C', fill=1)
    pdf.cell(3, 8, '')
    pdf.cell(45, 8, 'Physical risk quality', border=1, align='C', fill=1)
    pdf.cell(3, 8, '')
    pdf.cell(45, 8, 'Regulatory and reputational', border=1, align='C', fill=1)
    pdf.cell(3, 8, '')
    pdf.cell(45, 8, 'Overall water risk score', border=1, align='C', fill=1)
    pdf.ln(8)
    pdf.set_font('Arial', '', 6)
    pdf.set_text_color(100, 100, 100)
    pdf.set_fill_color(255, 255, 255)
    pdf.cell(45, 30, '', border=1, align='C', fill=1)
    pdf.cell(3, 30, '')
    pdf.cell(45, 30, '', border=1, align='C', fill=1)
    pdf.cell(3, 30, '')
    pdf.cell(45, 30, '', border=1, align='C', fill=1)
    pdf.cell(3, 30, '')
    pdf.cell(45, 30, '', border=1, align='C', fill=1)
    pdf.ln(0)
    pdf.cell(45, 4, 'Physical risk quantity measures risk related', align='C')
    pdf.cell(3, 4, '')
    pdf.cell(45, 4, 'Physical risk quantity measures risk related', align='C')
    pdf.cell(3, 4, '')
    pdf.cell(45, 4, 'Risk regulatory and reputational risk', align='C')
    pdf.cell(3, 4, '')
    pdf.cell(45, 4, 'Overall water risk measures all water', align='C')
    pdf.ln(4)
    pdf.cell(45, 4, 'to too little or too much water by', align='C')
    pdf.cell(3, 4, '')
    pdf.cell(45, 4, 'to water that in unfit for use by aggregating', align='C')
    pdf.cell(3, 4, '')
    pdf.cell(45, 4, 'measures risk related to uncertainty in', align='C')
    pdf.cell(3, 4, '')
    pdf.cell(45, 4, 'related risk, by aggregating all selected', align='C')
    pdf.ln(4)
    pdf.cell(45, 4, 'aggregating all selected indicators from the', align='C')
    pdf.cell(3, 4, '')
    pdf.cell(45, 4, 'all selected indicators from the physical risk', align='C')
    pdf.cell(3, 4, '')
    pdf.cell(45, 4, 'regulatory chance, as well as conflich with', align='C')
    pdf.cell(3, 4, '')
    pdf.cell(45, 4, 'indicators from the physical risjk quantity,', align='C')
    pdf.ln(4)
    pdf.cell(45, 4, 'physical risk quantity category', align='C')
    pdf.cell(3, 4, '')
    pdf.cell(45, 4, 'quantity category', align='C')
    pdf.cell(3, 4, '')
    pdf.cell(45, 4, 're public regarding water issues', align='C')
    pdf.cell(3, 4, '')
    pdf.cell(45, 4, 'physical risk quality, and regulatory and', align='C')
    pdf.ln(4)
    pdf.cell(45, 4, '', align='C')
    pdf.cell(3, 4, '')
    pdf.cell(45, 4, '', align='C')
    pdf.cell(3, 4, '')
    pdf.cell(45, 4, '', align='C')
    pdf.cell(3, 4, '')
    pdf.cell(45, 4, 'reputational risk categories', align='C')
    pdf.ln(8)

    requestJson = requests.get(settings.SITE_HOST_API +
                               'reports/getReportAnalisysBenefics/?studyCase=' + request.GET['studyCase'], verify=False)
    data = requestJson.json()

    txtTd1 = ""
    txtTd2 = ""
    txtTd3 = ""
    txtTd4 = ""
    txtTd1CR = 0
    txtTd2CR = 0
    txtTd3CR = 0
    txtTd4CR = 0
    txtTd1CG = 0
    txtTd2CG = 0
    txtTd3CG = 0
    txtTd4CG = 0
    txtTd1CB = 0
    txtTd2CB = 0
    txtTd3CB = 0
    txtTd4CB = 0
    txtColorR = 175
    txtColorG = 9
    txtColorB = 0

    for item in data:
        txtColorR = 175
        txtColorG = 9
        txtColorB = 0

        if item['color'].upper() == "DARK GREEN":
            txtColorR = 21
            txtColorG = 88
            txtColorB = 22

        if item['color'].upper() == "ORANGE":
            txtColorR = 236
            txtColorG = 104
            txtColorB = 10

        if item['nameIndicator'].upper() == "PHYSICAL RISK QUANTITY":
            txtTd1 = item['description']
            txtTd1CR = txtColorR
            txtTd1CG = txtColorG
            txtTd1CB = txtColorB

        if item['nameIndicator'].upper() == "PHYSICAL RISK ASSOCIATED WITH AMOUNT OF WATER":
            txtTd2 = item['description']
            txtTd2CR = txtColorR
            txtTd2CG = txtColorG
            txtTd2CB = txtColorB

        if item['nameIndicator'].upper() == "REGULATORY AND REPUTATIONAL":
            txtTd3 = item['description']
            txtTd3CR = txtColorR
            txtTd3CG = txtColorG
            txtTd3CB = txtColorB

        if item['nameIndicator'].upper() == "OVERALL WATER RISK SCORE":
            txtTd4 = item['description']
            txtTd4CR = txtColorR
            txtTd4CG = txtColorG
            txtTd4CB = txtColorB

    pdf.set_font('Arial', '', 9)
    pdf.set_text_color(255, 255, 255)
    pdf.set_fill_color(txtTd1CR, txtTd1CG, txtTd1CB)
    pdf.set_draw_color(txtTd1CR, txtTd1CG, txtTd1CB)
    pdf.cell(5, 4, '')
    pdf.cell(35, 4, txtTd1, border=1, align='C', fill=1)
    pdf.cell(13, 4, '')
    pdf.set_fill_color(txtTd2CR, txtTd2CG, txtTd2CB)
    pdf.set_draw_color(txtTd2CR, txtTd2CG, txtTd2CB)
    pdf.cell(35, 4, txtTd2, border=1, align='C', fill=1)
    pdf.cell(13, 4, '')
    pdf.set_fill_color(txtTd3CR, txtTd3CG, txtTd3CB)
    pdf.set_draw_color(txtTd3CR, txtTd3CG, txtTd3CB)
    pdf.cell(35, 4, txtTd3, border=1, align='C', fill=1)
    pdf.cell(13, 4, '')
    pdf.set_fill_color(txtTd4CR, txtTd4CG, txtTd4CB)
    pdf.set_draw_color(txtTd4CR, txtTd4CG, txtTd4CB)
    pdf.cell(35, 4, txtTd4, border=1, align='C', fill=1)
    pdf.ln(15)

    pdf.set_text_color(100, 100, 100)
    pdf.set_fill_color(255, 255, 255)
    pdf.set_draw_color(255, 255, 255)
    pdf.cell(epw, 10, 'Estimated change in ecosystem services (BaU vs NbS)', align='C')
    pdf.ln(20)
    pdf.cell(30, 6, 'Anual water yield', align='C')
    pdf.cell(1, 6, '')
    pdf.cell(30, 6, 'Seasonal water ', align='C')
    pdf.cell(1, 6, '')
    pdf.cell(30, 6, 'Sediment delivery ', align='C')
    pdf.cell(1, 6, '')
    pdf.cell(30, 6, 'Nutrient delivery ', align='C')
    pdf.cell(1, 6, '')
    pdf.cell(30, 6, 'Nutrient delivery', align='C')
    pdf.cell(1, 6, '')
    pdf.cell(30, 6, 'Carbon storage ', align='C')
    pdf.ln(6)
    pdf.cell(30, 6, '', align='C')
    pdf.cell(1, 6, '')
    pdf.cell(30, 6, 'yield', align='C')
    pdf.cell(1, 6, '')
    pdf.cell(30, 6, 'ratio', align='C')
    pdf.cell(1, 6, '')
    pdf.cell(30, 6, 'ratio - nitrogen', align='C')
    pdf.cell(1, 6, '')
    pdf.cell(30, 6, 'ratio - phosphorus', align='C')
    pdf.cell(1, 6, '')
    pdf.cell(30, 6, 'and sequestration', align='C')

    pdf.image('dashboard-01.png', 13, 140, w=24)
    pdf.image('dashboard-02.png', 44, 140, w=24)
    pdf.image('dashboard-03.png', 75, 140, w=24)
    pdf.image('dashboard-04.png', 106, 140, w=24)
    pdf.image('dashboard-05.png', 137, 140, w=24)
    pdf.image('dashboard-06.png', 168, 140, w=24)

    pdf.ln(40)
    pdf.set_font('Arial', '', 20)
    pdf.cell(30, 6, changeInVolumeOfWater, align='C')
    pdf.cell(1, 6, '')
    pdf.cell(30, 6, changeInBaseFlow, align='C')
    pdf.cell(1, 6, '')
    pdf.cell(30, 6, changeIntotalSediments, align='C')
    pdf.cell(1, 6, '')
    pdf.cell(30, 6, changeInNitrogenLoad, align='C')
    pdf.cell(1, 6, '')
    pdf.cell(30, 6, changeInPhosphorus, align='C')
    pdf.cell(1, 6, '')
    pdf.cell(30, 6, changeInCarbonStorage, align='C')

    pdf.set_font('Arial', '', 11)
    pdf.ln(10)
    pdf.cell(epw, 10, 'Intervention and budget summary', align='C')
    pdf.ln(15)
    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(255, 255, 255)
    pdf.set_fill_color(0, 138, 173)
    pdf.set_draw_color(0, 138, 173)
    pdf.cell(epw/3, 8, 'Nature based Solution', border=1, align='C', fill=1)
    pdf.cell(epw/3, 8, 'Actual spend', border=1, align='C', fill=1)
    pdf.cell(epw/3, 8, 'Area converted (Ha)', border=1, align='C', fill=1)
    pdf.ln(8)
    pdf.set_font('Arial', '', 9)
    pdf.set_text_color(100, 100, 100)
    pdf.set_fill_color(255, 255, 255)

    requestJson = requests.get(settings.SITE_HOST_API +
                               'reports/getReportAnalisysBeneficsC/?studyCase=' + request.GET['studyCase'], verify=False)
    data = requestJson.json()

    for item in data:
        pdf.cell(epw/3, 8, "", border=1, align='C', fill=1)
        pdf.cell(epw/3, 8, "", border=1, align='C', fill=1)
        pdf.cell(epw/3, 8, "", border=1, align='C', fill=1)
        pdf.ln(0)
        pdf.cell(epw/3, 4, str(item['sbnf'])[0:30], align='C')
        pdf.cell(epw/3, 4, str(round(float(item['costPerHectarea']), 2)), align='C')
        pdf.cell(epw/3, 4, str(round(float(item['recomendedIntervetion']), 2)), align='C')
        pdf.ln(4)
        pdf.cell(epw/3, 4, str(item['sbnf'])[30:60], align='C')
        pdf.cell(epw/3, 4, "", align='C')
        pdf.cell(epw/3, 4, "", align='C')
        pdf.ln(4)

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
            print ("")
    return result

def physicalIndicators(request, idx):

                indicators = investIndicators.objects.filter(study_case__id=idx)
                indicatorsNames = getNames(indicators)
                return render(
                    request,
                    'waterproof_reports/physicalIndicators.html',
                    {
                        'Indicators': indicators,
                        'NamesIndicators': indicatorsNames,
                    })


def financialIndicators(request):
    return render(
        request,
        'waterproof_reports/financialIndicators.html',
        {
            
        })


def decisionIndicators(request):
    return render(
        request,
        'waterproof_reports/decisionIndicators.html',
        {
            
        })


def geographicIndicators(request):

    base_data = ''
    intake = ''
    region = ''
    year = ''
    bbox = ''
    if request.method == 'GET':
        try:
            base_data = request.GET['folder']
            intake = request.GET['intake']
            region = request.GET['region']
            year = request.GET['year']
            study_case_id = request.GET['study_case_id']
            center = request.GET['center']
        except:
            base_data = 'mapserver'
            intake = ''
            region = ''
            year = ''
            study_case_id = ''
            center = ''
    return render(
        request,
        'waterproof_reports/geographicIndicators.html',
        {
            'base_data': base_data,
            'intake': intake,
            'region': region,
            'year': year,
            'study_case_id': study_case_id,
            'center': center
        })

# def compareMaps(request):

#     base_data = ''
#     intake = ''
#     region = ''
#     year = ''
#     bbox = ''
#     if request.method == 'GET':
#         try:
#             base_data = request.GET['folder']
#             intake = request.GET['intake']
#             region = request.GET['region']
#             year = request.GET['year']
#             study_case_id = request.GET['study_case_id']
#             center = request.GET['center']
#         except:
#             base_data = 'mapserver'
#             intake = ''
#             region = ''
#             year = ''
#             study_case_id = ''
#             center = ''


#     return render(
#                 request,
#                 'waterproof_reports/compare_maps.html',
#                 {
#                     'base_data': base_data,
#                     'intake': intake,
#                     'region': region,
#                     'year': year,
#                     'study_case_id' : study_case_id,
#                     'center' : center
#                 }
#             )

def linkDownload(request, idx):

                downloadZip = zip.objects.filter(study_case_id__id=idx).first()
                print(downloadZip.link)
                return render(
                    request,
                    'waterproof_reports/reports_menu.html',
                    {
                        'filterzip': downloadZip,
                    })
