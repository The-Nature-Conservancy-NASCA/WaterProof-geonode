from sys import path
import pandas as pd
import highchartexport as hc_export
import json
import requests
import re
import time
import base64
import math
import os
import tempfile
import binascii

from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render
from django.core import serializers
from geonode.waterproof_parameters.models import Countries
from .models import investIndicators, zip
from geonode.waterproof_study_cases.models import StudyCases
from fpdf import FPDF
from django.http import HttpResponse
from datetime import date
from django.template import RequestContext
from PIL import Image
from io import BytesIO

map_send_image = 'imgpdf/map-send-image.png'
epw = 0
changeInVolumeOfWater = "-"
changeInBaseFlow = "-"
changeIntotalSediments = "-"
changeInNitrogenLoad = "-"
changeInPhosphorus = "-"
changeInCarbonStorage = "-"

class PDF(FPDF):
    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 10)
        self.cell(0, 10, 'Page ' + str(self.page_no()) + '/{nb}', 0, 0, 'C')


def pdf(request):
    base64_data = re.sub('^data:image/.+;base64,', '', request.POST['mapSendImage'])
    study_case_id = request.POST['studyCase']
    url_api = settings.SITE_HOST_API + 'reports/'
    city = request.POST['studyCity']
    region = request.POST['studyRegion']
    country = request.POST['studyCountry']
    discount_rate = request.POST['discountRateData']

    if base64_data != "data:,":
        byte_data = base64.b64decode(base64_data)
        image_data = BytesIO(byte_data)
        img = Image.open(image_data)        
        img.save(map_send_image, "png")

    pdf = PDF()

    # PAGE 1 -- INTRO
    map_img_location = {'x': 6.5, 'y': 122, 'w': 193.5}
    pdf = pdf_page_1(pdf, study_case_id, url_api, city, region, country, discount_rate, True, map_img_location)  

    pdf.set_font('Arial', '', 11)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 10, 'Drinking water Treatment Plants', align='L', fill=1)
    pdf.ln(10)

    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(255, 255, 255)
    pdf.set_fill_color(0, 138, 173)
    pdf.set_draw_color(0, 138, 173)

    pdf.cell(epw/2, 8, "Drinking water tratament plant", border=1, align='C', fill=1)
    pdf.cell(epw/2, 8, "System caracteristics", border=1, align='C', fill=1)
    pdf.set_text_color(100, 100, 100)
    pdf.set_fill_color(255, 255, 255)

    print ('getCaracteristicsPtapDetailPdf/?studyCase=' + study_case_id)
    requestJson = requests.get(url_api + 'getCaracteristicsPtapDetailPdf/?studyCase=' + study_case_id, verify=False)

    data = requestJson.json()
    lastNameCase = ""
    cellArray = []
    contLine = 0
    for item in data:
        if item['name'] != lastNameCase:
            if contLine != 0:
                cellArray.append(contLine)
                contLine = 0
            lastNameCase = item['name']
        contLine = contLine + 1
    cellArray.append(contLine)

    lastNameCase = ""
    contLine = 0
    for item in data:
        pdf.ln(6)
        if lastNameCase != item['name']:
            pdf.set_text_color(57, 137, 169)
            pdf.cell(epw/2, cellArray[contLine] * 6, item['name'] + ', to see click here', border=1,
                     align='L', fill=1, link= settings.SITE_HOST_API + 'treatment_plants/view/' + str(item['plantId']))
            lastNameCase = item['name']
            contLine = contLine + 1
        else:
            pdf.cell(epw/2, 6, "", border=0, align='L', fill=0)

        pdf.set_text_color(100, 100, 100)
        pdf.cell(epw/2, 6, item['description'], border=1, align='L', fill=1)
    
    # Nature based Solutions Conservation activities
    pdf.ln(10)
    pdf.set_font('Arial', '', 11)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 10, 'Nature based Solutions Conservation activities', align='L')
    pdf.ln(10)

    pdf.set_font('Arial', '', 9)
    pdf.set_text_color(255, 255, 255)
    pdf.set_fill_color(0, 138, 173)
    pdf.set_draw_color(0, 138, 173)

    pdf.cell(epw/2.58, 10, "Name", border=1, align='C', fill=1)
    pdf.cell(epw/9, 5, "Benefit %", border=1, align='C', fill=1)
    pdf.cell(epw/10, 10, "Benefit*", border=1, align='C', fill=1)
    pdf.cell(epw/10, 5, "Implementa-", border=1, align='C', fill=1)
    pdf.cell(epw/10, 5, "Maintenance", border=1, align='C', fill=1)
    pdf.cell(epw/10, 5, "Periodicity", border=1, align='C', fill=1)
    pdf.cell(epw/10, 5, "Opportunity", border=1, align='C', fill=1)
    pdf.ln(4)
    pdf.cell(epw/2.58, 5, "")
    pdf.cell(epw/9, 5, "at time t=0", border=1, align='C', fill=1)
    pdf.cell(epw/10, 5, "")
    pdf.cell(epw/10, 5, "tion cost", border=1, align='C', fill=1)
    pdf.cell(epw/10, 5, "cost", border=1, align='C', fill=1)
    pdf.cell(epw/10, 5, "maintenance", border=1, align='C', fill=1)
    pdf.cell(epw/10, 5, "cost", border=1, align='C', fill=1)
    pdf.ln(4)
    pdf.set_text_color(100, 100, 100)
    pdf.set_fill_color(255, 255, 255)
    pdf.set_font('Arial', '', 11)
    pdf.set_text_color(100, 100, 100)

    print ('getconservationActivitiesPdf/?studyCase=' + study_case_id)
    requestJson = requests.get(url_api + 'getconservationActivitiesPdf/?studyCase=' + study_case_id, verify=False)

    data = requestJson.json()
    for item in data:
        length_line = 50
        description = item['description'].split(".")[0] + "."
        lines_description = math.ceil(len(description) / length_line)
        pdf.cell(epw/2.58, 30, "", border=1, fill=1)
        pdf.cell(epw/9, 30, "", border=1, fill=1)
        pdf.cell(epw/10, 30, "", border=1, fill=1)
        pdf.cell(epw/10, 30, "", border=1, fill=1)
        pdf.cell(epw/10, 30, "", border=1, fill=1)
        pdf.cell(epw/10, 30, "", border=1, fill=1)
        pdf.cell(epw/10, 30, "", border=1, fill=1)
        pdf.ln(0)
        pdf.set_font('Arial', 'B', 9)
        pdf.cell(epw/2.58, 5, item['name'], align='L')
        pdf.set_font('Arial', '', 9)
        pdf.cell(epw/9, 20, str(item['profit_pct_time']), align='R')
        pdf.cell(epw/10, 20, str(item['benefit']).replace(".000", ""), align='R')
        pdf.cell(epw/10, 20, format(float(item['implementation']), '0,.2f'), align='R')
        pdf.cell(epw/10, 20, format(float(item['maintenance']), '0,.2f'), align='R')
        pdf.cell(epw/10, 20, format(float(item['periodicity']), '0,.2f'), align='R')
        pdf.cell(epw/10, 20, format(float(item['oportunity']), '0,.2f'), align='R')
        pdf.ln(5)
        pdf.set_font('Arial', '', 8)
        i = 0
        j = length_line
        for x in range(lines_description):
            pdf.cell(epw/4, 5, description[i:j], align='L')
            pdf.cell(epw/4, 5, "", align='L')
            pdf.ln(5)
            i = j
            j = j + length_line
        pdf.set_font('Arial', '', 9)
    pdf.ln(15)
    pdf.cell(0, 10, '* Time required to obtain maximum benefit (year).', align='L')

    print ('getFinancialAnalysisPdfRunAnalisisPdf/?studyCase=' + study_case_id)
    requestJson = requests.get(url_api + 'getFinancialAnalysisPdfRunAnalisisPdf/?studyCase=' + study_case_id, verify=False)
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

    print ('getObjetivesForPorfoliosPdf/?studyCase=' + study_case_id)
    requestJson = requests.get(url_api + 'getObjetivesForPorfoliosPdf/?studyCase=' + study_case_id, verify=False)
    data = requestJson.json()

    varText1 = ""
    varText2 = ""
    varText3 = ""
    varText4 = ""
    cont = 0

    for item in data:
        cont = cont + 1
        if cont == 1:
            varText1 = item['name']
        if cont == 2:
            varText2 = item['name']
        if cont == 3:
            varText3 = item['name']
        if cont == 4:
            varText4 = item['name']
        
    # PAGE (3)- Financial parameters
    pdf.add_page() # page 3 of 17
    pdf.set_font('Arial', '', 13)
    pdf.set_text_color(57, 137, 169)
    pdf.ln(5)
    pdf.cell(0, 10, 'Financial parameters', align='L')
    # 2da y 3ra Posición mueven la linea de arriba a abajo // 1ra y la 4ta pinta la linea de izquierda a derecha
    pdf.line(10, 42, 100, 42)
    pdf.line(100, 42, 180, 42)
    pdf.set_font('Arial', '', 11)
    pdf.set_text_color(57, 137, 169)
    pdf.ln(15)
    pdf.cell((epw/9) * 4, 15, 'Financial parameters', align='C')
    pdf.cell(epw/9, 15, '', align='C')
    pdf.cell((epw/9) * 4, 15, 'Porfolio objectives', align='C')
    pdf.ln(15)
    pdf.set_font('Arial', '', 9)
    pdf.set_text_color(100, 100, 100)
    pdf.cell((epw/9) * 3, 8, "Platform cost year 1 (US$/yr)")
    pdf.cell(epw/9, 8, format(float(platformCost), '0,.2f'), align='R')
    pdf.cell(epw/9, 15, '', align='C')
    pdf.cell((epw/9) * 4, 8, varText1)
    pdf.ln(8)
    pdf.cell((epw/9) * 3, 8, "Discount rate (%)")
    pdf.cell(epw/9, 8, format(float(discountRate), '0,.2f'), align='R')
    pdf.cell(epw/9, 15, '', align='C')
    pdf.cell(epw/9, 8, varText2)
    pdf.ln(8)
    pdf.cell((epw/9) * 3, 8, "Sensivity analysis - Minimum discount rate (%)")
    pdf.cell(epw/9, 8, format(float(discountRateMinimum), '0,.2f'), align='R')
    pdf.cell(epw/9, 15, '', align='C')
    pdf.cell(epw/9, 8, varText3)
    pdf.ln(8)
    pdf.cell((epw/9) * 3, 8, "Sensivity analysis - Maximum discount rate (%)")
    pdf.cell(epw/9, 8, format(float(discountRateMaximum), '0,.2f'), align='R')
    pdf.cell(epw/9, 15, '', align='C')
    pdf.cell(epw/9, 8, varText4)
    pdf.ln(8)

    pdf.set_font('Arial', '', 12)
    pdf.set_text_color(57, 137, 169)
    pdf.ln(5)
    pdf.cell(0, 15, 'Analysis parameters', align='C')
    pdf.line(70, 93, 140, 93)
    pdf.ln(15)
    pdf.set_font('Arial', '', 9)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(epw/5, 8, "")
    pdf.cell(epw/5, 8, "Implementation time of Nature based Solution (yr)")
    pdf.cell(epw/5, 8, "")
    pdf.cell(epw/5, 8, fullPorfolio, align='R')
    pdf.cell(epw/5, 8, "")
    pdf.ln(8)
    pdf.cell(epw/5, 8, "")
    pdf.cell(epw/5, 8, "ROI analysis time (yr)")
    pdf.cell(epw/5, 8, "")
    pdf.cell(epw/5, 8, fullRoi, align='R')
    pdf.cell(epw/5, 8, "")
    pdf.ln(8)
    pdf.cell(epw/5, 8, "")
    pdf.cell(epw/5, 8, "Climate selection for baseline and NbS scenario analysis")
    pdf.cell(epw/5, 8, "")
    pdf.cell(epw/5, 8, fullScenario, align='R')
    pdf.cell(epw/5, 8, "")
    pdf.ln(17)

    pdf.image('imgpdf/28.png', 18, 30, w=12)
    pdf.image('imgpdf/39.png', 130, 30, w=12)
    pdf.image('imgpdf/40.png', 72, 83, w=12)

    pdf.set_font('Arial', '', 11)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 10, 'Comparative graph of costs and benefits for the analysis period', align='L')
    pdf.ln(17)

    print ('getReportCostsAnalysisRoi/?studyCase=' + study_case_id)
    requestJson = requests.get(url_api + 'getReportCostsAnalysisRoi/?studyCase=' + study_case_id, verify=False)
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
            'text': 'Cost and benefits chart'
        },
        'colors': ['#90D3E7', '#008BAB', '#004B56', '#61D1C2'],
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
            'data': totalDiscountedCost,
            'type': 'spline',   
            'dashStyle': 'shortdot',
        }, {
            'name': 'Total Benefits',                     
            'data': totalBenefits
        }, {
            'name': 'Total Discounted Benefits',
            'type': 'spline',
            'dashStyle': 'shortdot',
            'data': totalDiscountedBenefits
        }]
    }

    hc_export.save_as_png(config=config, filename="imgpdf/igocab.png")
    pdf.image('imgpdf/igocab.png', 20, 140, w=160, h=90, type='png')

    # PAGE (4) - TABLE
    pdf.ln(120)

    pdf.add_page()
    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 10, 'This chart has been built with the data from the following table:', align='L')
    pdf.ln(10)
    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(255, 255, 255)
    pdf.set_fill_color(0, 138, 173)
    pdf.set_draw_color(0, 138, 173)
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
        pdf.cell(epw/5, 4, str(contTitle), border=1, align='R', fill=1)
        pdf.cell(epw/5, 4, format(float(item['totalCost']), '0,.2f'), border=1, align='R', fill=1)
        pdf.cell(epw/5, 4, format(float(item['totalDiscountedCost']), '0,.2f'), border=1, align='R', fill=1)
        pdf.cell(epw/5, 4, format(float(item['totalBenefits']), '0,.2f'), border=1, align='R', fill=1)
        pdf.cell(epw/5, 4, format(float(item['totalDiscountedBenefits']), '0,.2f'), border=1, align='R', fill=1)
        contTitle = contTitle + 1
        pdf.ln(4)

    # PAGE (5) - Comparative chart of costs
    pdf.add_page()
    pdf.ln(10)
    pdf.set_font('Arial', '', 11)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 10, 'Comparative chart of costs and benefits:', align='L')
    pdf.ln(10)
    pdf.set_font('Arial', '', 9)
    pdf.cell(0, 6, 'This graph allows you to compare your investment in the implementation and maintenance of the selected NbS, with respect,', align='L')
    pdf.ln(6)
    pdf.cell(0, 6, 'to the economic benefits which are obtained from the savings in the maintenance of the water intakes systems and case', align='L')
    pdf.ln(6)
    pdf.cell(0, 6, 'study infrastructure', align='L')
    pdf.ln(80)

    print ('getCostAndBenefit/?studyCase=' + study_case_id)
    requestJson = requests.get(url_api + 'getCostAndBenefit/?studyCase=' + study_case_id, verify=False)
    data = requestJson.json()

    dataCost = []
    dataBenefit = []
    itemCostr = 0
    itemBenefift = 0

    for item in data:
        dataCost.append(item['costr'])
        itemCostr = item['costr']
        dataBenefit.append(item['benefift'])
        itemBenefift = item['benefift']

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

    hc_export.save_as_png(config=config, filename="imgpdf/cab.png")
    pdf.image('imgpdf/cab.png', 45, 55, w=100, h=60, type='png')

    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 10, 'This chart has been built with the data from the following table:', align='L')
    pdf.set_font('Arial', '', 10)
    pdf.ln(10)
    pdf.cell(epw/4, 8, '', border=0, align='C', fill=0)
    pdf.cell(epw/4, 8, 'Cost', border=1, align='L', fill=1)
    pdf.cell(epw/4, 8, format(float(itemCostr), '0,.2f'), border=1, align='R', fill=1)
    pdf.cell(epw/4, 8, '', border=0, align='C', fill=0)
    pdf.ln(8)
    pdf.cell(epw/4, 8, '', border=0, align='C', fill=0)
    pdf.cell(epw/4, 8, 'Benefits', border=1, align='L', fill=1)
    pdf.cell(epw/4, 8, format(float(itemBenefift), '0,.2f'), border=1, align='R', fill=1)
    pdf.cell(epw/4, 8, '', border=0, align='C', fill=0)

    print ('getNetPresentValueSummary/?studyCase=' + study_case_id)
    requestJson = requests.get(url_api + 'getNetPresentValueSummary/?studyCase=' + study_case_id, verify=False)
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

    pdf.ln(18)
    pdf.set_font('Arial', '', 11)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 10, 'Net present value', align='L')
    pdf.ln(10)
    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 6, 'In this graph you can see: i) each type of cost NPV, ii) benefits NPV and iii) total NPV which is the ', align='L')
    pdf.ln(6)
    pdf.cell(0, 6, 'difference between costs and benefits.', align='L')
    pdf.ln(10)

    hc_export.save_as_png(config=config, filename="imgpdf/npvs.png")
    pdf.image('imgpdf/npvs.png', 35, 195, w=120, h=80, type='png')

    pdf.add_page()

    # page (6) - Data Table

    pdf.ln(10)
    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 10, 'This chart has been built with the data from the following table:', align='L')
    pdf.ln(10)
    pdf.set_font('Arial', '', 11)
    pdf.set_text_color(255, 255, 255)
    pdf.set_fill_color(0, 138, 173)
    pdf.set_draw_color(0, 138, 173)
    pdf.cell(epw, 10, 'Net present value sumary', border=1, align='C', fill=1)
    pdf.ln(10)
    pdf.set_font('Arial', '', 9)
    pdf.set_text_color(100, 100, 100)
    pdf.set_fill_color(255, 255, 255)
    pdf.cell((epw/4) * 3, 6, 'Implementation cost: cost requires to implement the activities including materials, supplies and labor',
             border=1, align='L', fill=1)
    pdf.cell(epw/4, 6, format(float(valimplementationr), '0,.2f'), border=1, align='R', fill=1)
    pdf.ln(6)
    pdf.cell((epw/4) * 3, 6, 'Maintance cost: cost to maintain NbS', border=1, align='L', fill=1)
    pdf.cell(epw/4, 6, format(float(valmaintenancer), '0,.2f'), border=1, align='R', fill=1)
    pdf.ln(6)
    pdf.cell((epw/4) * 3, 6, 'Oportunity cost: foregone benefits that would have been derived from and option another than NbS',
             border=1, align='L', fill=1)
    pdf.cell(epw/4, 6, format(float(valoportunityr), '0,.2f'), border=1, align='R', fill=1)
    pdf.ln(6)
    pdf.cell((epw/4) * 3, 6, 'Transaction cost: refers to administrative expenses', border=1, align='L', fill=1)
    pdf.cell(epw/4, 6, format(float(valtransactionr), '0,.2f'), border=1, align='R', fill=1)
    pdf.ln(6)
    pdf.cell((epw/4) * 3, 10, '', border=1, align='L', fill=1)
    pdf.ln(0)
    pdf.cell((epw/4) * 3, 6, 'Platform cost: these are fored expenses for the conservation program, which include staff, office,',
             border=0, align='L', fill=0)
    pdf.cell(epw/4, 10, format(float(valplatformr), '0,.2f'), border=1, align='R', fill=1)
    pdf.ln(6)
    pdf.cell((epw/4) * 3, 3.3, 'equipment, vehicles, among others.', border=0, align='L', fill=0)
    pdf.ln(4)
    pdf.cell((epw/4) * 3, 6, 'Benefit', border=1, align='L', fill=1)
    pdf.cell(epw/4, 6, format(float(valbenefitr), '0,.2f'), border=1, align='R', fill=1)
    pdf.ln(6)
    pdf.cell((epw/4) * 3, 6, 'Total', border=1, align='L', fill=1)
    pdf.cell(epw/4, 6, format(float(valtotalr), '0,.2f'), border=1, align='R', fill=1)
    pdf.ln(15)
    pdf.set_font('Arial', '', 13)
    pdf.cell(0, 10, 'Sensitivity analysis', align='L')
    pdf.set_text_color(57, 137, 169)
    pdf.ln(10)
    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 6, 'Next, a simple sensibility analysis is presented through the variation of the discount rate under the defined', align='L')
    pdf.ln(6)
    pdf.cell(0, 6, 'lower and upper limits. Remember that the discount rate is the cost of capital that is applied to determine ', align='L')
    pdf.ln(6)
    pdf.cell(0, 6, 'the present value of a future payment.', align='L')
    pdf.ln(10)

    print('getSensibilityAnalysisBenefits/?studyCase=' + study_case_id)
    requestJson = requests.get(url_api + 'getSensibilityAnalysisBenefits/?studyCase=' + study_case_id, verify=False)
    data = requestJson.json()

    dataSensibilityAnalysisBenefitsTime = []
    dataSensibilityAnalysisBenefitsRange = []

    for item in data:
        dataSensibilityAnalysisBenefitsTime.append([item['timer'], float(item['totalMedBenefitR'])])
        dataSensibilityAnalysisBenefitsRange.append([item['timer'], float(
            item['totalMinBenefitR']), float(item['totalMaxBenefittR'])])

    config = {
        'title': {
            'text': 'Sensibility analysis - total discounted benefits (TDB)'
        },
        'credits': {
            'enabled': 0
        },
        'yAxis': {
            'title': {
                'text': 'Total discounted benefits'
            }
        },
        'xAxis': {
            'title': {
                'text': 'Time in years discounted benefits'
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

    hc_export.save_as_png(config=config, filename="imgpdf/satdb.png")
    pdf.image('imgpdf/satdb.png', 30, 150, w=160, h=80, type='png')

    pdf.add_page() # add page 7 of 17 

    # PAGE (7) - Data Table 
    pdf.ln(10)
    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 6, 'This graph has been built with the data from the following table:', align='L')
    pdf.ln(6)
    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(255, 255, 255)
    pdf.set_fill_color(0, 138, 173)
    pdf.set_draw_color(0, 138, 173)
    pdf.cell(epw/4, 8, 'Time Period', border=1, align='C', fill=1)
    pdf.cell(epw/4, 8, 'Discounted benefit minimum', border=1, align='C', fill=1)
    pdf.cell(epw/4, 8, 'Discounted benefit medium', border=1, align='C', fill=1)
    pdf.cell(epw/4, 8, 'Discounted benefit maximum', border=1, align='C', fill=1)
    pdf.ln(8)
    pdf.set_font('Arial', '', 9)
    pdf.set_text_color(100, 100, 100)
    pdf.set_fill_color(255, 255, 255)
# Total discounted benefits
    num_rows_total_discounted = 1
    for item in data:
        pdf.cell(epw/4, 3.5, format(item['timer']), border=1, align='R', fill=1)
        pdf.cell(epw/4, 3.5, format(float(item['totalMinBenefitR']), '0,.2f'), border=1, align='R', fill=1)
        pdf.cell(epw/4, 3.5, format(float(item['totalMedBenefitR']), '0,.2f'), border=1, align='R', fill=1)
        pdf.cell(epw/4, 3.5, format(float(item['totalMaxBenefittR']), '0,.2f'), border=1, align='R', fill=1)
        pdf.ln(3.5)
        num_rows_total_discounted += 1

    print('getSensibilityAnalysisCost/?studyCase=' + study_case_id)
    requestJson = requests.get(url_api + 'getSensibilityAnalysisCost/?studyCase=' + study_case_id, verify=False)
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
                'text': 'Total discounted costs'
            }
        },
        'xAxis': {
            'title': {
                'text': 'Time in years discounted benefits'
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

    hc_export.save_as_png(config=config, filename="imgpdf/satdc.png")

    img_y = 150
    img_x = 22
    if num_rows_total_discounted > 30:
        pdf.add_page()
        img_y = 25

    pdf.image('imgpdf/satdc.png', img_x, img_y, w=160, h=0, type='PNG')

    # PAGE (8 or 9) - Data Table
    pdf.add_page()
    pdf.ln(10)
    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 6, 'This graph has been built with the data from the following table:', align='L')
    pdf.ln(6)
    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(255, 255, 255)
    pdf.set_fill_color(0, 138, 173)
    pdf.set_draw_color(0, 138, 173)
    pdf.cell(epw/4, 8, 'Time period', border=1, align='C', fill=1)
    pdf.cell(epw/4, 8, 'Discounted cost minimum', border=1, align='C', fill=1)
    pdf.cell(epw/4, 8, 'Discounted cost medium', border=1, align='C', fill=1)
    pdf.cell(epw/4, 8, 'Discounted cost maximum', border=1, align='C', fill=1)
    pdf.ln(8)
    pdf.set_font('Arial', '', 9)
    pdf.set_text_color(100, 100, 100)
    pdf.set_fill_color(255, 255, 255)

    for item in data:
        pdf.cell(epw/4, 4, format(item['timer']), border=1, align='R', fill=1)
        pdf.cell(epw/4, 4, format(float(item['totalMinCostR']), '0,.2f'), border=1, align='R', fill=1)
        pdf.cell(epw/4, 4, format(float(item['totalMedCostR']), '0,.2f'), border=1, align='R', fill=1)
        pdf.cell(epw/4, 4, format(float(item['totalMaxCostR']), '0,.2f'), border=1, align='R', fill=1)
        pdf.ln(4)

    # PAGE 9 - Physical Indicator
    pdf.add_page()

    pdf.set_font('Arial', '', 13)
    pdf.set_text_color(57, 137, 169)
    pdf.set_fill_color(255, 255, 255)
    pdf.cell(epw, 10, 'Physical Indicator', align='L')
    pdf.ln(10)

    pdf.set_font('Arial', '', 10)
    pdf.cell(epw, 10, 'Estimated change in ecosystem services by basin', align='L')
    pdf.ln(10)

    print('getTotalBenefitsForMilion/?studyCase=' + study_case_id)
    requestJson = requests.get(url_api + 'getTotalBenefitsForMilion/?studyCase=' + study_case_id, verify=False)
    data = requestJson.json()
    dataEfficiency = []

    for item in data:
        dataEfficiency.append(float(item['carbonStorage']))
        dataEfficiency.append(float(item['phosphorousLoad']))
        dataEfficiency.append(float(item['nitrogenLoad']))
        dataEfficiency.append(float(item['totalSediments']))
        dataEfficiency.append(float(item['baseFlow']))
        dataEfficiency.append(float(item['waterYear']))

        carbonStorageTable = float(item['carbonStorage'])
        phosphorousLoadTable = float(item['phosphorousLoad'])
        nitrogenLoadTable = float(item['nitrogenLoad'])
        totalSediments = float(item['totalSediments'])
        baseFlow = float(item['baseFlow'])
        waterYear = float(item['waterYear'])

    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(255, 255, 255)
    pdf.set_fill_color(0, 138, 173)
    pdf.set_draw_color(0, 138, 173)
    pdf.cell(epw, 8, 'Total analysis', border=1, align='C', fill=1)
    pdf.ln(8)
    pdf.set_text_color(100, 100, 100)
    pdf.set_fill_color(196, 228, 235)
    pdf.cell(epw, 90, '', border=1, align='C', fill=0)
    pdf.ln(0)
    pdf.cell(epw/5, 15, 'Indicador', border=1, align='C', fill=1)
    pdf.cell(epw/10, 15, 'Value', border=1, align='C', fill=1)
    pdf.ln(15)
    pdf.set_fill_color(255, 255, 255)
    pdf.cell(epw/5, 15, '', border=1, align='C', fill=1)
    pdf.cell(epw/10, 15, str(waterYear) + '%', border=1, align='C', fill=1)
    pdf.ln(0)
    pdf.set_font('Arial', '', 8)
    pdf.cell(epw/20, 7, '', border=0, align='C', fill=0)
    pdf.cell(epw/5, 7, 'Change in volume of', border=0, align='L', fill=0)
    pdf.ln(7)
    pdf.cell(epw/20, 7, '', border=0, align='C', fill=0)
    pdf.cell(epw/5, 7, 'water yield (%)', border=0, align='L', fill=0)
    pdf.set_font('Arial', '', 10)
    pdf.ln(8)
    pdf.cell(epw/5, 15, '', border=1, align='C', fill=1)
    pdf.cell(epw/10, 15, str(baseFlow) + '%', border=1, align='C', fill=1)
    pdf.ln(0)
    pdf.set_font('Arial', '', 8)
    pdf.cell(epw/20, 7, '', border=0, align='C', fill=0)
    pdf.cell(epw/5, 7, 'Change in base', border=0, align='L', fill=0)
    pdf.ln(7)
    pdf.cell(epw/20, 7, '', border=0, align='C', fill=0)
    pdf.cell(epw/5, 7, 'flow (%)', border=0, align='L', fill=0)
    pdf.set_font('Arial', '', 10)
    pdf.ln(8)
    pdf.cell(epw/5, 15, '', border=1, align='C', fill=1)
    pdf.cell(epw/10, 15, str(totalSediments) + '%', border=1, align='C', fill=1)
    pdf.ln(0)
    pdf.set_font('Arial', '', 8)
    pdf.cell(epw/20, 7, '', border=0, align='C', fill=0)
    pdf.cell(epw/5, 7, 'Change in total', border=0, align='L', fill=0)
    pdf.ln(7)
    pdf.cell(epw/20, 7, '', border=0, align='C', fill=0)
    pdf.cell(epw/5, 7, 'sediments (%)', border=0, align='L', fill=0)
    pdf.set_font('Arial', '', 10)
    pdf.ln(8)
    pdf.cell(epw/5, 15, '', border=1, align='C', fill=1)
    pdf.cell(epw/10, 15, str(nitrogenLoadTable) + '%', border=1, align='C', fill=1)
    pdf.ln(0)
    pdf.set_font('Arial', '', 8)
    pdf.cell(epw/20, 7, '', border=0, align='C', fill=0)
    pdf.cell(epw/5, 7, 'Change in nitrogen', border=0, align='L', fill=0)
    pdf.ln(7)
    pdf.cell(epw/20, 7, '', border=0, align='C', fill=0)
    pdf.cell(epw/5, 7, 'load (%)', border=0, align='L', fill=0)
    pdf.set_font('Arial', '', 10)
    pdf.ln(8)
    pdf.cell(epw/5, 15, '', border=1, align='C', fill=1)
    pdf.cell(epw/10, 15, str(carbonStorageTable) + '%', border=1, align='C', fill=1)
    pdf.ln(0)
    pdf.set_font('Arial', '', 8)
    pdf.cell(epw/20, 7, '', border=0, align='C', fill=0)
    pdf.cell(epw/5, 7, 'Change in carbon', border=0, align='L', fill=0)
    pdf.ln(7)
    pdf.cell(epw/20, 7, '', border=0, align='C', fill=0)
    pdf.cell(epw/5, 7, 'storage (%)', border=0, align='L', fill=0)
    pdf.set_font('Arial', '', 10)
    pdf.ln(8)

    config = {
        'chart': {
            'type': 'column'
        },
        'title': {
            'text': ''
        },
        'colors': ['#008BAB'],
        'xAxis': {
            'categories': ['Carbon storage', 'Phosphorus load', 'Nitrogen load', 'Total sediments', 'Base flow', 'Volumen of water yield']
        },
        'credits': {
            'enabled': 0
        },
        'series': [{
            'name': 'PE',
            'data': dataEfficiency
        }]
    }

    hc_export.save_as_png(config=config, filename="imgpdf/ecesb.png")
    pdf.image('imgpdf/ecesb.png', 70, 45, w=120)
    pdf.image('imgpdf/total-one.png', 10, 56, w=10)
    pdf.image('imgpdf/total-two.png', 10, 71, w=10)
    pdf.image('imgpdf/total-three.png', 10, 85, w=10)
    pdf.image('imgpdf/total-four.png', 10, 101, w=10)
    pdf.image('imgpdf/total-five.png', 10, 115.5, w=10)

    pdf.add_page()

    pdf.set_fill_color(231, 244, 244)
    pdf.cell(epw, 90, '', border=1, align='C', fill=1)
    pdf.ln(7)
    pdf.cell(epw/7, 5, '', border=0, align='C', fill=0)
    pdf.ln(0)
    pdf.set_font('Arial', '', 8)
    pdf.cell(epw/6, 5, '', border=0, align='C', fill=0)
    pdf.cell(((epw/7) * 6)-3, 4, 'Change in volume of water yield: Do changes in landscape affect the annual average water',
             border=0, align='L', fill=0)
    pdf.ln(4)
    pdf.cell(epw/6, 5, '', border=0, align='C', fill=0)
    pdf.cell(((epw/7) * 6)-3, 4, 'yield? Note that the model helps to establish changes in the annual water yield by analyzing the Bussiness', border=0, align='L', fill=0)
    pdf.ln(4)
    pdf.cell(epw/6, 5, '', border=0, align='C', fill=0)
    pdf.cell(((epw/7) * 9)-3, 4, 'as Usual (BaU) scenario and the Nature based Solutions scenario', border=0, align='L', fill=0)
    pdf.ln(7)
    pdf.cell(epw/6, 5, '', border=0, align='C', fill=0)
    pdf.cell(((epw/7) * 6)-3, 4, 'Change in base flow: Do landscape changes affect the basin runoff and recharge? The value presented',
             border=0, align='L', fill=0)
    pdf.ln(4)
    pdf.cell(epw/6, 5, '', border=0, align='C', fill=0)
    pdf.cell(((epw/7) * 6)-3, 4, 'depends on the cponnectivity and land use and cover components, so that the recharge is influenced',
             border=0, align='L', fill=0)
    pdf.ln(4)
    pdf.cell(epw/6, 5, '', border=0, align='C', fill=0)
    pdf.cell(((epw/7) * 9)-3, 4, 'by variables sich as vegetation cover and connectivity.', border=0, align='L', fill=0)
    pdf.ln(7)
    pdf.cell(epw/6, 5, '', border=0, align='C', fill=0)
    pdf.cell(((epw/7) * 6)-3, 4, 'Change in total sediments: Do you see changes in the amount od sediments yield from in tge basin?',
             border=0, align='L', fill=0)
    pdf.ln(4)
    pdf.cell(epw/6, 5, '', border=0, align='C', fill=0)
    pdf.cell(((epw/7) * 6)-3, 4, 'significant changes will result in erosion and water quality impacts.',
             border=0, align='L', fill=0)
    pdf.ln(7)
    pdf.cell(epw/6, 5, '', border=0, align='C', fill=0)
    pdf.cell(((epw/7) * 6)-3, 4, 'Change in total Nitrogen - Cah ge in total Phosphorous: Do you notice significant changes in the',
             border=0, align='L', fill=0)
    pdf.ln(4)
    pdf.cell(epw/6, 5, '', border=0, align='C', fill=0)
    pdf.cell(((epw/7) * 6)-3, 4, 'load of these nutrients? With this analysis you can assess the nutrient retention service by natural',
             border=0, align='L', fill=0)
    pdf.ln(4)
    pdf.cell(epw/6, 5, '', border=0, align='C', fill=0)
    pdf.cell(((epw/7) * 9)-3, 4, 'vegetation. It also allows you to identify potential treatment cost or improve water safety through',
             border=0, align='L', fill=0)
    pdf.ln(4)
    pdf.cell(epw/6, 5, '', border=0, align='C', fill=0)
    pdf.cell(((epw/7) * 9)-3, 4, 'access to clean water', border=0, align='L', fill=0)
    pdf.ln(7)
    pdf.cell(epw/6, 5, '', border=0, align='C', fill=0)
    pdf.cell(((epw/7) * 6)-3, 4, 'Change in Carbon storage: Are you seeing change in carbon storage? Carbon storage in a land',
             border=0, align='L', fill=0)
    pdf.ln(4)
    pdf.cell(epw/6, 5, '', border=0, align='C', fill=0)
    pdf.cell(((epw/7) * 6)-3, 4, 'parcel (pixel) depends n four carbon pools: aboveground biomass, underground biomass, soil and dead',
             border=0, align='L', fill=0)
    pdf.ln(4)
    pdf.cell(epw/6, 5, '', border=0, align='C', fill=0)
    pdf.cell(((epw/7) * 9)-3, 4, 'organic matter.', border=0, align='L', fill=0)
    pdf.ln(17)

    pdf.image('imgpdf/total-one.png', 20, 19, w=10)
    pdf.image('imgpdf/total-two.png', 20, 34, w=10)
    pdf.image('imgpdf/total-three.png', 20, 47, w=10)
    pdf.image('imgpdf/total-four.png', 20, 62, w=10)
    pdf.image('imgpdf/total-five.png', 20, 78, w=10)

    pdf.set_text_color(100, 100, 100)
    pdf.set_fill_color(255, 255, 255)
    pdf.set_draw_color(255, 255, 255)
    pdf.set_font('Arial', '', 11)
    pdf.cell(epw, 10, 'Estimated maximun change in ecosystem services', align='L')
    pdf.ln(5)
    pdf.cell(epw, 10, '(Business as Usual Scenario Vs Nature based Solutions Scenario)', align='L')
    pdf.set_font('Arial', '', 9)
    pdf.ln(20)
    pdf.cell(30, 6, 'Anual water yield', align='C')
    pdf.cell(1, 6, '')
    pdf.cell(30, 6, 'Base flow ', align='C')
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
    pdf.cell(30, 6, '', align='C')
    pdf.cell(1, 6, '')
    pdf.cell(30, 6, 'ratio', align='C')
    pdf.cell(1, 6, '')
    pdf.cell(30, 6, 'ratio - nitrogen', align='C')
    pdf.cell(1, 6, '')
    pdf.cell(30, 6, 'ratio - phosphorus', align='C')
    pdf.cell(1, 6, '')
    pdf.cell(30, 6, 'and sequestration', align='C')

    pdf.image('imgpdf/dashboard-01.png', 13, 140, w=24)
    pdf.image('imgpdf/dashboard-02.png', 44, 140, w=24)
    pdf.image('imgpdf/dashboard-03.png', 75, 140, w=24)
    pdf.image('imgpdf/dashboard-04.png', 106, 140, w=24)
    pdf.image('imgpdf/dashboard-05.png', 137, 140, w=24)
    pdf.image('imgpdf/dashboard-06.png', 168, 140, w=24)

    pdf.ln(37)
    pdf.set_font('Arial', '', 20)
    pdf.cell(30, 4, changeInVolumeOfWater + " %", align='C')
    pdf.cell(1, 4, '')
    pdf.cell(30, 4, changeInBaseFlow + " %", align='C')
    pdf.cell(1, 4, '')
    pdf.cell(30, 4, changeIntotalSediments + " %", align='C')
    pdf.cell(1, 4, '')
    pdf.cell(30, 4, changeInNitrogenLoad + " %", align='C')
    pdf.cell(1, 4, '')
    pdf.cell(30, 4, changeInPhosphorus + " %", align='C')
    pdf.cell(1, 4, '')
    pdf.cell(30, 4, changeInCarbonStorage + " %", align='C')

    pdf.ln(15)
    pdf.set_font('Arial', '', 11)
    pdf.cell(epw, 10, 'General Aqueduct indicators', align='L')

    print('getSelectorStudyCasesId/?studyCase=' + study_case_id)
    requestJson = requests.get(url_api + 'getSelectorStudyCasesId/?studyCase=' + study_case_id, verify=False)
    dataCase = requestJson.json()
    print('getReportAnalisysBenefics/?studyCase=' + study_case_id)
    requestJson = requests.get(url_api + 'getReportAnalisysBenefics/?studyCase=' + study_case_id, verify=False)
    dataBenefit = requestJson.json()
    numerLine = 0
    initial_v_offset = 198
    add_page_for_study_case = False
    for itemCase in dataCase:
        print ("add_page_for_study_case : %s" % add_page_for_study_case)
        if add_page_for_study_case:
            pdf.add_page()
            initial_v_offset = -53            

        pdf.set_font('Arial', '', 9)
        pdf.set_text_color(100, 100, 100)
        pdf.cell(epw, 10, itemCase['selector'], border=0, align='C', fill=0)

        pdf.image('imgpdf/picture-one.jpg', 10, (numerLine * 75) + initial_v_offset, w=45)
        pdf.image('imgpdf/picture-two.jpg', 58, (numerLine * 75) + initial_v_offset, w=45)
        pdf.image('imgpdf/picture-three.jpg', 106, (numerLine * 75) + initial_v_offset, w=45)
        pdf.image('imgpdf/picture-four.jpg', 154, (numerLine * 75) + initial_v_offset, w=45)

        numerLine = numerLine + 1
        pdf.ln(40)

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
        pdf.cell(45, 23, '', border=1, align='C', fill=1)
        pdf.cell(3, 23, '')
        pdf.cell(45, 23, '', border=1, align='C', fill=1)
        pdf.cell(3, 23, '')
        pdf.cell(45, 23, '', border=1, align='C', fill=1)
        pdf.cell(3, 23, '')
        pdf.cell(45, 23, '', border=1, align='C', fill=1)
        pdf.ln(0)
        pdf.cell(45, 3, 'Physical risk quantity measures risk related', align='C')
        pdf.cell(3, 3, '')
        pdf.cell(45, 3, 'Physical risk quality measures risk related', align='C')
        pdf.cell(3, 3, '')
        pdf.cell(45, 3, 'Risk regulatory and reputational risk', align='C')
        pdf.cell(3, 3, '')
        pdf.cell(45, 3, 'Overall water risk measures all water', align='C')
        pdf.ln(3)
        pdf.cell(45, 3, 'to too little or too much water by', align='C')
        pdf.cell(3, 3, '')
        pdf.cell(45, 3, 'to water that in unfit for use by aggregating', align='C')
        pdf.cell(3, 3, '')
        pdf.cell(45, 3, 'measures risk related to uncertainty in', align='C')
        pdf.cell(3, 3, '')
        pdf.cell(45, 3, 'related risk, by aggregating all selected', align='C')
        pdf.ln(3)
        pdf.cell(45, 3, 'aggregating all selected indicators from the', align='C')
        pdf.cell(3, 3, '')
        pdf.cell(45, 3, 'all selected indicators from the physical risk', align='C')
        pdf.cell(3, 3, '')
        pdf.cell(45, 3, 'regulatory chance, as well as conflich with', align='C')
        pdf.cell(3, 3, '')
        pdf.cell(45, 3, 'indicators from the physical risjk quantity,', align='C')
        pdf.ln(3)
        pdf.cell(45, 3, 'physical risk quantity category', align='C')
        pdf.cell(3, 3, '')
        pdf.cell(45, 3, 'quantity category', align='C')
        pdf.cell(3, 3, '')
        pdf.cell(45, 3, 're public regarding water issues', align='C')
        pdf.cell(3, 3, '')
        pdf.cell(45, 3, 'physical risk quality, and regulatory and', align='C')
        pdf.ln(3)
        pdf.cell(45, 3, '', align='C')
        pdf.cell(3, 3, '')
        pdf.cell(45, 3, '', align='C')
        pdf.cell(3, 3, '')
        pdf.cell(45, 3, '', align='C')
        pdf.cell(3, 3, '')
        pdf.cell(45, 3, 'reputational risk categories', align='C')
        pdf.ln(5)

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

        for itemBenefit in dataBenefit:
            if itemBenefit['intakeId'] == itemCase['intakeId']:
                txtColorR = 175
                txtColorG = 9
                txtColorB = 0

                if itemBenefit['color'].upper() == "DARK GREEN":
                    txtColorR = 21
                    txtColorG = 88
                    txtColorB = 22

                if itemBenefit['color'].upper() == "ORANGE":
                    txtColorR = 236
                    txtColorG = 104
                    txtColorB = 10

                if itemBenefit['nameIndicator'].upper() == "PHYSICAL RISK QUANTITY":
                    txtTd1 = itemBenefit['description']
                    txtTd1CR = txtColorR
                    txtTd1CG = txtColorG
                    txtTd1CB = txtColorB

                if itemBenefit['nameIndicator'].upper() == "PHYSICAL RISK ASSOCIATED WITH AMOUNT OF WATER":
                    txtTd2 = itemBenefit['description']
                    txtTd2CR = txtColorR
                    txtTd2CG = txtColorG
                    txtTd2CB = txtColorB

                if itemBenefit['nameIndicator'].upper() == "REGULATORY AND REPUTATIONAL":
                    txtTd3 = itemBenefit['description']
                    txtTd3CR = txtColorR
                    txtTd3CG = txtColorG
                    txtTd3CB = txtColorB

                if itemBenefit['nameIndicator'].upper() == "OVERALL WATER RISK SCORE":
                    txtTd4 = itemBenefit['description']
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
        pdf.ln(10)
        add_page_for_study_case = True

    pdf.add_page() # page x of 17

    print ('getReportOportunityResultIndicators/?studyCase=' + study_case_id)
    requestJson = requests.get(url_api + 'getReportOportunityResultIndicators/?studyCase=' + study_case_id, verify=False)
    data = requestJson.json()
    valueRoi = 0
    idTotalTreatmentCostSavings = 0
    idTimeFrame = 0
    idTotalEstimatedInvestment = 0
    idTotalAreaInvestmentSize = 0
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

    pdf.set_font('Arial', '', 13)
    pdf.set_text_color(57, 137, 169)
    pdf.set_fill_color(255, 255, 255)
    pdf.cell(epw, 10, 'Return on investment calculation', align='L')
    pdf.ln(10)
    pdf.set_font('Arial', '', 10)
    pdf.cell(epw, 7, 'Calculated ROI', align='C')
    pdf.ln(5)
    pdf.set_font('Arial', '', 15)
    pdf.cell(epw, 10, format(float(valueRoi), '0,.2f'), align='C')
    pdf.image('imgpdf/valor-bruto.png', 85, 33, w=35)
    pdf.set_font('Arial', '', 10)
    pdf.ln(40)
    pdf.cell(epw, 10, 'ROI due on implementation of Nature based Solutions', align='C')
    pdf.ln(10)
    pdf.set_text_color(255, 255, 255)
    pdf.set_fill_color(backgroundColorR, backgroundColorG, backgroundColorB)
    pdf.cell((epw/5)*2, 10, "",  border=0, align='C', fill=0)
    pdf.cell(epw/5, 10, nameBackgroundColor,  border=1, align='C', fill=1)
    pdf.ln(10)
    pdf.set_text_color(100, 100, 100)
    pdf.set_fill_color(255, 255, 255)
    pdf.cell(epw, 10, 'Total discounted benefits', align='C')
    pdf.ln(5)
    pdf.set_font('Arial', '', 15)
    pdf.cell(epw, 10, format(float(idTotalEstimatedInvestment), '0,.2f'), align='C')
    pdf.ln(7)
    pdf.set_font('Arial', '', 10)
    pdf.cell(epw, 10, 'Total discounted cost', align='C')
    pdf.ln(5)
    pdf.set_font('Arial', '', 15)
    pdf.cell(epw, 10, format(float(idTotalTreatmentCostSavings), '0,.2f'), align='C')
    pdf.ln(7)
    pdf.set_font('Arial', '', 10)
    pdf.cell(epw, 10, 'Total area investment size (Ha)', align='C')
    pdf.ln(5)
    pdf.set_font('Arial', '', 15)
    pdf.cell(epw, 10, format(float(idTotalAreaInvestmentSize), '0,.2f'), align='C')
    pdf.ln(7)
    pdf.set_font('Arial', '', 10)
    pdf.cell(epw, 10, 'Time frame (Years)', align='C')
    pdf.ln(5)
    pdf.set_font('Arial', '', 15)
    pdf.cell(epw, 10, format(float(idTimeFrame), '0,.2f'), align='C')
    pdf.ln(10)

    pdf.add_page() # page x of 17

    print('getReportAnalisysBeneficsC/?studyCase=' + study_case_id)
    requestJson = requests.get(url_api + 'getReportAnalisysBeneficsC/?studyCase=' + study_case_id, verify=False)
    data = requestJson.json()

    pdf.set_font('Arial', '', 13)
    pdf.set_text_color(57, 137, 169)
    pdf.ln(10)
    pdf.cell(epw, 10, 'Intervention and budget summary', align='L')
    pdf.ln(5)
    pdf.set_text_color(100, 100, 100)

    contLine = 0
    lastTitle = ""
    for item in data:
        if lastTitle != item['intakeId']:
            pdf.set_font('Arial', '', 10)
            pdf.ln(10)
            pdf.cell(epw, 6, str(item['name']), align='C')
            pdf.ln(6)
            pdf.set_font('Arial', '', 10)
            pdf.set_text_color(255, 255, 255)
            pdf.set_fill_color(0, 138, 173)
            pdf.set_draw_color(0, 138, 173)
            pdf.cell(epw/3, 8, 'Nature based Solution', border=1, align='C', fill=1)
            pdf.cell(epw/3, 8, 'Actual spend', border=1, align='C', fill=1)
            pdf.cell(epw/3, 8, 'Area converted (Ha)', border=1, align='C', fill=1)
            pdf.ln(8)
            pdf.set_text_color(100, 100, 100)
            pdf.set_fill_color(255, 255, 255)
            pdf.set_draw_color(0, 138, 173)
            lastTitle = item['intakeId']

        pdf.cell(epw/3, 8, "", border=1, align='L', fill=1)
        pdf.cell(epw/3, 8, "", border=1, align='R', fill=1)
        pdf.cell(epw/3, 8, "", border=1, align='R', fill=1)
        pdf.ln(0)
        pdf.cell(epw/3, 5, str(item['sbnf'])[0:36], align='L')
        pdf.cell(epw/3, 5, format(float(item['costPerHectarea']), '0,.2f'), align='R')
        pdf.cell(epw/3, 5, format(float(item['recomendedIntervetion']), '0,.2f'), align='R')
        pdf.ln(4)
        pdf.cell(epw/3, 5, str(item['sbnf'])[36:72], align='L')
        pdf.cell(epw/3, 5, "", align='R')
        pdf.cell(epw/3, 5, "", align='R')
        pdf.ln(4)

    # pdf.add_page()

    pdf.set_font('Arial', '', 13)
    pdf.set_text_color(57, 137, 169)
    pdf.cell(0, 10, 'Physical indicators', align='L')
    pdf.ln(10)
    pdf.set_text_color(100, 100, 100)

    print('getWpAqueductIndicatorGraph/?studyCase=' + study_case_id)
    requestJson = requests.get(url_api + 'getWpAqueductIndicatorGraph/?studyCase=' + study_case_id, verify=False)
    data = requestJson.json()
    arrayTitle = []
    lastTitle = ""
    lastIntake = ""

    for item in data:
        if lastIntake != item['intake'] or lastTitle != item['indicator']:
            arrayTitle.append(contLine)

    cellArray = []
    contLine = 0
    lastTitle = ""
    for item in data:
        if lastIntake != item['intake'] or lastTitle != item['indicator']:
            if contLine != 0:
                cellArray.append(contLine)
                contLine = 0
            lastTitle = item['indicator']
            lastIntake = item['intake']
        contLine = contLine + 1
    cellArray.append(contLine)

    lastTitle = ""
    lastIntake = ""
    contLine = 0

    for item in data:
        if lastIntake != item['intake'] or lastTitle != item['indicator']:
            if lastTitle == "Future 10 years":
                pdf.ln(10)
            if lastTitle == "Future 20 years":
                pdf.ln(10)
            if lastTitle == "Physical Risk associated with Amount of Water":
                pdf.ln(5)
                pdf.cell(epw, 5, 'Baseline water stress measures the ratio of total water withdrawals to available renewable surface and groundwater supplies. Higher', border=0, align='L', fill=0)
                pdf.ln(5)
                pdf.cell(epw, 5, 'values indicate more competition between users.', border=0, align='L', fill=0)
                pdf.ln(7)
                pdf.cell(epw, 5, 'Baseline water depletion measures the total water consumption of available renewable water supplies. Higher values indicate a greater', border=0, align='L', fill=0)
                pdf.ln(5)
                pdf.cell(epw, 5, 'impact on the local water supply and decreased water availability for downstream users.',
                         border=0, align='L', fill=0)
                pdf.ln(7)
                pdf.cell(epw, 5, 'Interannual variability measures the average between-year variability of available water supply, including both renewable surface and', border=0, align='L', fill=0)
                pdf.ln(5)
                pdf.cell(epw, 5, 'groundwater supplies. Highervalues indicate wider variations in available supply from year to year.',
                         border=0, align='L', fill=0)
                pdf.ln(7)
                pdf.cell(epw, 5, 'Seasonal variability measures the average within-year variability of available water supply, including renewable surface and ground', border=0, align='L', fill=0)
                pdf.ln(5)
                pdf.cell(epw, 5, 'water supplies. Higher values indicate wider variations in the supply available within a year.',
                         border=0, align='L', fill=0)
                pdf.ln(7)
                pdf.cell(epw, 5, 'Water table decline measures the average water table decline as the average change for the study period (1990-2014). The result is', border=0, align='L', fill=0)
                pdf.ln(5)
                pdf.cell(epw, 5, 'expressed in centimeters per year (cm / year). Higher values indicate higher levels of unsustainable groundwater.', border=0, align='L', fill=0)
                pdf.ln(7)
                pdf.cell(epw, 5, 'River flood risk measures the percentage of the population expected to be affected by river flooding in an average year, taking into', border=0, align='L', fill=0)
                pdf.ln(5)
                pdf.cell(epw, 5, 'account existing flood protection standards. Higher values indicate that, on average, a greater proportion of the population is', border=0, align='L', fill=0)
                pdf.ln(5)
                pdf.cell(epw, 5, 'expected to be affected by river flooding.', border=0, align='L', fill=0)
                pdf.ln(7)

            if lastTitle == "Physical risk quantity":
                pdf.ln(5)
                pdf.cell(epw, 5, 'Untreated connected wastewater measures the percentage of domestic wastewater that is connected through a sewer system and is not', border=0, align='L', fill=0)
                pdf.ln(5)
                pdf.cell(epw, 5, 'treated to at least a primary treatment level. Discharging wastewater without adequate treatment could expose water bodies, the', border=0, align='L', fill=0)
                pdf.ln(5)
                pdf.cell(epw, 5, 'general public, and ecosystems to pollutants such as pathogens and nutrients. Higher values indicate higher percentages of point', border=0, align='L', fill=0)
                pdf.ln(5)
                pdf.cell(epw, 5, 'source wastewater discharged without treatment.', border=0, align='L', fill=0)
                pdf.ln(7)

            if lastTitle == "Regulatory and reputational":
                pdf.ln(5)
                pdf.cell(epw, 5, 'Unimproved / no drinking water reflects the percentage of the population that collects drinking water from an unprotected dug well', border=0, align='L', fill=0)
                pdf.ln(5)
                pdf.cell(epw, 5, 'or spring, or directly from a river, dam, lake, pond, stream, canal or irrigation canal (WHO and UNICEF 2017). Higher values', border=0, align='L', fill=0)
                pdf.ln(5)
                pdf.cell(epw, 5, 'indicate areas where people have less access to clean water supplies.',
                         border=0, align='L', fill=0)
                pdf.ln(7)

            pdf.set_font('Arial', '', 10)
            pdf.set_text_color(0, 138, 173)
            pdf.cell(0, 6, item['name'], align='C')
            pdf.ln(6)
            pdf.set_text_color(255, 255, 255)
            pdf.set_fill_color(0, 138, 173)
            pdf.set_draw_color(0, 138, 173)
            pdf.cell((epw/10) * 4, 6, 'Indicator', border=1, align='C', fill=1)
            pdf.cell((epw/10) * 4, 6, 'Description', border=1, align='C', fill=1)
            pdf.cell(epw/10 * 2, 6, 'Value', border=1, align='C', fill=1)
            pdf.set_font('Arial', '', 9)
            pdf.set_text_color(100, 100, 100)
            pdf.set_fill_color(255, 255, 255)

            lastIntake = item['intake']
            lastTitle = item['indicator']
            pdf.ln(6)
            pdf.cell((epw/10) * 4, cellArray[contLine] * 6, item['indicator'], border=1, align='L', fill=1)
            contLine = contLine + 1
        else:
            pdf.cell((epw/10) * 4, 6, "", border=0, align='L', fill=0)

        pdf.cell((epw/10) * 4, 6, str(item['description']), border=1, align='L', fill=1)
        pdf.cell(epw/10 * 2, 6, str(item['valueGraT']), border=1, align='R', fill=1)
        pdf.ln(6)

    if lastTitle == "Future 10 years":
        pdf.ln(10)
    if lastTitle == "Future 20 years":
        pdf.ln(10)
    if lastTitle == "Physical Risk associated with Amount of Water":
        pdf.ln(5)
        pdf.cell(epw, 5, 'Baseline water stress measures the ratio of total water withdrawals to available renewable surface and groundwater supplies. Higher', border=0, align='L', fill=0)
        pdf.ln(5)
        pdf.cell(epw, 5, 'values indicate more competition between users.', border=0, align='L', fill=0)
        pdf.ln(7)
        pdf.cell(epw, 5, 'Baseline water depletion measures the total water consumption of available renewable water supplies. Higher values indicate a greater', border=0, align='L', fill=0)
        pdf.ln(5)
        pdf.cell(epw, 5, 'impact on the local water supply and decreased water availability for downstream users.',
                 border=0, align='L', fill=0)
        pdf.ln(7)
        pdf.cell(epw, 5, 'Interannual variability measures the average between-year variability of available water supply, including both renewable surface and', border=0, align='L', fill=0)
        pdf.ln(5)
        pdf.cell(epw, 5, 'groundwater supplies. Highervalues indicate wider variations in available supply from year to year.',
                 border=0, align='L', fill=0)
        pdf.ln(7)
        pdf.cell(epw, 5, 'Seasonal variability measures the average within-year variability of available water supply, including renewable surface and ground', border=0, align='L', fill=0)
        pdf.ln(5)
        pdf.cell(epw, 5, 'water supplies. Higher valuesindicate wider variations in the supply available within a year.',
                 border=0, align='L', fill=0)
        pdf.ln(7)
        pdf.cell(epw, 5, 'Water table decline measures the average water table decline as the average change for the study period (1990-2014). The result is', border=0, align='L', fill=0)
        pdf.ln(5)
        pdf.cell(epw, 5, 'expressed in centimeters per year (cm / year). Higher values indicate higher levels of unsustainable groundwater.', border=0, align='L', fill=0)
        pdf.ln(7)
        pdf.cell(epw, 5, 'River flood risk measures the percentage of the population expected to be affected by river flooding in an average year, taking into', border=0, align='L', fill=0)
        pdf.ln(5)
        pdf.cell(epw, 5, 'account existing flood protection standards. Higher values indicate that, on average, a greater proportion of the population is', border=0, align='L', fill=0)
        pdf.ln(5)
        pdf.cell(epw, 5, 'expected to be affected by river flooding.', border=0, align='L', fill=0)
        pdf.ln(7)

    if lastTitle == "Physical risk quantity":
        pdf.ln(5)
        pdf.cell(epw, 5, 'Untreated connected wastewater measures the percentage of domestic wastewater that is connected through a sewer system and is not', border=0, align='L', fill=0)
        pdf.ln(5)
        pdf.cell(epw, 5, 'treated to at least a primary treatment level. Discharging wastewater without adequate treatment could expose water bodies, the', border=0, align='L', fill=0)
        pdf.ln(5)
        pdf.cell(epw, 5, 'general public, and ecosystems to pollutants such as pathogens and nutrients. Higher values indicate higher percentages of point', border=0, align='L', fill=0)
        pdf.ln(5)
        pdf.cell(epw, 5, 'source wastewater discharged without treatment.', border=0, align='L', fill=0)
        pdf.ln(7)

    if lastTitle == "Regulatory and reputational":
        pdf.ln(5)
        pdf.cell(epw, 5, 'Unimproved / no drinking water reflects the percentage of the population that collects drinking water from an unprotected dug well', border=0, align='L', fill=0)
        pdf.ln(5)
        pdf.cell(epw, 5, 'or spring, or directly from a river, dam, lake, pond, stream, canal or irrigation canal (WHO and UNICEF 2017). Higher values', border=0, align='L', fill=0)
        pdf.ln(5)
        pdf.cell(epw, 5, 'indicate areas where people have less access to clean water supplies.', border=0, align='L', fill=0)
        pdf.ln(7)
    
    pdf.add_page()

    pdf.set_font('Arial', '', 13)
    pdf.set_text_color(57, 137, 169)
    pdf.cell(0, 10, 'Decision indicators', align='L')
    
    pdf.ln(10)
    pdf.set_font('Arial', '', 11)
    pdf.set_text_color(100, 100, 100)        
    pdf.cell(0, 7, 'Incidence of benefits and cost', align='L')
    pdf.ln(10)
    pdf.cell(0, 7, 'Drinking water treatment plant', align='L')

    dataListBenefitsIntakeA = []
    print ('getWaterproofReportsAnalysisBenefits/?studyCase=' + study_case_id)
    requestJson = requests.get(url_api + 'getWaterproofReportsAnalysisBenefits/?studyCase=' + study_case_id, verify=False)
    data = requestJson.json()
    lastRegister = 0
    for item in data:
        if item['typeId'] == 'PTAP':
            lastRegister = 1
            dataListBenefitsIntakeA.append({
                'name': item['elementId'],
                'y': item['vpnMedBenefit']
            })

    config = {
        'chart': {
            'plotShadow': 0,
            'type': 'pie'
        },
        'colors': ['#008BAB', '#69b7cf', '#3f99b5', '#1d7c99', '#90D3E7', '#5ca8bf', '#448fa6', '#2b768c', '#176075', '#004B56', '#47bfaf', '#32ab9b', '#209989', '#128778', '#61D1C2'],
        'title': {
            'text': 'Intake Benefits ptap'
        },
        'plotOptions': {
            'pie': {
                'allowPointSelect': 1,
                'cursor': 'pointer',
                'dataLabels': {
                    'enabled': 0
                },
                'showInLegend': 1
            }
        },
        'credits': {'enabled': 0},
        'series': [{
            'name': 'Intake Benefits',
            'colorByPoint': 1,
            'data': dataListBenefitsIntakeA
        }]
    }

    if len(dataListBenefitsIntakeA) > 0:
        hc_export.save_as_png(config=config, filename="imgpdf/wrab.png")
        pdf.image('imgpdf/wrab.png', 10, 60, w=90)
        pdf.ln(40)
    else:
        pdf.ln(10)
        pdf.set_font('Arial', '', 10)
        pdf.set_text_color(100, 100, 100)
        pdf.image('imgpdf/nodatadef.png', 20, 38, w=70)
        pdf.cell(0, 7, 'Intake Benefits Treatment Plant', align='L')
        pdf.ln(35)
        pdf.cell(0, 50, '* there is no data for this graph', align='L')
        pdf.ln(5)

    pdf.set_font('Arial', '', 9)
    if lastRegister == 0:
        pdf.ln(6)
        pdf.ln(6)
        pdf.ln(6)

    for item in dataListBenefitsIntakeA:
        pdf.cell(epw/2, 6, '')
        pdf.cell((epw/6) * 2, 6, item['name'], border=1, align='L', fill=1)
        pdf.cell(epw/6, 6, format(float(item['y']), '0,.2f'), border=1, align='R', fill=1)
        pdf.ln(6)

    pdf.ln(20)
    pdf.set_font('Arial', '', 10)
    pdf.cell(epw/2, 7, 'Identify the elements that will yield the most benefits', align='C')
    pdf.ln(15)

    pdf.set_font('Arial', '', 11)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 7, 'Intake Benefits', align='L')

    dataListBenefitsIntakeB = []

    for item in data:
        if item['typeId'] != 'PTAP':
            dataListBenefitsIntakeB.append({
                'name': item['elementId'],
                'y': item['vpnMedBenefit']
            })

    pdf.set_font('Arial', '', 9)
    for item in dataListBenefitsIntakeB:
        pdf.cell(epw/2, 6, '')
        pdf.cell((epw/6) * 2, 6, item['name'], border=1, align='L', fill=1)
        pdf.cell(epw/6, 6, format(float(item['y']), '0,.2f'), border=1, align='R', fill=1)
        pdf.ln(6)

    pdf.ln(20)
    pdf.set_font('Arial', '', 10)
    pdf.cell(epw/2, 5, 'Identify the elements that will yield the most benefits', align='C')

    # Intake Benefits intake
    config = {
        'chart': {
            'plotShadow': 0,
            'type': 'pie'
        },
        'colors': ['#008BAB', '#69b7cf', '#3f99b5', '#1d7c99', '#90D3E7', '#5ca8bf', '#448fa6', '#2b768c', '#176075', '#004B56', '#47bfaf', '#32ab9b', '#209989', '#128778', '#61D1C2'],
        'title': {
            'text': 'Intake Benefits intake'
        },
        'plotOptions': {
            'pie': {
                'allowPointSelect': 1,
                'cursor': 'pointer',
                'dataLabels': {
                    'enabled': 0
                },
                'showInLegend': 1
            }
        },
        'credits': {
            'enabled': 0
        },
        'series': [{
            'name': 'Intake Benefits',
            'colorByPoint': 1,
            'data': dataListBenefitsIntakeB
        }]
    }

    if len(dataListBenefitsIntakeB) > 0:
        hc_export.save_as_png(config=config, filename="imgpdf/wrabi.png")
        pdf.image('imgpdf/wrabi.png', 10, 145, w=90)
        pdf.ln(40)
    else:
        pdf.ln(10)
        pdf.set_font('Arial', '', 10)
        pdf.set_text_color(100, 100, 100)
        pdf.cell(0, 7, 'Intake Benefits intake', align='L')
        pdf.image('imgpdf/nodatadef.png', 20, 135, w=70)
        pdf.ln(35)
        pdf.cell(0, 110, '* there is no data for this graph', align='L')
        pdf.ln(5)

    pdf.add_page()

    # Total Benefits for the analysis
    dataListBenefitsIntakeC = []
    print('getReportAnalysisBenefitsFilterSum/?studyCase=' + study_case_id)
    requestJson = requests.get(url_api + 'getReportAnalysisBenefitsFilterSum/?studyCase=' + study_case_id, verify=False)
    data = requestJson.json()
    for item in data:
        dataListBenefitsIntakeC.append({
            'name': item['typer'],
            'y': item['vpnMedBenefitr']
        })

    pdf.ln(30)

    pdf.set_font('Arial', '', 11)
    pdf.set_text_color(100, 100, 100)        
    pdf.cell(0, 7, 'Total benefits for the analysis', align='L')
    pdf.ln(25)
    pdf.set_font('Arial', '', 9)
    for item in dataListBenefitsIntakeC:
        pdf.cell(epw/2, 6, '')
        pdf.cell((epw/6) * 2, 6, item['name'], border=1, align='L', fill=1)
        pdf.cell(epw/6, 6, format(float(item['y']), '0,.2f'), border=1, align='R', fill=1)
        pdf.ln(6)

    pdf.ln(40)
    pdf.set_font('Arial', '', 10)
    pdf.cell(epw/2, 7, 'This is a disaggregated view of the benefits by elements', align='C')

    config = {
        'chart': {
            'plotShadow': 0,
            'type': 'pie'
        },
        'colors': ['#008BAB', '#69b7cf', '#3f99b5', '#1d7c99', '#90D3E7', '#5ca8bf', '#448fa6', '#2b768c', '#176075', '#004B56', '#47bfaf', '#32ab9b', '#209989', '#128778', '#61D1C2'],
        'title': {
            'text': 'Total Benefits'
        },
        'plotOptions': {
            'pie': {
                'allowPointSelect': 1,
                'cursor': 'pointer',
                'dataLabels': {
                    'enabled': 0
                },
                'showInLegend': 1
            }
        },
        'credits': {
            'enabled': 0
        },
        'series': [{
            'name': 'Intake Benefits',
            'colorByPoint': 1,
            'data': dataListBenefitsIntakeC
        }]
    }

    hc_export.save_as_png(config=config, filename="imgpdf/rabfs.png")
    pdf.image('imgpdf/rabfs.png', 10, 60, w=90)


    # Total cost for the analysis
    dataListBenefitsIntakeD = []
    
    print('getReportCostsAnalysisFilter/?studyCase=' + study_case_id)
    requestJson = requests.get(url_api + 'getReportCostsAnalysisFilter/?studyCase=' +
                               study_case_id, verify=False)
    data = requestJson.json()
    for item in data:
        dataListBenefitsIntakeD.append({
            'name': item['typer'],
            'y': item['sumFilter']
        })

    pdf.ln(30)

    pdf.set_font('Arial', '', 11)
    pdf.set_text_color(100, 100, 100)        
    pdf.cell(0, 7, 'Total cost for the analysis', align='L')
    pdf.ln(20)
    pdf.set_font('Arial', '', 9)
    for item in dataListBenefitsIntakeD:
        pdf.cell(epw/2, 6, '')
        pdf.cell((epw/6) * 2, 6, item['name'], border=1, align='L', fill=1)
        pdf.cell(epw/6, 6, format(float(item['y']), '0,.2f'), border=1, align='R', fill=1)
        pdf.ln(6)

    pdf.ln(40)
    pdf.set_font('Arial', '', 10)
    pdf.cell(epw/2, 5, 'In this graph you can identify the magnitudes of the', align='C')
    pdf.ln(5)
    pdf.cell(epw/2, 5, 'costs, in order to help identify where greater', align='C')
    pdf.ln(5)
    pdf.cell(epw/2, 5, 'investments are needed', align='C')

    config = {
        'chart': {
            'plotShadow': 0,
            'type': 'pie'
        },
        'colors': ['#008BAB', '#69b7cf', '#3f99b5', '#1d7c99', '#90D3E7', '#5ca8bf', '#448fa6', '#2b768c', '#176075', '#004B56', '#47bfaf', '#32ab9b', '#209989', '#128778', '#61D1C2'],
        'title': {
            'text': 'Intake Benefits'
        },
        'plotOptions': {
            'pie': {
                'allowPointSelect': 1,
                'cursor': 'pointer',
                'dataLabels': {
                    'enabled': 0
                },
                'showInLegend': 1
            }
        },
        'credits': {
            'enabled': 0
        },
        'series': [{
            'name': 'Intake Benefits',
            'colorByPoint': 1,
            'data': dataListBenefitsIntakeD
        }]
    }

    hc_export.save_as_png(config=config, filename="imgpdf/rcafh.png")
    pdf.image('imgpdf/rcafh.png', 10, 165, w=90)

    pdf.add_page()

    dataListBenefitsIntakeE = []
    print('getReportCostsAnalysisFilterNbs/?studyCase=' + study_case_id)
    requestJson = requests.get(url_api + 'getReportCostsAnalysisFilterNbs/?studyCase=' + study_case_id, verify=False)
    data = requestJson.json()
    for item in data:
        dataListBenefitsIntakeE.append({
            'name': item['costIdr'],
            'y': item['sumFilter']
        })

    pdf.ln(25)

    pdf.set_font('Arial', '', 11)
    pdf.set_text_color(100, 100, 100)        
    pdf.cell(0, 7, 'Cost per activity for the analysis', align='L')
    pdf.ln(30)
    pdf.set_font('Arial', '', 9)
    for item in dataListBenefitsIntakeE:
        pdf.cell(epw/2, 6, '')
        pdf.cell((epw/6) * 2, 6, item['name'], border=1, align='L', fill=1)
        pdf.cell(epw/6, 6, format(float(item['y']), '0,.2f'), border=1, align='R', fill=1)
        pdf.ln(6)

    pdf.ln(60)
    pdf.set_font('Arial', '', 10)
    pdf.cell(epw/2, 5, 'Identify the proportion of costs for each of the', align='C')
    pdf.ln(5)
    pdf.cell(epw/2, 5, 'activities of your interest', align='C')

    configE = {
        'chart': {
            'plotShadow': 0,
            'type': 'pie'
        },
        'colors': ['#008BAB', '#69b7cf', '#3f99b5', '#1d7c99', '#90D3E7', '#5ca8bf', '#448fa6', '#2b768c', '#176075', '#004B56', '#47bfaf', '#32ab9b', '#209989', '#128778', '#61D1C2'],
        'title': {
            'text': 'Total Benefits'
        },
        'plotOptions': {
            'pie': {
                'allowPointSelect': 1,
                'cursor': 'pointer',
                'dataLabels': {
                    'enabled': 0
                },
                'showInLegend': 1
            }
        },
        'credits': {
            'enabled': 0
        },
        'series': [{
            'name': 'Intake Benefits',
            'colorByPoint': 1,
            'data': dataListBenefitsIntakeE
        }]
    }

    hc_export.save_as_png(config=configE, filename="imgpdf/rcafn.png")
    pdf.image('imgpdf/rcafn.png', 10, 60, w=90)


    pdf.add_page()

    pdf.set_font('Arial', '', 13)
    pdf.set_text_color(57, 137, 169)
    pdf.cell(0, 10, 'Geographic resources', align='L')
    pdf.ln(10)
    pdf.set_font('Arial', '', 11)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 10, 'The analysis run includes geographic outputs that you would query at the following link:', align='L')
    heightIcon = 0

    print('getWpcompareMapas/?studyCase=' + study_case_id)
    requestJson = requests.get(url_api + 'getWpcompareMapas/?studyCase=' + study_case_id, verify=False)
    data = requestJson.json()

    msg_geo_line_1 = "The analysis generated a set of geographic outputs, including: projections in "
    msg_geo_line_2 = "land use change ecosystem services, and spatial location of the implementation"
    msg_geo_line_3 = "portfolio suggested by the RiOS model. To consult the maps "
    msg_geo_line_4 = "click here."
    
    for item in data:
        pdf.ln(20)
        center = json.loads(str(item['center']))
        centerxy = str(center['coordinates'])[1: len(str(center['coordinates'])) - 1].split()
        pdf.set_text_color(100, 100, 100)
        pdf.cell(epw, 10, item['nameIntake'], border=0, align='L', fill=0)
        pdf.image('imgpdf/mapas-pdf.png', 20, 50 + heightIcon, w=30)
                
        geo_url = url_api + "geographic/?folder="
        folder = item['folder']
        intake = item['intake']
        region = item['region']
        year = item['year']
        study_case = item['studycase'] 
        pdf.ln(18)
        geo_link = "%s%s&intake=%s&region=%s&year=%s&study_case_id=%s&center=%s,%s" % (geo_url, folder, intake, region, year, study_case, centerxy[1], centerxy[0])
        pdf.cell(45, 5, "")
        pdf.cell(0, 5, msg_geo_line_1, link=geo_link)
        pdf.ln(5)
        pdf.cell(45, 5, "")
        pdf.cell(0, 5, msg_geo_line_2, link=geo_link)
        pdf.ln(5)
        pdf.cell(45, 5, "")
        pdf.cell(105, 5, msg_geo_line_3, link=geo_link)  
        pdf.set_text_color(30, 30, 180)
        pdf.set_font(style="B")
        pdf.cell(0, 5, msg_geo_line_4, link=geo_link)      
        pdf.set_font(style="")
        heightIcon = heightIcon + 50
        pdf.set_text_color(100,100,100)

    ####################################################
    base_path_output = os.path.join(settings.MEDIA_ROOT , 'tmp')
    if (not os.path.isdir(base_path_output)):
        os.mkdir(base_path_output)
    report_filename = 'report_case_study_%s.pdf' % study_case_id
    study_case_filename = os.path.join(base_path_output, report_filename)
    if (os.path.isfile(study_case_filename)):
        try:
            os.remove(study_case_filename)
        except OSError:
            print("Error: %s - %s." % (OSError.errno, OSError.strerror))

    print("creating pdf report : " + study_case_filename)
    pdf_output = pdf.output(study_case_filename, 'S')

    with open(study_case_filename, 'rb') as fh:
        response = HttpResponse(fh.read(), content_type="application/pdf")
        response['Content-Disposition'] = 'attachment; filename=' + report_filename
        fh.close()
        return response
    ####################################################

