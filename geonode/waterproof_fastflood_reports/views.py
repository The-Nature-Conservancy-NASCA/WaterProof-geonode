from django.shortcuts import render
from django.conf import settings
from geonode.waterproof_fastflood.models import StudyCases, StudyCases_NBS_Fastflood
from geonode.waterproof_parameters.models import Countries
from geonode.waterproof_reports.models import investIndicators
from geonode.waterproof_fastflood_reports.models import zip as zip_model
from geonode.waterproof_nbs_ca.models import  RiosActivity, RiosTransition, RiosTransformation, WaterproofPrLulc
from geonode.waterproof_intake.models import Basins
from django.utils.translation import ugettext as _
from django.http import HttpResponseRedirect, HttpResponse
from django.core import serializers
from django.http import JsonResponse
from django.urls import reverse
from django.db import connection
import simplejson as json
import os
import matplotlib
matplotlib.use('Agg')  # Usar backend no interactivo para evitar problemas con tkinter
import matplotlib.pyplot as plt
import numpy as np
import logging
from scipy.interpolate import make_interp_spline
from . import views_helpers
from datetime import date
from geonode.waterproof_reports.views import PDF

logger = logging.getLogger(__name__)

ARIAL = 'Arial'
map_send_image = 'imgpdf/map-send-image.png'
colors = ['#008BAB', '#69b7cf', '#A3C791', '#1A7158', '#46A086', '#92DEC8', '#A6ACAA', '#DADFDE', '#6480AC', '#415F8C', '#B8D1EC', '#E89F28', '#EBCB60', '#ECE0B8', '#755538']

def reportMenu(request, idx):
    if request.method == 'POST':
        return HttpResponseRedirect(reverse('study_cases_list'))
    else:
        
        study_case = StudyCases.objects.get(id=idx)
        watershed = study_case.watershed.first()
        polygon = study_case.watershed.first().polygon_set.first()
        basin = Basins.objects.get(id=polygon.basin_id)
        polygon_geom = polygon.geom
        resolution = polygon.resolution
        polygon_wkt = polygon_geom.wkt
        cx, cy = polygon_geom.centroid.coords
        
        # Ejecutar procedimiento almacenado
        vpn_data = []
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM __get_report_graph_vpn_fastflood(%s)", [idx])
                columns = [col[0] for col in cursor.description]
                vpn_data = [
                    dict(zip(columns, row))
                    for row in cursor.fetchall()
                ]
        except Exception as e:
            logger.error(f"Error executing __get_report_graph_vpn_fastflood: {e}")
            vpn_data = []
        
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM __get_report_analisys_beneficsC_fastflood(%s)", [idx])
                columns = [col[0] for col in cursor.description]
                benefics_c = [
                    dict(zip(columns, row))
                    for row in cursor.fetchall()
                ]
        except Exception as e:
            logger.error(f"Error executing __get_report_analisys_beneficsC_fastflood: {e}")
            benefics_c = []

        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM __get_report_analisys_benefics_fastflood(%s)", [idx])
                columns = [col[0] for col in cursor.description]
                benefics = [
                    dict(zip(columns, row))
                    for row in cursor.fetchall()
                ]
        except Exception as e:
            logger.error(f"Error executing __get_report_analisys_benefics_fastflood: {e}")
            benefics = []
        
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM __get_report_analisys_beneficsB_fastflood(%s)", [idx])
                columns = [col[0] for col in cursor.description]
                benefics_b = [
                    dict(zip(columns, row))
                    for row in cursor.fetchall()
                ]
        except Exception as e:
            logger.error(f"Error executing __get_report_analisys_beneficsB_fastflood: {e}")
            benefics = []
        
        study_case_zip = zip_model.objects.filter(study_case_id__id=idx).first()        
        return render(
            request, 'waterproof_fastflood_reports/reports_menu.html',
            {
                "serverApi": settings.WATERPROOF_API_SERVER,
                'study_case': study_case,
                'country': study_case.city.country,
                'watershed': watershed,                
                'polygon': polygon_wkt,
                'watershed_geojson': polygon.geom_watershed,
                'resolution': resolution,
                'center': f"{cy},{cx}",
                'region': basin.label,
                'idx': idx,
                'vpn_data_json': json.dumps(vpn_data),
                'benefics_c': benefics_c,
                'benefics': benefics,
                'benefics_b': benefics_b,
                'studyCaseZip': study_case_zip,
            }
        )
        
def dashboard(request):
    return render(request, 'waterproof_reports/dashboard.html', {})

def pivot_data(request):
    dataset = Countries.objects.all()
    data = serializers.serialize('json', dataset)
    return JsonResponse(data, safe=False)

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

def financialIndicators(request, idx):

    study_case = StudyCases.objects.get(id=idx)
    objects_list = []
    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM __get_report_analysis_benefits_filter_fastflood(%s)" % idx
            cursor.execute(sql)
            rows = cursor.fetchall()
            for row in rows:
                objects_list.append({
                    "name":row[2],
                    "subName":row[2],
                    "subCategory":row[3],
                    "subNameCategory":str(row[2]) + str(row[3]),
                    "totalBenefits":row[4],
                    "totalBenefitsDiscount":row[5],
                    "year": row[1]
                })
                benefits = sorted(objects_list, key=lambda tree : tree['subNameCategory'])                
    except Exception as e:
        logger.error(f"Error executing __get_report_analysis_benefits_filter_fastflood: {e}")
        benefits = []

    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM __get_report_costs_analysis_filter_fastflood(%s)" % idx
            cursor.execute(sql)
            rows = cursor.fetchall()
            cost_list = []
            for row in rows:
                cost_list.append({
                    "name":row[0],
                    "subName":row[2],
                    "nameSubName":row[0]+row[2],
                    "totalCost":row[3],
                    "totalDiscountedCost":row[6],
                    "totalBenefits":row[5],
                    "totalDiscountedBenefits":row[4],
                    "year": row[1]
                })
            costs = sorted(cost_list, key=lambda tree : tree['nameSubName'])

    except Exception as e:
        logger.error(f"Error executing __get_report_costs_analysis_filter_fastflood: {e}")
        costs = []

    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM __get_report_costs_analysis_roi_fastflood(%s)" % idx
            cursor.execute(sql)
            rows = cursor.fetchall()
            costs_analysis_roi_list = []
            for row in rows:
                costs_analysis_roi_list.append({
                    "record":row[0],
					"money":row[1],
					"date":row[2].strftime("%Y/%m/%d"),
					"totalCost":row[4],
					"totalDiscountedCost":row[6],
					"totalBenefits":row[3],
					"totalDiscountedBenefits":row[5]
                })            
    except Exception as e:
        logger.error(f"Error executing __get_report_costs_analysis_roi_fastflood: {e}")
        costs_analysis_roi_list = []

    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM __get_report_graph_cost_bene_fastflood(%s)" % idx
            cursor.execute(sql)
            rows = cursor.fetchall()
            cost_benefits_list = []
            for row in rows:
                cost_benefits_list.append({
                    "currencyr":row[0],
                    "costr":row[1],
                    "benefift":row[2]
        })
    except Exception as e:
        logger.error(f"Error executing __get_report_graph_cost_bene_fastflood: {e}")
        cost_benefits_list = []
    
    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM __get_report_graph_vpn_fastflood(%s)" % idx
            cursor.execute(sql)
            rows = cursor.fetchall()
            npv_data = []
            for row in rows:
                npv_data.append({
                    "currencyr":row[0],
					"implementationr":row[1],
					"maintenancer":row[2],
					"oportunityr":row[3],
					"transactionr":row[4],
					"platformr":row[5],
					"benefitr":row[6],
					"totalr":row[7],
        })
    except Exception as e:
        logger.error(f"Error executing __get_report_graph_vpn_fastflood: {e}")
        npv_data = []

    
    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM __get_report_analisys_sensitivy_benefits_fastflood(%s)" % idx
            cursor.execute(sql)
            rows = cursor.fetchall()
            sensitivy_benefits = []
            for row in rows:
                sensitivy_benefits.append({
                    "timer":row[0],
					"totalMinBenefitR":row[1],
					"totalMedBenefitR":row[2],
					"totalMaxBenefittR":row[3],
        })
    except Exception as e:
        logger.error(f"Error executing __get_report_analisys_sensitivy_benefits_fastflood: {e}")
        sensitivy_benefits = []


    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM __get_report_analisys_sensitivy_cost_fastflood(%s)" % idx
            cursor.execute(sql)
            rows = cursor.fetchall()
            sensitivy_cost = []
            for row in rows:
                sensitivy_cost.append({
                    "timer":row[0],
					"totalMinCostR":row[1],
					"totalMedCostR":row[2],
					"totalMaxCostR":row[3],
        })
    except Exception as e:
        logger.error(f"Error executing __get_report_analisys_sensitivy_cost_fastflood: {e}")
        sensitivy_cost = []

    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM __get_report_graph_cost_vs_benefit_fastflood(%s)" % idx
            cursor.execute(sql)
            rows = cursor.fetchall()
            graph_cost_vs_benefit = []
            for row in rows:
                graph_cost_vs_benefit.append({
                    "totalMinimumR":row[0],
					"totalMediumR":row[1],
					"totalMaximumR":row[2],
					"titleR":row[3],
					"porcen_discount_rateR":row[4],
					"porcen_discount_rate_minimumR":row[5],
					"porcen_discount_rate_maximumR":row[6],
        })
    except Exception as e:
        logger.error(f"Error executing __get_report_graph_cost_vs_benefit_fastflood: {e}")
        graph_cost_vs_benefit = []

    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM __get_report_graph_return_of_invest_roi_fastflood(%s)" % idx
            cursor.execute(sql)
            rows = cursor.fetchall()
            graph_roi_data = []
            for row in rows:
                graph_roi_data.append({
                    "roiMediumR":row[0],
					"roiMaximumR":row[1],
					"roiMinimumR":row[2],
					"porcentDiscountRater":row[3],
					"porcentDiscountRaterMinimumR":row[4],
					"porcentDiscountRaterMaximumR":row[5],
        })
    except Exception as e:
        logger.error(f"Error executing __get_report_graph_return_of_invest_roi_fastflood: {e}")
        graph_roi_data = []

    polygon = study_case.watershed.first().polygon_set.first()
    basin = Basins.objects.get(id=polygon.basin_id)
    cx, cy = polygon.geom.centroid.coords
    watershed_id = study_case.watershed.first().id
    study_case_zip = zip_model.objects.filter(study_case_id__id=idx).first()
    return render(
        request,
        'waterproof_fastflood_reports/financialIndicators.html',
        {
            'study_case': study_case,
            'benefits': benefits,
            'costs': costs,
            'costs_analysis_roi': costs_analysis_roi_list,
            'graph_cost_benefits_data': cost_benefits_list,
            'npv_data': npv_data,
            'sensitivy_benefits': sensitivy_benefits,
            'sensitivy_cost': sensitivy_cost,
            'graph_cost_vs_benefit': graph_cost_vs_benefit,
            'graph_roi_data': graph_roi_data,
            'watershed_id': watershed_id,                   
            'center': f"{cy},{cx}",
            'region': basin.label,
            'studyCaseZip': study_case_zip,
        })

