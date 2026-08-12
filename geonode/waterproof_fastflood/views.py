import datetime
from django.shortcuts import render
from django.conf import settings
from geonode.waterproof_fastflood.models import  Fastflood_investment_scenario, Polygon, StudyCase_damage_curve, StudyCase_depth_damage, StudyCases, StudyCases_Parameters_Bio, Watershed, MaxDamageCost
from geonode.waterproof_parameters.models import Cities, Countries, Regions
from geonode.waterproof_study_cases.models import Portfolio
from django.db.models import Q
from . import forms
from django.utils.translation import ugettext as _
from django.http import HttpResponse
from django.http import HttpResponse, HttpResponseRedirect
from django.http import JsonResponse
from django.contrib.gis.geos import GEOSGeometry
from django.urls import reverse
from django.db import connection

import logging
import simplejson as json
import os

logger = logging.getLogger(__name__)

resolutions = [
            {
                "resolution": 20,
                "map_size": "10048 x 8526px",
                "download_size": "209.1 mb",
            },
            {
                "resolution": 40,
                "map_size": "5024 x 4263px",
                "download_size": "56.7 mb",
            },
            {
                "resolution": 150,
                "map_size": "1256 x 1065px",
                "download_size": "4.5 mb",
            },
            {
                "resolution": 300,
                "map_size": "628 x 532px",
                "download_size": "1.8 mb"
            },
            {
                "resolution": 600,
                "map_size": "314 x 266px",
                "download_size": "0.6 mb"
            }
        ]

scenarios = Fastflood_investment_scenario.objects.all()

change_year =[
    2030, 2040, 2050, 2060, 2070, 2080, 2090, 2100
]

storm_durations = [3,4,5,6,8,10,12,18,24,48]

quantiles = ['N/A',15,50,85]

BASE_PATH_FASTFLOOD = '/app/outputs/fastflood'

def home(request):
    form = forms.WatershedForm()
    userCountry = Countries.objects.get(iso3=request.user.country)
    currencies = Countries.objects.values('pk', 'currency', 'name', 'iso3').distinct().exclude(currency='').order_by('currency')
        
    return render(request, 'fastflood-create-watershed.html', context={
        "form": form, 
        "serverApi": settings.WATERPROOF_API_SERVER,
        'currencies': currencies,
        'userCountry': userCountry})

    
def createWatershed(request):    
    logger.debug("Creating watershed")
    # POST submit FORM
    if request.method == 'POST':
        if request.POST.get('step') == '1':
            stepCreation = createStepOne(request)
            if stepCreation['status'] == True:
                context = {
                    'status': '200',
                    'watershedId': stepCreation['watershedId'],
                    'message': 'Success'
                }
                response = HttpResponse(json.dumps(context), content_type='application/json')
                response.status_code = 200
                return response
            else:
                errorMessage = _('Error saving watershed')
                context = {
                    'status': '400', 'message': str(errorMessage)
                }
                response = HttpResponse(json.dumps(context), content_type='application/json')
                response.status_code = 400
                return response
        elif request.POST.get('step') == '2':
            stepCreation = createStepTwo(request)
            logger.info(stepCreation)
            if stepCreation['status'] == True:
                context = {
                    'status': '200',
                    'watershedId': stepCreation['watershedId'],
                    'message': 'Success'
                }
                response = HttpResponse(json.dumps(context), content_type='application/json')
                response.status_code = 200
                return response
            else:
                errorMessage = _('Error saving watershed')
                context = {
                    'status': '400', 'message': str(errorMessage)
                }
                response = HttpResponse(json.dumps(context), content_type='application/json')
                response.status_code = 400
                return response
        elif request.POST.get('step') == '3':
            stepCreation = createStepThree(request)
            if stepCreation['status'] == True:
                context = {
                    'status': '200',
                    'watershedId': stepCreation['watershedId'],
                    'message': 'Success'
                }
                response = HttpResponse(json.dumps(context), content_type='application/json')
                response.status_code = 200
                return response
            else:
                errorMessage = _('Error saving intake')
                context = {
                    'status': '400', 'message': str(errorMessage)
                }
                response = HttpResponse(json.dumps(context), content_type='application/json')
                response.status_code = 400
                return response


    else:
        form = forms.WatershedForm()        
        userCountry = Countries.objects.get(iso3=request.user.country)
        currencies = Countries.objects.values('pk', 'currency', 'name', 'iso3').distinct().exclude(currency='').order_by('currency')
        
        
    return render(request, 'waterproof_fastflood/watershed_create.html', context={
        "form": form, 
        "resolutions": resolutions, 
        "serverApi": settings.WATERPROOF_API_SERVER,
        'currencies': currencies,
        'userCountry': userCountry
    })
    