def pdfgeo(request):

    base64_data = re.sub('^data:image/.+;base64,', '', request.POST['mapSendImage'])
    study_case_id = request.POST['studyCase']
    url_api = settings.SITE_HOST_API + 'reports/'
    city = request.POST['studyCity']
    region = request.POST['studyRegion']
    country = request.POST['studyCountry']
    discount_rate = request.POST['discountRateData']
    img_legend_base64 = re.sub('^data:image/.+;base64,', '', request.POST['imgLegend'])

    if base64_data != "data:,":
        byte_data = base64.b64decode(base64_data)
        image_data = BytesIO(byte_data)
        img = Image.open(image_data)
        img.save(map_send_image, "png")

        
    pdf = PDF()
    map_img_location = {'x': 10, 'y': 130, 'w': 190}

    # PAGE 1 -- INTRO
    pdf = pdf_page_1(pdf, study_case_id, url_api, city, region, country, discount_rate, False, map_img_location)

    if img_legend_base64 != "data:,":
        img_legend = 'imgpdf/map-legend-image.png'
        byte_data = base64.b64decode(img_legend_base64)
        image_data = BytesIO(byte_data)
        img = Image.open(image_data)        
        img.save(img_legend, "png")
        legend_lbl_position = 128
        img_legend_position = 262
        if (img.height > 95): # if image is bigger than 95px, we need to add a new page
            pdf.add_page()
            legend_lbl_position = 10
            img_legend_position = 35

        pdf.set_font('Arial', 'B', 11)
        pdf.ln(legend_lbl_position)
        pdf.cell(0, 10, 'Legend')
        pdf.set_font('Arial', '', 10)
        pdf.ln(5)
        pdf.cell(0, 10, 'NbS Porfolio')
        pdf.image(img_legend, 10, img_legend_position, w=60)
    

    ####################################################
    base_path_output = os.path.join(settings.MEDIA_ROOT , 'tmp')
    if (not os.path.isdir(base_path_output)):
        os.mkdir(base_path_output)
    report_filename = 'report_case_study_%s.pdf' % study_case_id
    study_case_filename = os.path.join(base_path_output, report_filename)
    if (os.path.isfile(study_case_filename)):
        try:
            os.remove(study_case_filename)
        except OSError:
            print("Error: %s - %s." % (OSError.errno, OSError.strerror))

    print("creating pdf report : " + study_case_filename)
    pdf_output = pdf.output(study_case_filename, 'S')

    with open(study_case_filename, 'rb') as fh:
        response = HttpResponse(fh.read(), content_type="application/pdf")
        response['Content-Disposition'] = 'attachment; filename=' + report_filename
        fh.close()
        return response
    ####################################################