def decisionIndicators(request, idx):

    study_case = StudyCases.objects.get(id=idx)
    watershed_id = study_case.watershed.first().id
    api_server = settings.WATERPROOF_API_SERVER
    remote_server = api_server.replace("/proxy/?url=","").replace("wf-models","")
    polygon = study_case.watershed.first().polygon_set.first()
    basin = Basins.objects.get(id=polygon.basin_id)
    cx, cy = polygon.geom.centroid.coords
    return render(
        request,
        'waterproof_fastflood_reports/decisionIndicators.html',
        {
            'study_case': study_case,
            'watershed_id': watershed_id,
            'remote_server': remote_server,
            'center': f"{cy},{cx}",
            'region': basin.label,
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
            study_case = StudyCases.objects.get(id=study_case_id)
            polygon = study_case.watershed.first().polygon_set.first()
            bounds = polygon.geom.extent            
            bbox = f"{bounds[0]},{bounds[1]},{bounds[2]},{bounds[3]}"
            basin = Basins.objects.get(id=polygon.basin_id)
            
        except:
            base_data = 'mapserver'
            intake = ''
            region = ''
            year = ''
            study_case_id = ''
            center = ''
            indicators = ''
            indicatorsNames = ''
    study_case_zip = zip_model.objects.filter(study_case_id__id=study_case_id).first()
    #print("study_case_zip: ", study_case_zip)
    return render(
        request,
        'waterproof_fastflood_reports/geographicIndicators.html',
        {
            'base_data': base_data,
            'intake': intake,
            'region': basin.label,
            'year': year,
            'study_case_id': study_case_id,
            'study_case': study_case,
            'center': center,
            'indicators': indicators,
            'NamesIndicators': indicatorsNames,
            'polygon': polygon.geom.wkt,
            'watershedGeojson': polygon.geom_watershed,
            'bbox': bbox,
            'studyCaseZip': study_case_zip,
        })

def linkDownload(request, idx):
    from django.http import StreamingHttpResponse, Http404
    import requests
    from urllib.parse import urlparse
    import os

    download_zip = zip_model.objects.filter(study_case_id__id=idx).first()

    if not download_zip or not download_zip.link:
        raise Http404("Archivo ZIP no encontrado")

    file_url = download_zip.link

    try:
        # Realizar petición GET para obtener el archivo
        response_file = requests.get(file_url, stream=True, timeout=30)

        # Verificar que la petición fue exitosa
        if response_file.status_code != 200:
            logger.error(f"Error fetching file from URL {file_url}: Status {response_file.status_code}")
            raise Http404("Archivo no disponible")

        # Extraer el nombre del archivo de la URL
        parsed_url = urlparse(file_url)
        filename = os.path.basename(parsed_url.path)

        # Si no se puede extraer un nombre, usar uno por defecto
        if not filename or not filename.endswith('.zip'):
            filename = f"study_case_{idx}.zip"

        # Crear respuesta de streaming
        response = StreamingHttpResponse(
            response_file.iter_content(chunk_size=8192),
            content_type='application/zip'
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'

        # Si el servidor remoto proporciona Content-Length, incluirlo
        if 'content-length' in response_file.headers:
            response['Content-Length'] = response_file.headers['content-length']

        return response

    except requests.RequestException as e:
        logger.error(f"Error downloading file from {file_url}: {e}")
        raise Http404("Error al descargar el archivo")
    except Exception as e:
        logger.error(f"Unexpected error downloading file: {e}")
        raise Http404("Error al descargar el archivo")
    
def pdf(request):
    """
    Genera un PDF con el reporte completo del caso de estudio de FastFlood.    
    """
    # Extraer parámetros de la petición
    study_case_id = request.POST['studyCase']
    url_api = settings.SITE_HOST_API + 'fastflood/reports/'
    city = request.POST['studyCity']
    region = request.POST['studyRegion']
    country = request.POST['studyCountry']
    year = request.POST['timePeriod']
    discount_rate = request.POST['discountRateData']
    peakDischargeTr10 = request.POST['peakDischargeTr10']
    peakDischargeTr100 = request.POST['peakDischargeTr100']
    floodedArea = request.POST['floodedArea']
    changeInCarbonStorage = request.POST['changeInCarbonStorage']
    
    # Procesar imagen del mapa
    views_helpers.process_map_image(request.POST['mapSendImage'])    

    # Inicializar PDF
    pdf = PDF()
    epw = pdf.w - 2*pdf.l_margin
    
    # PAGE 1 - Introducción
    map_img_location = {'x': 10, 'y': 146.5, 'w': 190}
    study_case = StudyCases.objects.get(id=study_case_id)
    watershed = study_case.watershed.first()
    polygon = watershed.polygon_set.first()    
    region = study_case.city.country.region
        
    pdf, changeInVolumeOfWater, changeInBaseFlow, changeIntotalSediments, changeInNitrogenLoad, changeInPhosphorus, changeInCarbonStorage1 = pdf_page_1(
    pdf, study_case_id, url_api, city, region, country, discount_rate, map_img_location, watershed)
    
    pdf_page_2(pdf, study_case_id, epw)    

    pdf_page_3(study_case_id, epw, pdf) 

    pdf_page_4(study_case_id, epw, pdf)
        
    pdf_page_5(study_case_id, epw, pdf)
    
    pdf_page_6(study_case_id, epw, pdf)
    
    pdf_page_7(study_case_id, epw, peakDischargeTr10, peakDischargeTr100, floodedArea, changeInCarbonStorage, pdf)
    
    pdf_page_8(study_case_id, epw, pdf)
    
    pdf_page_9(study_case_id, epw, pdf)
        
    pdf_page_10(url_api, study_case, watershed, polygon, region, epw, pdf)


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

def pdf_page_1(pdf, study_case_id, url_api, city, region, country, discount_rate, map_location, watershed):
    pdf.add_page()  # add page 1 of 17
    pdf.alias_nb_pages()
    pdf.image('imgpdf/header-logo.png', 10, 5, w=35)
    pdf.image('imgpdf/header-pdf.png', 120, 0, w=90)
    pdf.image(map_send_image, map_location['x'], map_location['y'], w=map_location['w'])

    pdf.set_font('Arial', 'B', 20)
    pdf.set_text_color(57, 137, 169)
    pdf.ln(15)   
    pdf.cell(0, 0, 'Case study')
        
    pdf.set_font('Arial', '', 11)
    pdf.set_text_color(179, 179, 179)
    pdf.ln(8)   
    paragraph = ['This report is generated by WaterProof', 
                 '(https://water-proof.org/) to provide an indicative', 
                 'pre-feasibility assessment of the potential for NbS.', 
                 'The analysis shows how nature-based can help reduce', 
                 'flood risk by lowering water levels, limiting flooded areas,', 
                 'and protecting people and infrastructure while also', 
                 'supporting ecosystems and climate resilience.']

   
    pdf.cell(0, 0, date.today().strftime("%d %B, %Y"))
    pdf.ln(8)

    add_paragraph(paragraph, 5, pdf);

    pdf.ln(3)
    pdf.cell(0, 0, 'From this document you can have a synthesis of')
    pdf.ln(5)
    pdf.cell(0, 0, 'the result of indicators')
    pdf.ln(8)
    pdf.set_font('Arial', '', 8)

    paragraph = ['Disclaimer: As stated in the terms conditions, WaterProof is suported by global data sets models generated by ther initiatives, therefore, it is not',
                 'responsible for the availability of such sites and accuracy of the calculations, The user can go directly to the data sources when required and use the',
                 'website in accordance with the appropriate terms of use, WaterProof does not guarantee and therefore not responsible for the legality, accurary,',
                 'completeness, timeliness of the data, as well as the handling that user gives to the information generated.']
    add_paragraph(paragraph, 4, pdf);

    epw = pdf.w - 2 * pdf.l_margin
    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(250, 250, 250)
    pdf.set_fill_color(0, 138, 173)
    pdf.set_draw_color(0, 138, 173)

    studyCaseName = "-"
    # Obtener datos del selector de casos de estudio directamente
    data = views_helpers.get_selector_study_cases_id(study_case_id)
    
    studyCaseName = data[0]['studyCasesName']

    # Obtener datos de intakes de casos de estudio directamente
    #data = views_helpers.get_study_cases_intake(study_case_id)
    demResolution = watershed.demvalue

    currencyCase = "-"
    timeCase = "-"

    # Obtener análisis de beneficios B directamente
    data = views_helpers.get_report_analisys_benefics_b(study_case_id)
    for item in data:
        currencyCase = item.get('currency', '-')
        timeCase = item.get('time', '-')
        changeInVolumeOfWater = str(round(float(item['changeInVolumeOfWater']), 2))
        changeInBaseFlow = str(round(float(item['changeInBaseFlow']), 2))
        changeIntotalSediments = str(round(float(item['changeIntotalSediments']), 2))
        changeInNitrogenLoad = str(round(float(item['changeInNitrogenLoad']), 2))
        changeInPhosphorus = str(round(float(item['changeInPhosphorus']), 2))
        changeInCarbonStorage = str(round(float(item['changeInCarbonStorage']), 2))
        # print(changeInVolumeOfWater,changeInBaseFlow,changeIntotalSediments,changeInNitrogenLoad,changeInPhosphorus,changeInCarbonStorage)

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
    pdf.cell(epw/2, 5, "Currency:   " + currencyCase)
    pdf.ln(5)
    pdf.cell(epw/2, 5, "Country:   " + country)
    pdf.cell(epw/2, 5, "DEM Resolution:   " + str(demResolution) + "m")
    pdf.ln(5)
    pdf.cell(epw/2, 5, "Region:  %s " % region)
    pdf.cell(epw/2, 5, "Discount rate (%):   " + discount_rate)
    pdf.ln(5)
    pdf.cell(epw/2, 5, "Time frame (years):   " + str(timeCase))
        
    pdf.ln(104)
    pdf.set_font('Arial', '', 13)
    pdf.set_text_color(57, 137, 169)
    pdf.cell(0, 10, 'Watershed description', align='L')   
        
    pdf.ln(8)
    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(255, 255, 255)
    pdf.set_fill_color(0, 138, 173)
    pdf.set_draw_color(0, 138, 173)

    pdf.cell(epw/2, 8, "Watershed", border=1, align='C', fill=1)        
    pdf.cell(epw/2, 8, "Value", border=1, align='C', fill=1)        
    pdf.set_text_color(100, 100, 100)
    pdf.set_fill_color(255, 255, 255)

    # Obtener características de CS Intake para PDF directamente
    #data = views_helpers.get_caracteristics_cs_intake_pdf(study_case_id)
    
    pdf.ln(6)
        
    pdf.set_text_color(100, 100, 100)
    pdf.cell(epw/2, 6, "Name", border=1, align='L', fill=1)        
    pdf.cell(epw/2, 6, watershed.name , border=1, align='L', fill=1)
    pdf.ln(6)
    pdf.cell(epw/2, 6, "Description", border=1, align='L', fill=1)
    pdf.cell(epw/2, 6, watershed.description , border=1, align='L', fill=1)
    pdf.ln(6)
    pdf.cell(epw/2, 6, "DEM", border=1, align='L', fill=1 )
    pdf.cell(epw/2, 6, str(demResolution) , border=1, align='L', fill=1)                
    pdf.ln(10)

    return pdf,'0','0','0','0','0','0' #,changeInVolumeOfWater,changeInBaseFlow,changeIntotalSediments,changeInNitrogenLoad,changeInPhosphorus,changeInCarbonStorage

def pdf_page_2(pdf, study_case_id, epw):

    # PAGE 2 - Actividades de conservación basadas en la naturaleza
    pdf.add_page()
    pdf.set_font('Arial', '', 13)
    pdf.set_text_color(57, 137, 169)
    pdf.cell(0, 10, 'Nature based Solutions conservation activities', align='L')    
    pdf.ln(10)

    # Obtener y renderizar datos de actividades de conservación
    nbs_sc_list = StudyCases_NBS_Fastflood.objects.filter(studycase=study_case_id)    
    
    nbs_conservation_activities = []
    
    for nbs_sc in nbs_sc_list:
        nbs = nbs_sc.nbs                
        selected_transformations = nbs.rios_transformations.filter()                
        nbs_activities = []        

        for transformation in selected_transformations:
            activity = transformation.activity
            params_lulc = WaterproofPrLulc.objects.filter(nbsid=nbs.id, lucode=activity.lucode).first()
            if params_lulc:
                nbs_activity = {}
                nbs_activity["name"] = activity.name + " - " + transformation.name
                nbs_activity["n_manning"] = params_lulc.manning
                nbs_activity["infiltration"] = params_lulc.infiltration
                nbs_activities.append(nbs_activity)                
            
        nbs_conservation_activity = {"name": nbs.name, 
                                    "benefit_percentaje": nbs.max_benefit_req_time,
                                    "benefit": nbs.profit_pct_time_inter_assoc,
                                    "implementation_cost": nbs.unit_implementation_cost,
                                    "maintenance_cost": nbs.unit_maintenance_cost,
                                    "periodicity": nbs.periodicity_maitenance,
                                    "opportunity_cost": nbs.unit_oportunity_cost,
                                    "activities": nbs_activities}
        #print(nbs_conservation_activity)
        nbs_conservation_activities.append(nbs_conservation_activity)
    

    #conservation_data = views_helpers.get_conservation_activities_data(study_case_id)
    views_helpers.render_conservation_activities_table(pdf, epw, nbs_conservation_activities)

    # Parámetros financieros
    financial_data_raw = views_helpers.get_financial_analysis_data(study_case_id)
    financial_data = views_helpers.extract_financial_data(financial_data_raw)           
    
    portfolio_data = views_helpers.get_portfolio_objectives_data(study_case_id)
    views_helpers.render_financial_parameters_page(pdf, epw, financial_data, portfolio_data)

def pdf_page_3(study_case_id, epw, pdf):
    pdf.add_page()
    pdf.set_text_color(57, 137, 169)
    pdf.set_font('Arial', '', 13)
    pdf.set_text_color(57, 137, 169)
    pdf.cell(0, 10, 'Comparative graph of costs and benefits for the analysis period', align='L')            
    pdf.ln(17)

    # Obtener datos de análisis de costos ROI directamente
    data = views_helpers.get_report_costs_analysis_roi(study_case_id)

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

    x = np.arange(len(categories))  # the label locations
    xnew = np.linspace(x.min(), x.max(), 200)
    spl = make_interp_spline(x, totalBenefits, k=3)
    y_smooth_total_benefits = spl(xnew)

    spl = make_interp_spline(x, totalDiscountedBenefits, k=3)
    y_smooth_total_discounted_benefits = spl(xnew)

    width_bar_default = 0.3  # the width of the bars
    fig, ax = plt.subplots()
    fig.set_figwidth(10)
    ax.bar(x - width_bar_default/2, totalCost, width_bar_default, label='Total cost', color='#004B56')
    ax.bar(x + width_bar_default/2, totalDiscountedCost, width_bar_default, label='Total discounted cost', color='#90D3E7')
    ax.set_ylabel('Value',fontsize=9)
    ax.set_title('Cost and benefits chart',fontsize=10)
    ax.set_xticks(x, categories,fontsize=9)
    ax.yaxis.set_major_formatter(currency)
    ax.plot(x,totalBenefits,'o', color='#004B56')
    ax.plot(xnew , y_smooth_total_benefits, '--', label='Total benefits', color='#004B56', linewidth=1.5)
    ax.plot(x, totalDiscountedBenefits,'o', color='#61D1C2')
    ax.plot(xnew ,y_smooth_total_discounted_benefits, '--', color='#61D1C2', label='Total discounted benefits')
    #'best', 'upper right', 'upper left', 'lower left', 'lower right', 'right', 'center left', 'center right', 'lower center', 'upper center', 'center'
    ax.legend(loc="upper left", bbox_to_anchor=[0, 1],ncol=5,fontsize=9)
    fig.tight_layout()

    fig.savefig('imgpdf/igocab.png', transparent=False, dpi=80, bbox_inches="tight")        
    pdf.image('imgpdf/igocab.png', 10, 20, w=190, h=90, type='png') # 20, 140, w=160, h=90

    pdf.ln(85)
    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 10, 'This chart has been built with the data from the following table:', align='L')
    pdf.ln(10)
    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(255, 255, 255)
    pdf.set_fill_color(0, 138, 173)
    pdf.set_draw_color(0, 138, 173)
    pdf.cell(epw/7, 8, 'Time period', border=1, align='C', fill=1)
    pdf.cell(epw/4.66, 8, 'Total cost', border=1, align='C', fill=1)
    pdf.cell(epw/4.66, 8, 'Total discounted cost', border=1, align='C', fill=1)
    pdf.cell(epw/4.66, 8, 'Total benefits', border=1, align='C', fill=1)
    pdf.cell(epw/4.66, 8, 'Total disc benefits', border=1, align='C', fill=1)
    pdf.ln(8)
    pdf.set_font('Arial', '', 9)
    pdf.set_text_color(100, 100, 100)
    pdf.set_fill_color(255, 255, 255)

    contTitle = 1
    for item in data:
        pdf.cell(epw/7, 4, str(contTitle), border=1, align='R', fill=1)
        pdf.cell(epw/4.66, 4, format(float(item['totalCost']), '0,.2f'), border=1, align='R', fill=1)
        pdf.cell(epw/4.66, 4, format(float(item['totalDiscountedCost']), '0,.2f'), border=1, align='R', fill=1)
        pdf.cell(epw/4.66, 4, format(float(item['totalBenefits']), '0,.2f'), border=1, align='R', fill=1)
        pdf.cell(epw/4.66, 4, format(float(item['totalDiscountedBenefits']), '0,.2f'), border=1, align='R', fill=1)
        contTitle = contTitle + 1
        pdf.ln(4)

def pdf_page_4(study_case_id, epw, pdf):

    # PAGE (4) - Comparative chart of costs
    pdf.add_page()
    pdf.ln(10)
    pdf.set_font('Arial', '', 13)
    pdf.set_text_color(57, 137, 169)
    pdf.cell(0, 10, 'Comparative chart of costs and benefits', align='L')        
    pdf.set_text_color(100, 100, 100)
    pdf.ln(10)
    pdf.set_font('Arial', '', 9)

    pdf.multi_cell(0, 6, 'This graph allows you to compare your investment in the implementation and maintenance of the selected NbS, with respect, to the economic benefits which are obtained from the savings in the maintenance of the watershed system and case study infrastructure' )

    pdf.ln(60)

    # Obtener datos de costos y beneficios directamente
    data = views_helpers.get_cost_and_benefit(study_case_id)

    dataCost = []
    dataBenefit = []
    itemCostr = 0
    itemBenefift = 0

    for item in data:
        dataCost.append(item['costr'])
        itemCostr = item['costr']
        dataBenefit.append(item['benefift'])
        itemBenefift = item['benefift']
    
    cost_and_benefits = dataCost + dataBenefit 
    categories = ['Cost', 'Benefits']
    fig, ax = plt.subplots()
    ax.set_ylabel('Values',fontsize=9)
    ax.set_title('Cost and Benefits',fontsize=10)
    ax.bar(categories, cost_and_benefits, color=['#008BAB', '#90D3E7'])
    ax.yaxis.set_major_formatter(currency)
    ax.legend(loc="upper left", bbox_to_anchor=[0, 1],ncol=5,fontsize=9)
    fig.tight_layout()
    fig.savefig('imgpdf/cab.png', transparent=False, dpi=80, bbox_inches="tight")
    pdf.image('imgpdf/cab.png', 60, 43, w=90, h=58, type='png')

    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 10, 'This chart has been built with the data from the following table:', align='L')
    pdf.set_font('Arial', '', 10)
    pdf.ln(8)
    pdf.set_fill_color(255, 255, 255)
    pdf.cell(epw/4, 6, '', border=0, align='C', fill=0)
    pdf.cell(epw/4, 6, 'Cost', border=1, align='L', fill=1)
    pdf.cell(epw/4, 6, format(float(itemCostr), '0,.2f'), border=1, align='R', fill=1)
    pdf.cell(epw/4, 6, '', border=0, align='C', fill=0)
    pdf.ln(6)
    pdf.cell(epw/4, 6, '', border=0, align='C', fill=0)
    pdf.cell(epw/4, 6, 'Benefits', border=1, align='L', fill=1)
    pdf.cell(epw/4, 6, format(float(itemBenefift), '0,.2f'), border=1, align='R', fill=1)
    pdf.cell(epw/4, 6, '', border=0, align='C', fill=0)

    # Obtener datos de valor presente neto directamente
    data = views_helpers.get_net_present_value_summary(study_case_id)
    
    typeMoney = ''
    valimplementationr = ""
    valmaintenancer = ""
    valoportunityr = ""
    valtransactionr = ""
    valplatformr = ""
    valbenefitr = ""
    valtotalr = ""

    data_npv = {}

    for item in data:
        typeMoney = item['currencyr']
        valimplementationr = round(item['implementationr'], 2)
        valmaintenancer = round(item['maintenancer'], 2)
        valoportunityr = round(item['oportunityr'], 2)
        valtransactionr = round(item['transactionr'], 2)
        valplatformr = round(item['platformr'], 2)
        valbenefitr = round(item['benefitr'], 2)
        valtotalr = round(item['totalr'], 2)

        data_npv = {
            'Implementation': valimplementationr,
            'Maintance': valmaintenancer,
            'Oportunity': valoportunityr,
            'Transaction': valtransactionr,
            'Platform': valplatformr,
            'Benefit': valbenefitr,
            'Total': valtotalr
        }    
    
    pdf.ln(5)
    pdf.set_font('Arial', '', 13)
    pdf.set_text_color(57, 137, 169)
    pdf.cell(0, 10, 'Net present value', align='L')    
    pdf.ln(9)
    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(100, 100, 100)
    pdf.multi_cell(0, 6, 'In this graph you can see: i) each type of cost NPV, iiComparative chart of costs and benefits:) benefits NPV and iii) total NPV which is the difference between costs and benefits.', align='L')
    #pdf.ln(6)
    #pdf.cell(0, 6, 'difference between costs and benefits.', align='L')
    pdf.ln(10)
    
    group_data = list(data_npv.values())
    group_names = list(data_npv.keys())    
    fig, ax = plt.subplots()
    ax.set_facecolor("white")
    ax.bar(group_names, group_data, color='#008BAB')
    labels = ax.get_xticklabels()
    plt.setp(labels, rotation=45, horizontalalignment='right',fontsize=11)
    ax.set(xlabel='NPV (' + typeMoney + ')', title='Net Present Value')
    ax.yaxis.set_major_formatter(currency)
    for label in ax.yaxis.get_ticklabels():
        label.set_fontsize(11)

    fig.savefig('imgpdf/npvs.png', transparent=False, dpi=80, bbox_inches="tight")
    pdf.image('imgpdf/npvs.png', 50, 140, w=100, h=78, type='png')

    pdf.ln(63)
    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 10, 'This chart has been built with the data from the following table:', align='L')
    pdf.ln(8)
    pdf.set_font('Arial', '', 11)
    pdf.set_text_color(255, 255, 255)
    pdf.set_fill_color(0, 138, 173)
    pdf.set_draw_color(0, 138, 173)
    pdf.cell(epw, 7, 'Net present value summary', border=1, align='C', fill=1)
    pdf.ln(7)
    pdf.set_font('Arial', '', 9)
    pdf.set_text_color(100, 100, 100)
    pdf.set_fill_color(255, 255, 255)
    pdf.cell((epw/6) * 5, 6, 'Implementation cost: cost requires to implement the activities including materials, supplies and labor', border=1, align='L', fill=1)
    pdf.cell(epw/6, 6, format(float(valimplementationr), '0,.2f'), border=1, align='R', fill=1)
    pdf.ln(6)
    pdf.cell((epw/6) * 5, 6, 'Maintance cost: cost to maintain NbS', border=1, align='L', fill=1)
    pdf.cell(epw/6, 6, format(float(valmaintenancer), '0,.2f'), border=1, align='R', fill=1)
    pdf.ln(6)
    pdf.cell((epw/6) * 5, 6, 'Oportunity cost: foregone benefits that would have been derived from and option another than NbS', border=1, align='L', fill=1)
    pdf.cell(epw/6, 6, format(float(valoportunityr), '0,.2f'), border=1, align='R', fill=1)
    pdf.ln(6)
    pdf.cell((epw/6) * 5, 6, 'Transaction cost: refers to administrative expenses', border=1, align='L', fill=1)
    pdf.cell(epw/6, 6, format(float(valtransactionr), '0,.2f'), border=1, align='R', fill=1)
    pdf.ln(6)
    pdf.cell((epw/6) * 5, 10, '', border=1, align='L', fill=1)
    pdf.ln(0)
    pdf.cell((epw/6) * 5, 6, 'Platform cost: these are fored expenses for the conservation program, which include staff, office,', border=0, align='L', fill=0)
    pdf.cell(epw/6, 10, format(float(valplatformr), '0,.2f'), border=1, align='R', fill=1)
    pdf.ln(6)
    pdf.cell((epw/6) * 5, 3.3, 'equipment, vehicles, among others.', border=0, align='L', fill=0)
    pdf.ln(4)
    pdf.cell((epw/6) * 5, 6, 'Benefit', border=1, align='L', fill=1)
    pdf.cell(epw/6, 6, format(float(valbenefitr), '0,.2f'), border=1, align='R', fill=1)
    pdf.ln(6)
    pdf.set_font('Arial', 'B', 9)
    pdf.cell((epw/6) * 5, 6, 'Total', border=1, align='L', fill=1)
    pdf.cell(epw/6, 6, format(float(valtotalr), '0,.2f'), border=1, align='R', fill=1)