def listWatershed(request):
    
    if request.method == 'GET':
        try:            
            city_id = request.GET['city']
        except:
            city_id = ''
        return watersheds(request, city_id)
    
def viewIntake(request, idx):
    if request.method == 'GET':
        countries = Countries.objects.values('pk','currency', 'name', 'iso3').distinct().exclude(currency='').order_by('currency')
        filterWatershed = Watershed.objects.get(id=idx)
        # filterExternal = ElementSystem.objects.filter(intake=filterWatershed.pk, is_external=True)
        extInputs = []
        extraction_result = []
        initial_extraction = 0
        final_extraction = 0

        intakeExtInputs = json.dumps(extInputs)
        city = Cities.objects.all()        
        interpolation = ""
        
        return render(
            request, 'waterproof_intake/intake_detail_list.html',
            {
                'intake': filterWatershed,
                'countries': countries,
                'city': city,
                'externalInputs': intakeExtInputs,
                "serverApi": settings.WATERPROOF_API_SERVER,
                'interpolation': interpolation,
                'extraction_result': extraction_result,
                'initial_extraction': initial_extraction,
                'final_extraction': final_extraction,
            }
        )

def createStepOne(request):
    logger.info("createStepOne")
    if not request.user.is_authenticated:
        return render(request, 'waterproof_nbs_ca/waterproofnbsca_login_error.html')
    else:
        edit = request.POST.get('edit')
        watershedName = request.POST.get('watershedName')
        watershedDesc = request.POST.get('watershedDesc')
        basinId = request.POST.get('basinId')
        #watershedWaterSource = request.POST.get('watershedWaterSource')
        watershedCity = request.POST.get('watershedCity')        
        watershedAreaValue = request.POST.get('watershedAreaValue')
        bboxCoors = request.POST.get('bboxCoors')
        logger.info(edit)
        if (edit == 'false'):
            try:
                watershed = Watershed(
                    name=watershedName,
                    description=watershedDesc,
                    city=Cities.objects.get(id=watershedCity),
                    creation_date=datetime.datetime.now(),
                    updated_date=datetime.datetime.now(),
                    ws_area = watershedAreaValue,
                    is_complete=False,
                    added_by=request.user,
                    demvalue = None
                )
                watershed.save()
                logger.info("watershed creada con exito")
                watershedPolygon = Polygon.objects.create(
                    area=watershedAreaValue,
                    geom=None,
                    delimitation_date=None,
                    watershed=watershed,
                    bbox = bboxCoors,
                    basin_id= basinId
                )
                logger.info("watershed polygon creado con exito")
                response = {
                    'status': True,
                    'watershedId': watershed.pk
                }
                return response
            except Exception as e:
                logger.info(e)
                response = {
                    'status': False,
                    'message': e
                }
                return response
        else:
            try:
                logger.info("editando watershed")
                watershedId = request.POST.get('watershedId')
                logger.info(watershedId)
                watershedName = request.POST.get('watershedName')
                watershedDesc = request.POST.get('watershedDesc')
                watershedCity = request.POST.get('watershedCity')
                existingWatershed = Watershed.objects.get(id=watershedId)
                logger.info(watershedId)
                existingWatershed.name = watershedName
                existingWatershed.description = watershedDesc
                existingWatershed.city = Cities.objects.get(id=watershedCity)
                existingWatershed.updated_date = datetime.datetime.now()
                existingWatershed.save()
                existingPolygon = Polygon.objects.get(watershed=existingWatershed.pk)                
                existingPolygon.save()
                response = {
                    'status': True,
                    'watershedId': existingWatershed.pk
                }
                return response
            except Exception as e:
                logger.info(e)
                response = {
                    'status': False,
                    'message': e
                }
                return response
            
def createStepTwo(request):
    if not request.user.is_authenticated:
        return render(request, 'waterproof_nbs_ca/waterproofnbsca_login_error.html')
    else:
        watershedId = request.POST.get('watershedId')
        demvalue = request.POST.get('demValue')
        existing_watershed = Watershed.objects.get(id=watershedId)        
        existing_watershed.demvalue = demvalue
        existing_watershed.save()       
        existing_polygon = Polygon.objects.get(watershed=existing_watershed.pk)
        existing_polygon.resolution = demvalue
        existing_polygon.save()        
        response = {
            'status': True,
            'watershedId': existing_watershed.pk
        }
        return response
        