def pdf_page_1(pdf, study_case_id, url_api, city, region, country, discount_rate, show_intake_info, map_location):
    pdf.add_page()  # add page 1 of 17
    pdf.alias_nb_pages()
    pdf.image('imgpdf/header-logo.png', 10, 5, w=35)
    pdf.image('imgpdf/header-pdf.png', 120, 0, w=90)
    #pdf.image(map_send_image, 6.5, 122, w=193.5)
    pdf.image(map_send_image, map_location['x'], map_location['y'], w=map_location['w'])

    pdf.set_font('Arial', 'B', 20)
    pdf.set_text_color(57, 137, 169)
    pdf.ln(15)
    pdf.cell(0, 0, 'Case study')
    pdf.set_font('Arial', '', 11)
    pdf.set_text_color(179, 179, 179)
    pdf.ln(8)
   
    pdf.cell(0, 0, date.today().strftime("%d %B, %Y"))
    pdf.ln(8)
    pdf.cell(0, 0, 'This report is generated by WaterProof')
    pdf.ln(5)
    pdf.cell(0, 0, '(https://water-proof.org/) in order to provide an indicative')
    pdf.ln(5)
    pdf.cell(0, 0, 'pre-feasibility assessment regarding the potential for NbS.')
    pdf.ln(8)
    pdf.cell(0, 0, 'From this document you can have a synthesis of')
    pdf.ln(5)
    pdf.cell(0, 0, 'the result of indicators')
    pdf.ln(8)
    pdf.set_font('Arial', '', 8)
    pdf.cell(0, 0, 'Disclaimer: As stated in the terms conditions, WaterProof is suported by global data sets models generated by ther initiatives, therefore, it is not')
    pdf.ln(4)
    pdf.cell(0, 0, 'responsible for the availability of such sites and accuracy of the calculations, The user can go directly to the data sources when required and use the')
    pdf.ln(4)
    pdf.cell(0, 0, 'website in accordance with the appropriate terms of use, WaterProof does not guarantee and therefore not responsible for the legality, accurary,')
    pdf.ln(4)
    pdf.cell(0, 0, 'completeness, timeliness of the data, as well as the handling that user gives to the information generated.')
    pdf.ln(4)

    epw = pdf.w - 2*pdf.l_margin
    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(250, 250, 250)
    pdf.set_fill_color(0, 138, 173)
    pdf.set_draw_color(0, 138, 173)

    studyCaseName = "-"
    print ('getSelectorStudyCasesId/?studyCase=' + study_case_id)
    requestJson = requests.get(url_api + 'getSelectorStudyCasesId/?studyCase=' + study_case_id, verify=False)
    data = requestJson.json()
    for item in data:
        studyCaseName = item['studyCasesName']

    numberOfWater = "-"
    numberOfDwtp = "-"
    # print ('getStudyCasesIntake/?studyCase=' + study_case_id)
    requestJson = requests.get(url_api + 'getStudyCasesIntake/?studyCase=' + study_case_id, verify=False)
    data = requestJson.json()
    for item in data:
        numberOfWater = item['numberStudyCase']
        numberOfDwtp = item['numberStudyCase']

    currencyCase = "-"
    timeCase = "-"
    
    print ('getReportAnalisysBeneficsB/?studyCase=' + study_case_id)
    requestJson = requests.get(url_api + 'getReportAnalisysBeneficsB/?studyCase=' + study_case_id, verify=False)
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

    pdf.set_text_color(57, 137, 169)
    pdf.set_font('Arial', '', 13)
    pdf.cell(0, 10, 'This case study is based on:')
    pdf.ln(10)
    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(epw, 8, studyCaseName, border=1, align='C', fill=1)
    
    pdf.ln(8)
    pdf.set_text_color(100, 100, 100)
    pdf.set_fill_color(255, 255, 255)
    pdf.cell(epw/2, 20, "", border=1, fill=1)
    pdf.cell(epw/2, 20, "", border=1, fill=1)
    pdf.ln(0)
    pdf.cell(epw/2, 5, "City:   " + city)
    pdf.cell(epw/2, 5, "Number of water intakes that are part of the analysis:   " + str(numberOfWater))
    pdf.ln(5)
    pdf.cell(epw/2, 5, "Country:   " + country)
    pdf.cell(epw/2, 5, "Number of DWTP in the analysis:   " + str(numberOfDwtp))
    pdf.ln(5)
    pdf.cell(epw/2, 5, "Region:   " + region)
    pdf.cell(epw/2, 5, "Currency:   " + currencyCase)
    pdf.ln(5)
    pdf.cell(epw/2, 5, "Time frame (years):   " + str(timeCase))
    pdf.cell(epw/2, 5, "Discount rate (%):   " + discount_rate)

    if show_intake_info:
        pdf.ln(104)
        pdf.set_font('Arial', '', 11)
        pdf.set_text_color(100, 100, 100)
        pdf.cell(0, 10, 'Water intakes that are part of the analysis')
        pdf.ln(10)
        pdf.set_font('Arial', '', 10)
        pdf.set_text_color(255, 255, 255)
        pdf.set_fill_color(0, 138, 173)
        pdf.set_draw_color(0, 138, 173)

        pdf.cell(epw/2, 8, "Water Intake", border=1, align='C', fill=1)
        pdf.cell(epw/2, 8, "System caracteristics", border=1, align='C', fill=1)
        pdf.set_text_color(100, 100, 100)
        pdf.set_fill_color(255, 255, 255)

        print ('getCaracteristicsCsIntakePdf/?studyCase=' + study_case_id)
        requestJson = requests.get(url_api + 'getCaracteristicsCsIntakePdf/?studyCase=' + study_case_id, verify=False)

        data = requestJson.json()
        lastItenName = ""

        cellArray = []
        contLine = 0
        lastLine = 0
        for item in data:
            if item['name'] != lastItenName:
                if contLine != 0:
                    cellArray.append(contLine)
                    contLine = 0
                lastItenName = item['name']
            lastLine = lastLine + 1
            contLine = contLine + 1
        cellArray.append(contLine)

        if (len(data) > 6):
            pdf.add_page()

        lastItenName = ""
        contLine = 0
        for item in data:
            pdf.ln(6)
            if item['name'] != lastItenName:
                pdf.set_text_color(57, 137, 169)
                pdf.cell(epw/2, cellArray[contLine] * 6, item['name'] + ', to see click here', border=1,
                        align='L', fill=1, link= settings.SITE_HOST_API + 'intake/ShowDiagram/' + str(item['intakeId']))
                lastItenName = item['name']
                contLine = contLine + 1
            else:
                pdf.cell(epw/2, 6, "", border=0, align='L', fill=0)

            pdf.set_text_color(100, 100, 100)
            pdf.cell(epw/2, 6, item['description'], border=1, align='L', fill=1)
        
        pdf.ln(10)

        if (len(data) < 6):
            pdf.add_page()  # Page 2 of 17

    return pdf


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
            if objectIndicator.intake not in result:
                result.append(objectIndicator.intake)
        except:
            print("")
    return result


def getNameCity(indicators):
    result = []
    for objectIndicatorcity in indicators:
        try:
            if objectIndicatorcity.intake.city.name not in result:
                result.append(objectIndicatorcity.intake.city.name)
        except:
            print("")
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
            indicators = investIndicators.objects.filter(intake__id=intake)
            indicatorsNames = getNames(indicators)
        except:
            base_data = 'mapserver'
            intake = ''
            region = ''
            year = ''
            study_case_id = ''
            center = ''
            indicators = ''
            indicatorsNames = ''
    return render(
        request,
        'waterproof_reports/geographicIndicators.html',
        {
            'base_data': base_data,
            'intake': intake,
            'region': region,
            'year': year,
            'study_case_id': study_case_id,
            'center': center,
            'indicators': indicators,
            'NamesIndicators': indicatorsNames,
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