def pdf_page_5(study_case_id, epw, pdf):

    pdf.add_page()
    pdf.set_font('Arial', '', 13)
    pdf.set_text_color(57, 137, 169)
    pdf.cell(0, 10, 'Sensitivity analysis', align='L')    
    pdf.ln(10)
    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(100, 100, 100)
    pdf.multi_cell(0, 6, 'Next, a simple sensibility analysis is presented through the variation of the discount rate under the defined lower and upper limits. Remember that the discount rate is the cost of capital that is applied to determine the present value of a future payment.', align='L')
    
    pdf.ln(10)    

    # Obtener datos de análisis de sensibilidad de beneficios directamente
    data = views_helpers.get_sensibility_analysis_benefits(study_case_id)

    total_discount_benefits = []
    total_discount_benefits_range = []

    for item in data:
        total_discount_benefits.append([item['timer'], float(item['totalMedBenefitR'])])
        total_discount_benefits_range.append([item['timer'], float(item['totalMinBenefitR']), float(item['totalMaxBenefittR'])])
    
    data_line = np.array(total_discount_benefits)
    data_range = np.array(total_discount_benefits_range)
    min_range = data_range[:,1]
    max_range = data_range[:,2]
    labels = data_line[:,0].astype(int)
    line1 = data_line[:,1]

    x = np.arange(len(labels))  # the label locations
    xnew = np.linspace(x.min(), x.max(), 200)
    spl = make_interp_spline(x, line1, k=3)
    y_smooth_total_benefits = spl(xnew)

    fig, ax = plt.subplots()
    fig.set_figwidth(10)
    ax.set_ylabel('Total discounted benefits',fontsize=9)
    ax.set_xlabel('Time in years discounted benefits',fontsize=9)
    ax.set_title('Sensibility analysis - Total discounted benefits (TDB)',fontsize=10)
    ax.set_xticks(x, labels,fontsize=9)
    ax.yaxis.set_major_formatter(currency)
    ax.plot(x,line1,'o', color='#4c99d8')
    ax.plot(xnew ,y_smooth_total_benefits, label='Discounted Benefits', color='#008BAB', linewidth=1.5)
    ax.fill_between(x, min_range, max_range, facecolor='C0', alpha=0.1)
    
    fig.tight_layout()
    fig.savefig('imgpdf/satdb.png', transparent=False, dpi=80, bbox_inches="tight")
    pdf.image('imgpdf/satdb.png', 10, 38, w=180, h=80, type='png')
    
    pdf.ln(75)
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
    #num_rows_total_discounted = 1
    for item in data:
        pdf.cell(epw/4, 4, format(item['timer']), border=1, align='R', fill=1)
        pdf.cell(epw/4, 4, format(float(item['totalMinBenefitR']), '0,.2f'), border=1, align='R', fill=1)
        pdf.cell(epw/4, 4, format(float(item['totalMedBenefitR']), '0,.2f'), border=1, align='R', fill=1)
        pdf.cell(epw/4, 4, format(float(item['totalMaxBenefittR']), '0,.2f'), border=1, align='R', fill=1)
        pdf.ln(4)
        #num_rows_total_discounted += 1