def createStepThree(request):
    if not request.user.is_authenticated:
        return render(request, 'waterproof_nbs_ca/waterproofnbsca_login_error.html')
    else:
        try:
            watershedId = request.POST.get('watershedId')
            # basinId = request.POST.get('basinId')
            existing_watershed = Watershed.objects.get(id=watershedId)   
            watershed_area_polygon = request.POST.get('watershedAreaPolygon')         
            delimitAreaString = request.POST.get('delimitArea')
            # True | False
            isFile = request.POST.get('isFile')
            # GeoJSON | SHP
            typeDelimitFile = request.POST.get('typeDelimit')
            if (isFile == 'true'):
                # Validate file's extension
                if (typeDelimitFile == 'geojson'):
                    delimitAreaJson = json.loads(delimitAreaString)
                    #logger.info(delimitAreaJson)
                    for feature in delimitAreaJson['features']:
                        delimitAreaGeom = GEOSGeometry(str(feature['geometry']))
                    logger.info('Delimitation file: geojson')
                # Shapefile
                else:
                    delimitAreaJson = json.loads(delimitAreaString)
                    for feature in delimitAreaJson['features']:
                        delimitAreaGeom = GEOSGeometry(str(feature['geometry']))
                    logger.info('Delimitation file: shp')
            # Manually delimit
            else:
                delimitAreaJson = json.loads(delimitAreaString)
                delimitAreaGeom = GEOSGeometry(str(delimitAreaJson['geometry']))            
            
            existingPolygon = Polygon.objects.get(watershed=existing_watershed.pk)
            existingPolygon.geom = delimitAreaGeom
            existingPolygon.geom_watershed = watershed_area_polygon
            existingPolygon.delimitation_date = datetime.datetime.now()            
            existingPolygon.save()
            existing_watershed.is_complete = True
            existing_watershed.save()

            logger.info ("Current User ID: %s" % request.user.pk)            
            response = {
                'status': True,
                'watershedId': existing_watershed.pk
            }
            return response
        except Exception as e:
            logger.info(e)
            response = {
                'status': False,
                'message': e
            }
            return response

def validateGeometry(request):
    geometryValidations = {
        'validPolygon': False,
        'polygonContains': False
    }
    # Polygon uploaded | polygon copied from intake
    editableGeomString = request.POST.get('editablePolygon')
    # True | False
    isFile = request.POST.get('isFile')
    # GeoJSON | SHP
    typeDelimitFile = request.POST.get('typeDelimit')
    logger.info("Is file delimitation?:"+isFile)
    # Validate if delimited by file or manually
    if (isFile == 'true'):
        # Validate file's extension
        if (typeDelimitFile == 'geojson'):
            editableGeomJson = json.loads(editableGeomString)
            logger.info(editableGeomJson)
            for feature in editableGeomJson['features']:
                editableGeometry = GEOSGeometry(str(feature['geometry']))
            logger.info('geojson')
        # Shapefile
        else:
            editableGeomJson = json.loads(editableGeomString)
            for feature in editableGeomJson['features']:
                editableGeometry = GEOSGeometry(str(feature['geometry']))
            logger.info('shp')
    # Manually delimit
    else:
        editableGeomJson = json.loads(editableGeomString)
        editableGeometry = GEOSGeometry(str(editableGeomJson['geometry']))

    intakeGeomString = request.POST.get('intakePolygon')
    intakeGeomJson = json.loads(intakeGeomString)

    for feature in intakeGeomJson['features']:
        intakeGeometry = GEOSGeometry(str(feature['geometry']))
    intakeGeometry.contains(editableGeometry)

    if (editableGeometry.valid):
        geometryValidations['validPolygon'] = True
    else:
        geometryValidations['validPolygon'] = False
    if (intakeGeometry.contains(editableGeometry)):
        geometryValidations['polygonContains'] = True
    else:
        geometryValidations['polygonContains'] = False

    return JsonResponse(geometryValidations, safe=False)

def watersheds(request, city_id):
    # logger.info ("total watersheds: %s" % count)
    if request.user.is_authenticated:
        userCountry = Countries.objects.get(iso3=request.user.country)
        region = Regions.objects.get(id=userCountry.region_id)

        if (request.user.professional_role == 'ADMIN'):
            if (city_id != ''):
                watersheds = Watershed.objects.filter(city=city_id)
            else:
                watersheds = Watershed.objects.all()

            watershed_geoms = get_geoms_watersheds(watersheds)
            
            return render(
                request,
                'waterproof_fastflood/watershed_list.html',
                {
                    'watersheds': watersheds,
                    'watershedGeoms': json.dumps(watershed_geoms, default=str),
                    'userCountry': userCountry,
                    'region': region                    
                }
            )
        else:
            if (city_id != ''):
                watersheds = Watershed.objects.filter(city=city_id, added_by=request.user)            
            else:
                watersheds = Watershed.objects.filter(added_by=request.user)

            watershed_geoms = get_geoms_watersheds(watersheds)

        if (request.user.professional_role in ['ANALYS', 'COPART', 'ACDMC', 'SCADM', 'MCOMC', 'CITIZN', 'REPECS', 'OTHER']):
            return render(
                request,
                'waterproof_fastflood/watershed_list.html',
                {
                    'watersheds': watersheds,
                    'userCountry': userCountry,
                    'region': region,
                    'watershedGeoms': json.dumps(watershed_geoms, default=str)                   
                }
            )
    else:
        return render(
            request,
            'waterproof_fastflood/watershed_list.html',
            {
                'watersheds': [],
            }
        )
        
def get_geoms_watersheds(watersheds):
    watershed_geos = []
    for i in watersheds:
        ig = dict()
        ig['id'] = i.pk
        if not i.polygon_set.first() is None:
            if not i.polygon_set.first().geom_watershed is None:
                try:
                    geom_data = json.loads(i.polygon_set.first().geom_watershed)
                    # Verificar si el JSON tiene estructura de FeatureCollection
                    if 'features' in geom_data and len(geom_data['features']) > 0:
                        ig['geom'] = geom_data['features'][0]['geometry']
                    # Si es directamente un geometry object
                    elif 'type' in geom_data and 'coordinates' in geom_data:
                        ig['geom'] = geom_data
                    else:
                        logger.warning(f"Unexpected geom_watershed structure for watershed {i.pk}")
                        continue
                    ig['name'] = i.name
                    watershed_geos.append(ig)
                except (json.JSONDecodeError, TypeError, KeyError, IndexError) as e:
                    logger.warning(f"Error parsing geom_watershed for watershed {i.pk}: {e}")
                    continue
    return watershed_geos

def viewWatershed(request, idx):
    if request.method == 'GET':
        countries = Countries.objects.values('pk','currency', 'name', 'iso3').distinct().exclude(currency='').order_by('currency')
        filterWatershed = Watershed.objects.get(id=idx)
        # filterPolygon = Polygon.objects.get(watershed_id = idx)
        watershedPolygon = filterWatershed.polygon_set.first()        
        geom = watershedPolygon.geom.geojson        
        demValue = filterWatershed.demvalue
        
        city = Cities.objects.all()       
        

        return render(
            request, 'waterproof_fastflood/watershed_view.html',
            {
                'watershed': filterWatershed,
                'countries': countries,
                "resolutions": resolutions, 
                'city': city,                
                'geom': geom,
                'demValue': demValue,                
                "serverApi": settings.WATERPROOF_API_SERVER,
            }
        )
        
def editWatershed(request, idx):
    if request.method == 'GET':
        countries = Countries.objects.values('pk','currency', 'name', 'iso3').distinct().exclude(currency='').order_by('currency')
        filterWatershed = Watershed.objects.get(id=idx)
        watershedPolygon = filterWatershed.polygon_set.first()                
        geom = watershedPolygon.geom.geojson      
        demValue = filterWatershed.demvalue
        
        city = Cities.objects.all()                

        return render(
            request, 'waterproof_fastflood/watershed_edit.html',
            {
                'watershed': filterWatershed,
                'countries': countries,
                "resolutions": resolutions, 
                'city': city,                
                'geom': geom,
                'demValue': demValue,                
                "serverApi": settings.WATERPROOF_API_SERVER,
            }
        )
        
def cloneWatershed(request, idx):
    logger.info("clonning watershed")
    if request.method == 'GET':
        countries = Countries.objects.values('pk','currency', 'name', 'iso3').distinct().exclude(currency='').order_by('currency')
        watershed = Watershed.objects.get(id=idx)
        watershedPolygon = watershed.polygon_set.first()        
        geom = watershedPolygon.geom.geojson
        
        demValue = watershed.demvalue        
        city = Cities.objects.all()

        return render(
            request, 'waterproof_fastflood/watershed_clone.html',
            {
                'watershed': watershed,
                'countries': countries,
                "resolutions": resolutions, 
                'city': city,                
                'geom': geom,
                'demValue': demValue,                
                "serverApi": settings.WATERPROOF_API_SERVER,
            }
        )