def pdf_page_6(study_case_id, epw, pdf):
    
    pdf.add_page()      
    # Obtener datos de análisis de sensibilidad de costos directamente
    data = views_helpers.get_sensibility_analysis_cost(study_case_id)

    dataSensibilityAnalysisCostTime = []
    dataSensibilityAnalysisCostRange = []

    for item in data:
        dataSensibilityAnalysisCostTime.append([item['timer'], float(item['totalMedCostR'])])
        dataSensibilityAnalysisCostRange.append(
            [item['timer'], float(item['totalMinCostR']), float(item['totalMaxCostR'])])
    
    data_line = np.array(dataSensibilityAnalysisCostTime)
    data_range = np.array(dataSensibilityAnalysisCostRange)
    min_range = data_range[:,1]
    max_range = data_range[:,2]
    labels = data_line[:,0].astype(int)
    labels.astype(int)
    line1 = data_line[:,1]

    x = np.arange(len(labels))  # the label locations
    xnew = np.linspace(x.min(), x.max(), 200)
    spl = make_interp_spline(x, line1, k=3)
    y_smooth_total_benefits = spl(xnew)

    width_bar_default = 0.3  # the width of the bars
    fig, ax = plt.subplots()
    fig.set_figwidth(10)
    ax.set_ylabel('Total discounted cost',fontsize=9)
    ax.set_xlabel('Time in years discounted cost',fontsize=9)
    ax.set_title('Sensibility analysis - total discounted cost (TDC)',fontsize=10)
    ax.set_xticks(x, labels,fontsize=9)
    ax.yaxis.set_major_formatter(currency)
    ax.plot(x,line1,'o', color='#4c99d8')
    ax.plot(xnew ,y_smooth_total_benefits, label='Discounted Benefits', color='#008BAB', linewidth=1.5)
    ax.fill_between(x, min_range, max_range, facecolor='C0', alpha=0.1)
    #'best', 'upper right', 'upper left', 'lower left', 'lower right', 'right', 'center left', 'center right', 'lower center', 'upper center', 'center'
    fig.tight_layout()
    fig.savefig('imgpdf/satdc.png', transparent=False, dpi=80, bbox_inches="tight")

    img_y = 15
    img_x = 10
    
    pdf.image('imgpdf/satdc.png', img_x, img_y, w=180, h=0, type='PNG')

    pdf.ln(100)
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