def deleteWatershed(request, idx):
    if request.method == "POST":
        logger.info(idx)
        watershed = Watershed.objects.get(id=idx)
        if not watershed:
            logger.info("Not found")
            context = {
                'status': '400', 'reason': 'Intake not found'
            }
            response = HttpResponse(json.dumps(context), content_type='application/json')
            response.status_code = 400
            return response
        else:
            # delete object
            logger.info(watershed.delete())
            # after deleting redirect to
            # home page
            context = {
                'status': '200', 'reason': 'sucess'
            }
            response = HttpResponse(json.dumps(context), content_type='application/json')
            response.status_code = 200
            return response
        
# ---------------------------------------------------------------------------- Fastflood Study Cases ----------------------------------------------------------------------------
 
def get_geoms_waterhsed_cs(studyCases):
    watershed_geoms = []
    watershed_dict = {}  # Para evitar duplicados por watershed
    
    # Validar que studyCases no esté vacío
    if not studyCases:
        return watershed_geoms
    
    for sc in studyCases:
        watersheds = sc.watershed.all()
        for watershed in watersheds:
            # Validar que el intake tenga polygon_set
            polygon = watershed.polygon_set.first()
            if not polygon or not polygon.geom_watershed:
                continue
                
            watershed_id = watershed.pk
            
            # Si el watershed ya existe, agregar el caso de estudio a las listas
            if watershed_id in watershed_dict:
                watershed_dict[watershed_id]['study_case_ids'].append(sc.pk)
                watershed_dict[watershed_id]['study_case_names'].append(sc.name)
            else:
                # Crear nueva entrada para el watershed
                ig = dict()
                ig['study_case_ids'] = [sc.pk]  # Lista de IDs de casos de estudio
                ig['study_case_names'] = [sc.name]  # Lista de nombres de casos de estudio
                ig['id'] = watershed.pk  # Mantener compatibilidad con JavaScript existente
                ig['intake_id'] = watershed.pk
                try:
                    geom_data = json.loads(polygon.geom_watershed)
                    # Verificar si el JSON tiene estructura de FeatureCollection
                    if 'features' in geom_data and len(geom_data['features']) > 0:
                        ig['geom'] = geom_data['features'][0]['geometry']
                    # Si es directamente un geometry object
                    elif 'type' in geom_data and 'coordinates' in geom_data:
                        ig['geom'] = geom_data
                    else:
                        logger.warning(f"Unexpected geom_watershed structure for watershed {watershed_id}")
                        ig['geom'] = None
                except (json.JSONDecodeError, TypeError, KeyError, IndexError) as e:
                    logger.warning(f"Error parsing geojson for watershed {watershed_id}: {e}")
                    ig['geom'] = None
                ig['intake_name'] = watershed.name
                watershed_dict[watershed_id] = ig
    
    # Convertir el diccionario a lista
    watershed_geoms = list(watershed_dict.values())
    return watershed_geoms 
 
def study_cases_list(request):
    if request.method == 'GET':
        try:            
            city_id = request.GET['city']
        except:
            city_id = ''
        if request.user.is_authenticated:
            if (request.user.professional_role == 'ADMIN'):
                userCountry = Countries.objects.select_related('region').get(iso3=request.user.country)
                region = userCountry.region
                if (city_id != ''):
                    studyCases = StudyCases.objects.filter(city=city_id).select_related('added_by', 'city').prefetch_related('watershed__polygon_set').order_by('-edit_date')
                    city = Cities.objects.get(id=city_id)
                else:
                    studyCases = StudyCases.objects.select_related('added_by', 'city').prefetch_related('watershed__polygon_set').order_by('-edit_date')
                    city = Cities.objects.get(id=1)
                watershed_geoms = get_geoms_waterhsed_cs(studyCases)       
                # Preparar datos optimizados para el template
                optimized_cases = []
                for case in studyCases:
                    watersheds = case.watershed.all()
                    case_data = {
                        'case': case,
                        'watersheds_info': {
                            'names_links': [{'id': w.id, 'name': w.name} for w in watersheds],
                            'demvalues': [w.demvalue for w in watersheds if w.demvalue]
                        },
                        'can_edit': (request.user.professional_role == 'ADMIN' or 
                                   case.added_by.pk == request.user.pk),
                        'can_admin': request.user.professional_role == 'ADMIN'
                    }
                    optimized_cases.append(case_data)
                
                return render(
                    request,
                    'waterproof_fastflood/studycases_list.html',
                    {
                        'optimizedCases': optimized_cases,
                        'city': city,
                        'userCountry': userCountry,
                        'region': region,
                        'watershedGeoms': json.dumps(watershed_geoms, default=str),
                        'serverApi': settings.WATERPROOF_API_SERVER,
                        'user': request.user
                    }
                )

            if (request.user.professional_role != 'ADMIN'):
                if (city_id != ''):
                    query = Q(city=city_id,added_by=request.user)
                    query.add(Q(city=city_id,is_public=True), Q.OR)
                    studyCases = StudyCases.objects.filter(query).select_related('added_by', 'city').prefetch_related('watershed__polygon_set').order_by('-edit_date')
                    city = Cities.objects.get(id=city_id)
                else:
                    query = Q(added_by=request.user)
                    query.add(Q(is_public=True), Q.OR)
                    studyCases = StudyCases.objects.filter(query).select_related('added_by', 'city').prefetch_related('watershed__polygon_set').order_by('-edit_date')
                    city = Cities.objects.get(id=1)
                
                userCountry = Countries.objects.select_related('region').get(iso3=request.user.country)
                region = userCountry.region
                watershed_geoms = get_geoms_waterhsed_cs(studyCases)
                #logger.info("Watershed geoms:", watershed_geoms)
                
                # Preparar datos optimizados para el template
                optimized_cases = []
                for case in studyCases:
                    watersheds = case.watershed.all()
                    case_data = {
                        'case': case,
                        'watersheds_info': {
                            'names_links': [{'id': w.id, 'name': w.name} for w in watersheds],
                            'demvalues': [w.demvalue for w in watersheds if w.demvalue]
                        },
                        'can_edit': (request.user.professional_role == 'ADMIN' or 
                                   case.added_by.pk == request.user.pk),
                        'can_admin': request.user.professional_role == 'ADMIN'
                    }
                    optimized_cases.append(case_data)
                
                return render(
                    request,
                    'waterproof_fastflood/studycases_list.html',
                    {
                        'optimizedCases': optimized_cases,
                        'city': city,
                        'userCountry': userCountry,
                        'region': region,
                        'watershedGeoms': json.dumps(watershed_geoms, default=str),
                        'serverApi': settings.WATERPROOF_API_SERVER,
                        'user': request.user
                    }
                )
        else:
            if (city_id != ''):
                query = Q(city=city_id)
                query.add(Q(is_public=True), Q.AND)
                studyCases = StudyCases.objects.filter(query).select_related('added_by', 'city').prefetch_related('watershed__polygon_set').order_by('-edit_date')
                city = Cities.objects.get(id=city_id)
            else:
                studyCases = StudyCases.objects.filter(is_public=True).select_related('added_by', 'city').prefetch_related('watershed__polygon_set').order_by('-edit_date')
                city = Cities.objects.get(id=1)
            # Preparar datos optimizados para usuarios no autenticados
            optimized_cases = []
            for case in studyCases:
                watersheds = case.watershed.all()
                case_data = {
                    'case': case,
                    'watersheds_info': {
                        'names_links': [{'id': w.id, 'name': w.name} for w in watersheds],
                        'demvalues': [w.demvalue for w in watersheds if w.demvalue]
                    },
                    'can_edit': False,
                    'can_admin': False
                }
                optimized_cases.append(case_data)
            
            return render(
                request,
                'waterproof_fastflood/studycases_list.html',
                {
                    'optimizedCases': optimized_cases,
                    'watershedGeoms': [],
                    'user': None
                }
            )
       
def create_study_case(request):
    if not request.user.is_authenticated:
        return render(request, 'waterproof_fastflood/studycases_login_error.html')
    else:
        if request.method == 'POST':
            return HttpResponseRedirect(reverse('study_cases_list'))
        else:
            iso_country = request.GET.get('iso_country', 'USA')
            logger.info("ISO COUNTRY: ", iso_country)
            listPortfolios = Portfolio.objects.all()
            portfolios = []
            for portfolio in listPortfolios:                
                portfolios.append({
                    'id': portfolio.id,
                    'name': _(portfolio.name),
                    'default': portfolio.default
                })

            currencys = Countries.objects.values('pk', 'currency', 'name', 'iso3').distinct().exclude(currency='').order_by('currency')
            max_damage_cost_default = MaxDamageCost.objects.values('damage_class', 'max_damage_cost').filter(iso=iso_country)
            max_damage_list = querySet_to_list(max_damage_cost_default)
            max_damage_cost_default_json = json.dumps(max_damage_list)

            return render(request,
                            'waterproof_fastflood/studycases_form.html',
                            context={
                                "serverApi": settings.WATERPROOF_API_SERVER,
                                "serverRiosApi": settings.WATERPROOF_MODELS_PY2_API,
                                'portfolios': portfolios,
                                'currencys': currencys,
                                'scenarios': scenarios,
                                'storm_durations': storm_durations,
                                'costFunctions' : [],
                                'years': change_year,
                                'id_user' : request.user.id,
                                'invest_doc': settings.WATERPROOF_INVEST_DOC,
                                'maxDamageCostDefault': max_damage_cost_default_json
                            }
                        )
            