def pdf_page_7(study_case_id, epw, peakDischargeTr10, peakDischargeTr100, floodedArea, changeInCarbonStorage, pdf):

    pdf.add_page()

    pdf.set_font('Arial', '', 9)
    pdf.set_fill_color(231, 244, 244)
    pdf.cell(epw, 90, '', border=1, align='C', fill=1)
    pdf.ln(7)

    # Margen izquierdo para los textos
    left_margin = epw/6
    text_width = epw - left_margin - 5
    icon_width = 10
    icon_x = 20

    # Bloque 1: Peak Discharge TR 10
    y_start_1 = pdf.get_y()
    pdf.set_font('Arial', 'B', 9)
    pdf.set_text_color(57, 137, 169)
    pdf.set_x(pdf.get_x() + left_margin)
    pdf.cell(text_width, 4, 'Peak Discharge TR 10', border=0, align='L')
    pdf.ln(4)

    pdf.set_font('Arial', '', 8)
    pdf.set_text_color(100, 100, 100)
    pdf.set_x(pdf.get_x() + left_margin)
    pdf.multi_cell(text_width, 4,
        'This value represents the percentage reduction of the peak discharge during a 10-year return period event. It is important because it shows how NbS can reduce the intensity of more frequent floods, helping to protect infrastructure, crops, and communities from moderate flood events.',
        border=0, align='L')
    y_end_1 = pdf.get_y()
    y_center_1 = y_start_1 + (y_end_1 - y_start_1) / 2 - icon_width / 2
    pdf.image('imgpdf/01-agua.png', icon_x, y_center_1, w=icon_width)
    pdf.ln(4)

    # Bloque 2: Peak Discharge TR 100
    y_start_2 = pdf.get_y()
    pdf.set_font('Arial', 'B', 9)
    pdf.set_text_color(57, 137, 169)
    pdf.set_x(pdf.get_x() + left_margin)
    pdf.cell(text_width, 4, 'Peak Discharge TR 100', border=0, align='L')
    pdf.ln(4)

    pdf.set_font('Arial', '', 8)
    pdf.set_text_color(100, 100, 100)
    pdf.set_x(pdf.get_x() + left_margin)
    pdf.multi_cell(text_width, 4,
        'This indicates the reduction of peak discharge for an extreme 100-year event. While NbS may have a smaller effect on rare, very intense events, this indicator allows you to assess how natural measures contribute to limiting the impacts of the most severe floods.',
        border=0, align='L')
    y_end_2 = pdf.get_y()
    y_center_2 = y_start_2 + (y_end_2 - y_start_2) / 2 - icon_width / 2
    pdf.image('imgpdf/02-agua.png', icon_x, y_center_2, w=icon_width)
    pdf.ln(4)

    # Bloque 3: Flooded Area
    y_start_3 = pdf.get_y()
    pdf.set_font('Arial', 'B', 9)
    pdf.set_text_color(57, 137, 169)
    pdf.set_x(pdf.get_x() + left_margin)
    pdf.cell(text_width, 4, 'Flooded Area', border=0, align='L')
    pdf.ln(4)

    pdf.set_font('Arial', '', 8)
    pdf.set_text_color(100, 100, 100)
    pdf.set_x(pdf.get_x() + left_margin)
    pdf.multi_cell(text_width, 4,
        "This shows the percentage reduction of the flooded area due to NbS. This result allows users to directly visualize the benefits of interventions in terms of protected land, helping to prioritize critical zones and plan more efficient mitigation strategies.",
        border=0, align='L')
    y_end_3 = pdf.get_y()
    y_center_3 = y_start_3 + (y_end_3 - y_start_3) / 2 - icon_width / 2
    pdf.image('imgpdf/03-agua.png', icon_x, y_center_3, w=icon_width)
    pdf.ln(4)

    # Bloque 4: Carbon storage and sequestration
    y_start_4 = pdf.get_y()
    pdf.set_font('Arial', 'B', 9)
    pdf.set_text_color(57, 137, 169)
    pdf.set_x(pdf.get_x() + left_margin)
    pdf.cell(text_width, 4, 'Carbon storage and sequestration', border=0, align='L')
    pdf.ln(4)

    pdf.set_font('Arial', '', 8)
    pdf.set_text_color(100, 100, 100)
    pdf.set_x(pdf.get_x() + left_margin)
    pdf.multi_cell(text_width, 4,
        "This reflects the increase in the watershed's capacity to store carbon, an additional environmental benefit of NbS. It demonstrates that implementing natural solutions not only reduces flooding but also contributes to climate resilience and ecosystem strengthening.",
        border=0, align='L')
    y_end_4 = pdf.get_y()
    y_center_4 = y_start_4 + (y_end_4 - y_start_4) / 2 - icon_width / 2
    pdf.image('imgpdf/dashboard-06.png', icon_x, y_center_4, w=icon_width)
    pdf.ln(10)

    # Sección: Estimated change in ecosystem services
    pdf.set_text_color(57, 137, 169)
    pdf.set_fill_color(255, 255, 255)
    pdf.set_draw_color(255, 255, 255)
    pdf.set_font('Arial', '', 11)
    pdf.cell(epw, 10, 'Estimated change in ecosystem services', align='L')
    pdf.ln(5)
    pdf.cell(epw, 10, '(Business as Usual Scenario Vs Nature based Solutions Scenario)', align='L')
    pdf.ln(15)

    # Títulos de las 4 columnas
    pdf.set_font('Arial', '', 9)
    pdf.set_text_color(100, 100, 100)
    column_width = epw / 4
    pdf.cell(column_width, 4, 'Peak Discharge TR 10', align='C')
    pdf.cell(column_width, 4, 'Peak Discharge TR 100', align='C')
    pdf.cell(column_width, 4, 'Flooded Area', align='C')
    pdf.cell(column_width, 4, 'Carbon storage and sequestration ', align='C')
    pdf.ln(4)

    # Imágenes de iconos - posicionadas de manera relativa
    icon_size = 24
    y_icons = pdf.get_y() + 5
    icon_spacing = column_width
    pdf.image('imgpdf/01-agua.png', pdf.l_margin + (column_width - icon_size) / 2, y_icons, w=icon_size)
    pdf.image('imgpdf/02-agua.png', pdf.l_margin + icon_spacing + (column_width - icon_size) / 2, y_icons, w=icon_size)
    pdf.image('imgpdf/03-agua.png', pdf.l_margin + icon_spacing * 2 + (column_width - icon_size) / 2, y_icons, w=icon_size)
    pdf.image('imgpdf/dashboard-06.png', pdf.l_margin + icon_spacing * 3 + (column_width - icon_size) / 2, y_icons, w=icon_size)

    # Espacio para las imágenes y valores
    pdf.ln(icon_size + 7)

    # Valores numéricos grandes
    pdf.set_font('Arial', '', 20)
    pdf.cell(column_width, 4, peakDischargeTr10, align='C')
    pdf.cell(column_width, 4, peakDischargeTr100, align='C')
    pdf.cell(column_width, 4, floodedArea, align='C')
    pdf.cell(column_width, 4, changeInCarbonStorage, align='C')

    pdf.ln(15)
    pdf.set_font('Arial', '', 13)
    pdf.set_text_color(57, 137, 169)
    pdf.cell(epw, 10, 'General Aqueduct indicators', align='L')

    # Obtener datos de casos de estudio y análisis de beneficios directamente
    dataCase = views_helpers.get_selector_study_cases_id(study_case_id)
    dataBenefit = views_helpers.get_report_analisys_benefics(study_case_id)
    add_page_for_study_case = False

    for itemCase in dataCase:
        if add_page_for_study_case:
            pdf.add_page()

        pdf.set_font('Arial', '', 9)
        pdf.set_text_color(100, 100, 100)
        pdf.cell(epw, 10, itemCase['selector'], border=0, align='C', fill=0)
        pdf.ln(10)

        # Posicionar 4 imágenes horizontalmente de manera relativa
        picture_width = 45
        picture_spacing = 3
        y_pictures = pdf.get_y()
        x_picture_1 = pdf.l_margin
        x_picture_2 = pdf.l_margin + picture_width + picture_spacing
        x_picture_3 = pdf.l_margin + (picture_width + picture_spacing) * 2
        x_picture_4 = pdf.l_margin + (picture_width + picture_spacing) * 3

        pdf.image('imgpdf/picture-one.jpg', x_picture_1, y_pictures, w=picture_width)
        pdf.image('imgpdf/picture-two.jpg', x_picture_2, y_pictures, w=picture_width)
        pdf.image('imgpdf/picture-three.jpg', x_picture_3, y_pictures, w=picture_width)
        pdf.image('imgpdf/picture-four.jpg', x_picture_4, y_pictures, w=picture_width)

        pdf.ln(30)

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
            if itemBenefit['watershedId'] == itemCase['watershedId']:
                txtColorR,txtColorG,txtColorB = 175,9,0                

                if itemBenefit['color'].upper() == "DARK GREEN":
                    txtColorR,txtColorG,txtColorB = 21,88,22                    

                if itemBenefit['color'].upper() == "ORANGE":
                    txtColorR,txtColorG,txtColorB = 236,104,10                    

                if itemBenefit['nameIndicator'].upper() == "PHYSICAL RISK QUANTITY":
                    txtTd1 = itemBenefit['description']
                    txtTd1CR,txtTd1CG,txtTd1CB = txtColorR,txtColorG,txtColorB

                if itemBenefit['nameIndicator'].upper() == "PHYSICAL RISK ASSOCIATED WITH AMOUNT OF WATER":
                    txtTd2 = itemBenefit['description']
                    txtTd2CR,txtTd2CG,txtTd2CB = txtColorR,txtColorG,txtColorB

                if itemBenefit['nameIndicator'].upper() == "REGULATORY AND REPUTATIONAL":
                    txtTd3 = itemBenefit['description']
                    txtTd3CR,txtTd3CG,txtTd3CB = txtColorR,txtColorG,txtColorB

                if itemBenefit['nameIndicator'].upper() == "OVERALL WATER RISK SCORE":
                    txtTd4 = itemBenefit['description']
                    txtTd4CR,txtTd4CG,txtTd4CB = txtColorR,txtColorG,txtColorB                    

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