def edit_study_case(request, idx):
    if not request.user.is_authenticated:
        return render(request, 'waterproof_fastflood/studycases_login_error.html')
    else:
        if request.method == 'POST':
            return HttpResponseRedirect(reverse('study_cases_list'))
        else:
            study_case = StudyCases.objects.get(id=idx)
            listPortfolios = Portfolio.objects.all()
            portfolios = []
            listPortfoliosStudy = study_case.portfolios.all()
            try:
                maxDamageList = StudyCase_depth_damage.objects.get(study_case=study_case)
            except:
                maxDamageList = MaxDamageCost.objects.values('damage_class', 'max_damage_cost').filter(iso=study_case.analysis_currency)
            damageCurveList = StudyCase_damage_curve.objects.filter(study_case=study_case).order_by('flood_depth')
            investData = StudyCases_Parameters_Bio.objects.filter(study_case=study_case).order_by('lucode')
            watershed = study_case.watershed.first().id   
            currencys = Countries.objects.values('pk', 'currency','name', 'iso3').exclude(currency__exact='').order_by('currency')
            study_case_currency = study_case.analysis_currency
            logger.info("study_case_currency: ", study_case_currency)
            max_damage_cost_default = MaxDamageCost.objects.values('damage_class', 'max_damage_cost').filter(iso=study_case.analysis_currency)
            max_damage_list = querySet_to_list(max_damage_cost_default)
            max_damage_cost_default_json = json.dumps(max_damage_list)
            path_available_storm_durations = os.path.join(BASE_PATH_FASTFLOOD, 'WI_' + watershed.__str__(), 'in','06-FLOOD', 'available_durations.json')
            if os.path.exists(path_available_storm_durations):
                filter_storm_duration = json.load(open(path_available_storm_durations))
                storm_durations_local = filter_storm_duration['duration']
            else:
                logger.info("File not found:", path_available_storm_durations)
                storm_durations_local = storm_durations            


            for portfolio in listPortfolios:
                defaultValue = False
                for portfolioStudy in listPortfoliosStudy:
                    if portfolio.id == portfolioStudy.id:
                        defaultValue = True
                pObject = {
                    'id': portfolio.id,
                    'name': _(portfolio.name),
                    'default': defaultValue
                }
                portfolios.append(pObject)       
            return render(
                request, 'waterproof_fastflood/studycases_edit.html',
                {
                    "serverApi": settings.WATERPROOF_API_SERVER,
                    "serverRiosApi": settings.WATERPROOF_MODELS_PY2_API,
                    'study_case': study_case,
                    'portfolios': portfolios,
                    'currencys': currencys,
                    'scenarios': scenarios,
                    'id_user' : request.user.id,
                    'invest_doc': settings.WATERPROOF_INVEST_DOC,
                    'watershed': watershed,
                    'years': change_year,
                    'storm_durations': storm_durations_local,
                    'quantiles': quantiles,
                    'maxDamageList': maxDamageList,
                    'damageCurveList': damageCurveList,
                    'investData': investData,
                    'maxDamageCostDefault': max_damage_cost_default_json
                }
            )
                     