def pdf_page_8(study_case_id, epw, pdf):

    pdf.add_page() 

    # Obtener indicadores de resultados de oportunidad directamente
    data = views_helpers.get_report_oportunity_result_indicators(study_case_id)
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
                backgroundColorR,backgroundColorG,backgroundColorB = 21,88,22
                
            else:
                if nameButtom[1] == "Light Green":
                    backgroundColorR,backgroundColorG,backgroundColorB = 53,177,55                    
                else:
                    backgroundColorR,backgroundColorG,backgroundColorB = 175,9,0
                    
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
    pdf.cell(epw, 10, 'Return on Investment Calculation', align='L')
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

    # Obtener análisis de beneficios C directamente
    data = views_helpers.get_report_analisys_benefics_c(study_case_id)

    pdf.set_font('Arial', '', 13)
    pdf.set_text_color(57, 137, 169)
    pdf.ln(10)
    pdf.cell(epw, 10, 'Intervention and budget summary', align='L')
    pdf.ln(5)
    pdf.set_text_color(100, 100, 100)

    lastTitle = ""
    for item in data:
        if lastTitle != item['watershedId']:
            pdf.set_font('Arial', '', 10)
            pdf.ln(10)
            pdf.cell(epw, 6, str(item['name']), align='C')
            pdf.ln(6)
            pdf.set_text_color(255, 255, 255)
            pdf.set_fill_color(0, 138, 173)
            pdf.set_draw_color(0, 138, 173)
            pdf.cell((epw/5)*3, 8, 'Nature based Solution', border=1, align='C', fill=1)
            pdf.cell(epw/5, 8, 'Actual spend', border=1, align='C', fill=1)
            pdf.cell(epw/5, 8, 'Area converted (Ha)', border=1, align='C', fill=1)
            pdf.ln(8)
            pdf.set_text_color(100, 100, 100)
            pdf.set_fill_color(255, 255, 255)
            pdf.set_draw_color(0, 138, 173)
            lastTitle = item['watershedId']

        pdf.cell((epw/5)*3, 10, "", border=1, align='L', fill=1)
        pdf.cell(epw/5, 10, "", border=1, align='R', fill=1)
        pdf.cell(epw/5, 10, "", border=1, align='R', fill=1)
        pdf.ln(0)
        pdf.cell((epw/5)*3, 5, str(item['sbnf'])[0:70], align='L')
        pdf.cell(epw/5, 5, format(float(item['costPerHectarea']), '0,.2f'), align='R')
        pdf.cell(epw/5, 5, format(float(item['recomendedIntervetion']), '0,.2f'), align='R')
        pdf.ln(5)
        pdf.cell((epw/5)*3, 5, str(item['sbnf'])[70:90], align='L')
        pdf.cell(epw/5, 5, "", align='R')
        pdf.cell(epw/3, 5, "", align='R')
        pdf.ln(4)