def clone_study_case(request, idx, country_iso='USA'):
    if not request.user.is_authenticated:
        return render(request, 'waterproof_fastflood/studycases_login_error.html')
    else:
        if request.method == 'POST':
            return HttpResponseRedirect(reverse('study_cases_list'))
        else:
            logger.info("clonning study case, country iso:", country_iso)
            study_case = StudyCases.objects.get(id=idx)
            listPortfolios = Portfolio.objects.all()
            try:
                maxDamageList = StudyCase_depth_damage.objects.get(study_case=study_case)
            except:
                maxDamageList = MaxDamageCost.objects.values('damage_class', 'max_damage_cost').filter(iso=study_case.analysis_currency)
            damageCurveList = StudyCase_damage_curve.objects.filter(study_case=study_case).order_by('flood_depth')
            investData = StudyCases_Parameters_Bio.objects.filter(study_case=study_case).order_by('lucode')
            portfolios = []
            listPortfoliosStudy = study_case.portfolios.all()
            watershed = study_case.watershed.first().id    
            currencys = Countries.objects.values('pk', 'currency','name', 'iso3').exclude(currency__exact='').order_by('currency')
            max_damage_cost_default = MaxDamageCost.objects.values('damage_class', 'max_damage_cost').filter(iso=country_iso)
            max_damage_list = querySet_to_list(max_damage_cost_default)
            max_damage_cost_default_json = json.dumps(max_damage_list)
            path_available_durations = os.path.join(BASE_PATH_FASTFLOOD, 'WI_' + watershed.__str__(), 'in','06-FLOOD', 'available_durations.json')
            if os.path.exists(path_available_durations):
                filter_storm_duration = json.load(open(path_available_durations))
                storm_durations_local = filter_storm_duration['duration']
            else:
                logger.info("File not found:", path_available_durations)
                storm_durations_local = storm_durations

            for portfolio in listPortfolios:
                defaultValue = False
                for portfolioStudy in listPortfoliosStudy:
                    if portfolio.id == portfolioStudy.id:
                        defaultValue = True
                pObject = {
                    'id': portfolio.id,
                    'name': _(portfolio.name),
                    'default': defaultValue
                }
                portfolios.append(pObject)       
            return render(
                request, 'waterproof_fastflood/studycases_clone.html',
                {
                    "serverApi": settings.WATERPROOF_API_SERVER,
                    "serverRiosApi": settings.WATERPROOF_MODELS_PY2_API,
                    'study_case': study_case,
                    'portfolios': portfolios,
                    'currencys': currencys,
                    'scenarios': scenarios,
                    'id_user' : request.user.id,
                    'invest_doc': settings.WATERPROOF_INVEST_DOC,
                    'watershed': watershed,
                    'costFunctions' : [],
                    'years': change_year,
                    'storm_durations': storm_durations_local,
                    'quantiles': quantiles,
                    'maxDamageList': maxDamageList,
                    'damageCurveList': damageCurveList,
                    'investData': investData,
                    'maxDamageCostDefault': max_damage_cost_default_json
                }
            )
        
def view_study_case(request, idx):
    logger.info("view_study_case, current language", request.LANGUAGE_CODE)
    if request.method == 'POST':
        return HttpResponseRedirect(reverse('study_cases_list'))
    else:
        study_case = StudyCases.objects.get(id=idx)
        listPortfolios = Portfolio.objects.all()
        portfolios = []
        try:
            maxDamageList = StudyCase_depth_damage.objects.get(study_case=study_case)
        except:
            maxDamageList = MaxDamageCost.objects.values('damage_class', 'max_damage_cost').filter(iso=study_case.analysis_currency)
        damageCurveList = StudyCase_damage_curve.objects.filter(study_case=study_case).order_by('flood_depth')
        investData = StudyCases_Parameters_Bio.objects.filter(study_case=study_case).order_by('lucode')
        listPortfoliosStudy = study_case.portfolios.all()
        watershed = study_case.watershed.first()   
        currencys = Countries.objects.values('pk', 'currency','name', 'iso3').exclude(currency__exact='').order_by('currency')

        for portfolio in listPortfolios:
            defaultValue = False
            for portfolioStudy in listPortfoliosStudy:
                if portfolio.id == portfolioStudy.id:
                    defaultValue = True
            pObject = {
                'id': portfolio.id,
                'name': _(portfolio.name),
                'default': defaultValue
            }
            portfolios.append(pObject)    

        return render(
            request, 'waterproof_fastflood/studycases_view.html',
            {
                    "serverApi": settings.WATERPROOF_API_SERVER,
                    "servermodelApi": settings.WATERPROOF_MODELS_PY2_API,
                    'study_case': study_case,
                    'portfolios': portfolios,
                    'currencys': currencys,
                    'scenarios': scenarios,
                    'id_user' : request.user.id,
                    'invest_doc': settings.WATERPROOF_INVEST_DOC,
                    'watershed': watershed,
                    'costFunctions' : [],
                    'years': change_year,
                    'storm_durations': storm_durations,
                    'quantiles': quantiles,
                    'maxDamageList': maxDamageList,
                    'damageCurveList': damageCurveList,
                    'investData': investData
            }
        )
        
def reportMenu(request, idx):
    if request.method == 'POST':
        return HttpResponseRedirect(reverse('study_cases_list'))
    else:
        # downloadZip = zip.objects.filter(study_case_id__id=idx).first()        

        study_case = StudyCases.objects.get(id=idx)
        
        return render(
            request, 'waterproof_fastflood/reports_menu.html',
            {
                "serverApi": settings.WATERPROOF_API_SERVER,
                'study_case': study_case,
                # 'filterzip': downloadZip,
                'idx': idx
            }
        )
    
def querySet_to_list(qs):
    """
    this will return python list<dict>
    """
    return [dict(q) for q in qs]