def pdf_page_9(study_case_id, epw, pdf):
    
    pdf.add_page() 

    pdf.set_font('Arial', '', 13)
    pdf.set_text_color(57, 137, 169)
    pdf.cell(0, 10, 'Decision indicators', align='L')
    
    pdf.ln(10)
    add_text_line('Total damage saves',0,10,'L',ARIAL,11,pdf)    
    pdf.ln(10)
    
    total_damage_saves_data = []
    # Obtener análisis de beneficios de Waterproof directamente
    data = views_helpers.get_flood_mitigation(study_case_id)
    lbls = []
    graphValues = []
    total_benefits=0    
    
    for item in data:                
        lbls.append(item['name'])
        graphValues.append(item['y'])
        total_benefits+=item['y']
        total_damage_saves_data.append({
            'name': item['name'],
            'y': item['y']
        })

    if len(total_damage_saves_data) > 0:
        createPie(graphValues, lbls, total_benefits, '', 'lower left', 'wrab', 10, 30, 60, colors, pdf)
        pdf.ln(17)
    else:
        pdf.ln(10)
        load_no_data_image('Total damage saves', 20, 32, 70, 70, pdf)        
        pdf.ln(5)

    pdf.set_font('Arial', '', 9)
    
    draw_graph_table(total_damage_saves_data, 0, epw, pdf)
    pdf.ln(32)

    add_text_line('Watershed Benefits ',0,10,'L',ARIAL,11,pdf)  
    pdf.ln(35)
    pdf.set_font('Arial', '', 10)
    
    ln_msg_graph = 30
    
    ln_msg_graph = draw_graph_table([{'name': 'Total benefits', 'y': total_benefits}],ln_msg_graph,epw,pdf)
    createPie([total_benefits], ["Total benefits"], total_benefits, '', 'lower left', 'wrabi', 10, 120, 60, colors, pdf)
    
    # Cost per activity
    cost_per_activity = []    
    # Obtener filtro de análisis de costos directamente
    data = views_helpers.get_report_costs_analysis_filter_nbs(study_case_id)
    lbls = []
    graphValues = []
    total_benefits=0
    for item in data:
        lbls.append(item['activity'])
        graphValues.append(item['totalCost'])
        total_benefits+=item['totalCost']
        cost_per_activity.append({
            'name': item['activity'],
            'y': item['totalCost']
        })

    pdf.ln(40)
    add_text_line('Cost per activity',0,7,'L',ARIAL,11,pdf)    
    pdf.ln(25)
    draw_graph_table_2(cost_per_activity, epw, pdf)

    createPie(graphValues, lbls, total_benefits, '', 'lower left', 'rcafh', 10, 200, 60, colors, pdf)
    
def pdf_page_10(url_api, study_case, watershed, polygon, region,epw, pdf):
    pdf.add_page()

    # Cost Analysis Graph
    add_text_line('Total costs',0,10,'L',ARIAL,11,pdf)
    pdf.ln(10)

    cost_analysis_data = []
    # Obtener análisis de costos agrupado directamente
    data = views_helpers.get_report_costs_analysis_filter_grouped(study_case.id)
    lbls = []
    graphValues = []
    total_cost = 0

    for item in data:
        lbls.append(item['typer'])
        graphValues.append(item['sumFilter'])
        total_cost += item['sumFilter']
        cost_analysis_data.append({
            'name': item['typer'],
            'y': item['sumFilter']
        })

    if len(cost_analysis_data) > 0:
        createPie(graphValues, lbls, total_cost, '', 'lower left', 'cost_analysis', 10, 20, 60, colors, pdf)
        pdf.ln(17)
    else:
        pdf.ln(10)
        load_no_data_image('Total costs', 20, 32, 70, 70, pdf)
        pdf.ln(5)

    pdf.set_font('Arial', '', 9)
    draw_graph_table_2(cost_analysis_data, epw, pdf)
    pdf.ln(42)

    # Línea separadora antes de Geographic resources
    pdf.set_draw_color(200, 200, 200)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(5)

    # Geographic resources section
    pdf.set_font('Arial', '', 13)
    pdf.set_text_color(57, 137, 169)
    pdf.cell(0, 10, 'Geographic resources', align='L')
    pdf.ln(10)
    add_text_line('The analysis run includes geographic outputs that you would query at the following link:',0,10,'L',ARIAL,11,pdf)
    heightIcon = 0

    # Obtener rutas de mapas para comparación directamente
    #data = views_helpers.get_wp_compare_mapas(study_case_id)

    # Separar el texto en dos partes: antes de "click here" y "click here"
    msg_geo_text_before = "The analysis generated a set of geographic outputs, including: projections in land use change ecosystem services, and spatial location of the implementation portfolio suggested by the RiOS model. To consult the maps "
    msg_geo_link_text = "click here."

    #for item in data:
    pdf.ln(20)

    cx, cy = polygon.geom.centroid.coords

    pdf.set_text_color(100, 100, 100)
    pdf.cell(epw, 10, watershed.name, border=0, align='L', fill=0)
    pdf.ln(10)

    # Configurar el link
    geo_url = url_api + "geographic/?folder="
    folder = study_case.folder_name
    year = study_case.time_implement
    geo_link = "%s%s&intake=%s&region=%s&year=%s&study_case_id=%s&center=%s,%s&name=%s" % (geo_url, folder, watershed.id , region, year, study_case.id, cx, cy, study_case.name)

    # Calcular dimensiones para la imagen y el texto
    img_width = 30
    img_x = 20
    text_x = img_x + img_width + 5  # 5 unidades de separación entre imagen y texto
    # Ajustar el ancho del texto: restar imagen, separación y margen derecho
    text_width = epw - (img_width + 5) - 15

    # Guardar posición Y inicial
    start_y = pdf.get_y()

    # Estimar altura del texto (aproximadamente 3-4 líneas para este texto)
    text_height = 20  # 4 líneas * 5 altura de línea

    # Calcular posición Y centrada para la imagen
    img_height = img_width * 0.8  # Aproximación de la proporción de la imagen
    img_y = start_y + (text_height - img_height) / 2

    # Colocar la imagen centrada verticalmente
    pdf.image('imgpdf/mapas-pdf.png', img_x, img_y, w=img_width)

    # Guardar márgenes originales
    original_left_margin = pdf.l_margin
    original_right_margin = pdf.r_margin

    # Establecer márgenes temporales para el texto
    pdf.set_left_margin(text_x)
    pdf.set_right_margin(210 - text_x - text_width)  # 210 es ancho A4

    # Posicionar el cursor para escribir el texto
    pdf.set_xy(text_x, start_y)
    pdf.set_text_color(100, 100, 100)
    pdf.set_font('Arial', '', 9)

    # Escribir la primera parte del texto sin link usando write
    pdf.write(5, msg_geo_text_before)

    # Cambiar a azul y negrita para "click here" con hipervínculo
    pdf.set_text_color(30, 30, 180)
    pdf.set_font('Arial', 'B', 9)
    pdf.write(5, msg_geo_link_text, geo_link)

    # Restaurar formato y márgenes
    pdf.set_font('Arial', '', 9)
    pdf.set_text_color(100, 100, 100)
    pdf.set_left_margin(original_left_margin)
    pdf.set_right_margin(original_right_margin)

    heightIcon = heightIcon + 50
    pdf.set_text_color(100,100,100)


def add_text_line(text,x,y,a,f,s,pdf):
    pdf.set_font(f, '', s)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(x, y, text, align=a)

def add_simple_text_line_2_pdf(x, y,text, ln, pdf):    
    pdf.cell(x, y, text)
    pdf.ln(ln)

def add_paragraph(paragraph, ln, pdf):
    for text in paragraph:
        pdf.cell(0, 0, text)
        pdf.ln(ln)
    

def draw_graph_table(data,ln_msg_graph,epw,pdf):
    pdf.set_font(ARIAL, '', 9)
    pdf.set_fill_color(255, 255, 255)
    for item in data:
        pdf.cell(epw/2, 6, '')
        pdf.cell((epw/6) * 2, 6, item['name'], border=1, align='L', fill=1)
        pdf.cell(epw/6, 6, format(float(item['y']), '0,.2f'), border=1, align='R', fill=1)
        pdf.ln(6)
        ln_msg_graph -= 6
    return ln_msg_graph

def draw_graph_table_2(data, epw, pdf):
    pdf.set_font(ARIAL, '', 9)
    pdf.set_fill_color(255, 255, 255)

    for item in data:
        words_name = item['name'].split(' ')
        pdf.cell(epw/2, 6, '')
        if len(words_name) > 4:
            pdf.cell((epw/6)*2, 10, "", border=1, fill=1)
            pdf.cell(epw/6, 10, "", border=1, fill=1)
            pdf.ln(0)
            pdf.cell((epw/6)*2, 5, "")
            pdf.cell(epw/6, 5, "")
            first_line = words_name[0] + ' ' + words_name[1] + ' ' + words_name[2] + ' ' + words_name[3]
            second_line = ''
            for i in range(4, len(words_name)):
                second_line += words_name[i] + ' '
            pdf.cell((epw/6) * 2, 5, first_line, align='L')
            pdf.cell(epw/6, 5, format(float(item['y']), '0,.2f'), align='R')
            pdf.ln(5)
            pdf.cell(epw/2, 5, '')
            pdf.cell((epw/5) * 2, 6, second_line, align='L',)
            pdf.cell(epw/5, 6, '', align='R')
        else:
            pdf.cell((epw/6) * 2, 6, item['name'], border=1, align='L', fill=1)
            pdf.cell(epw/6, 6, format(float(item['y']), '0,.2f'), border=1, align='R', fill=1)

        pdf.ln(5)
        

def currency(x, pos):
    """The two arguments are the value and tick position"""
    if abs(x) >= 1e6:
        s = '${:1.1f}M'.format(x*1e-6)
    else:
        s = '${:1.0f}K'.format(x*1e-3)
    return s

def createPie(values, lbls, total, title, loc_lgnd, img_name, img_x, img_y, img_w, colors, pdf):
    y=[]
    for i in values:
        y.append(i/total)
    fig, ax = plt.subplots(figsize=(5, 5))
    ax.set_title(title,fontsize=10)
    ax.pie(y, colors=colors)
    # Posicionar leyenda en la esquina inferior izquierda con bbox_to_anchor para evitar superposición
    ax.legend(lbls, loc='upper left', bbox_to_anchor=(0, 0), ncol=1, fontsize=11, frameon=False)
    ax.axis('equal')
    path_img = 'imgpdf/%s.png' % img_name
    fig.savefig(path_img, transparent=False, dpi=80, bbox_inches="tight")
    plt.close(fig)
    pdf.image(path_img, img_x, img_y, w=img_w)

def load_no_data_image(title, x, y, w, h, pdf):    
    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 7, title, align='L')
    pdf.image('imgpdf/nodatadef.png', x, y, w=w, h=h)
    pdf.ln(42)
    pdf.cell(0, h, '* there is no data for this graph', align='L')

