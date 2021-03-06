"""
Views for the ``Waterproof intake`` application.

"""

import logging
from typing import final

from django.conf import settings
from django.urls import reverse
from django.contrib import messages
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.shortcuts import render, redirect, get_object_or_404
from django.utils.translation import ugettext as _
from .models import ValuesTime, ProcessEfficiencies, Intake, DemandParameters, WaterExtraction, ElementSystem, ValuesTime, CostFunctionsProcess, Polygon, Basins, ElementConnections, UserCostFunctions
from geonode.waterproof_parameters.models import Countries, Regions, Cities
from django.contrib.gis.gdal import SpatialReference, CoordTransform
from django.core import serializers
from django.http import JsonResponse
from . import forms
from types import SimpleNamespace
import simplejson as json
from django.contrib.gis.geos import GEOSGeometry
from django.contrib.gis.gdal import OGRGeometry
from django.db.models import Q
from django.contrib.auth import get_user_model
from geonode.base.auth import get_or_create_token

import datetime
import requests
logger = logging.getLogger(__name__)

interpolations = {'LINEAR': _('Linear interpolation'), 
            'POTENTIAL': _('Potential interpolation'), 
            'EXPONENTIAL': _('Exponential interpolation'),
            'LOGISTIC': _('Logistic interpolation'),
            'MANUAL': _('Manual interpolation')}

"""
Create Waterproof intake

Attributes
----------
request: Request
"""


def createIntake(request):
    print("createIntake")
    logger.debug(request.method)
    # POST submit FORM
    if request.method == 'POST':
        if request.POST.get('step') == '1':
            stepCreation = createStepOne(request)
            if stepCreation['status'] == True:
                context = {
                    'status': '200',
                    'intakeId': stepCreation['intakeId'],
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
        elif request.POST.get('step') == '2':
            stepCreation = createStepTwo(request)
            print(stepCreation)
            if stepCreation['status'] == True:
                context = {
                    'status': '200',
                    'intakeId': stepCreation['intakeId'],
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
        elif request.POST.get('step') == '3':
            stepCreation = createStepThree(request)
            if stepCreation['status'] == True:
                context = {
                    'status': '200',
                    'intakeId': stepCreation['intakeId'],
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
        elif request.POST.get('step') == '4':
            stepCreation = createStepFour(request)
            print(stepCreation)
            if stepCreation['status'] == True:
                context = {
                    'status': '200',
                    'intakeId': stepCreation['intakeId'],
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
        elif request.POST.get('step') == '5':
            stepCreation = createStepFive(request)
            print("Resultado guardado paso 5:::")
            print(stepCreation)
            if stepCreation['status'] == True:
                context = {
                    'status': '200',
                    'intakeId': stepCreation['intakeId'],
                    'message': 'Success'
                }
                response = HttpResponse(json.dumps(context), content_type='application/json')
                response.status_code = 200
                return response
            else:
                errorMessage = _('Error saving intake')
                context = {
                    'status': '200', 'message': str(errorMessage)
                }
                response = HttpResponse(json.dumps(context), content_type='application/json')
                response.status_code = 200
                return response
        else:
            print("Error step doesn't exits")

        form = forms.IntakeForm(request.POST)
    else:
        form = forms.IntakeForm()
        userCountry = Countries.objects.get(iso3=request.user.country)
        currencies = Countries.objects.values('pk', 'currency', 'name', 'iso3').distinct().exclude(currency='').order_by('currency')

    return render(request, 'waterproof_intake/intake_form.html', context={
        "form": form, 
        "serverApi": settings.WATERPROOF_API_SERVER,
        'currencies': currencies,
        'userCountry': userCountry
    })


"""
Intake creation data
Step one wizard

Attributes
----------
request: Request
"""
def createStepOne(request):
    print("createStepOne")
    if not request.user.is_authenticated:
        return render(request, 'waterproof_nbs_ca/waterproofnbsca_login_error.html')
    else:
        edit = request.POST.get('edit')
        basinId = request.POST.get('basinId')
        intakeName = request.POST.get('intakeName')
        intakeDesc = request.POST.get('intakeDesc')
        intakeWaterSource = request.POST.get('intakeWaterSource')
        intakeCity = request.POST.get('intakeCity')
        intakeAreaString = request.POST.get('intakeAreaPolygon')
        pointIntakeString = request.POST.get('pointIntake')
        print(edit)
        if (edit == 'false'):
            try:
                intake = Intake(
                    name=intakeName,
                    description=intakeDesc,
                    water_source_name=intakeWaterSource,
                    city=Cities.objects.get(id=intakeCity),
                    demand_parameters=None,
                    xml_graph=None,
                    creation_date=datetime.datetime.now(),
                    updated_date=datetime.datetime.now(),
                    is_complete=False,
                    added_by=request.user
                )
                intake.save()
                intakePolygon = Polygon.objects.create(
                    area=0,
                    geom=None,
                    geomIntake=intakeAreaString,
                    geomPoint=pointIntakeString,
                    delimitation_date=None,
                    delimitation_type=None,
                    basin=Basins.objects.get(id=basinId),
                    intake=intake
                )
                response = {
                    'status': True,
                    'intakeId': intake.pk
                }
                return response
            except Exception as e:
                print(e)
                response = {
                    'status': False,
                    'message': e
                }
                return response
        else:
            try:
                intakeId = request.POST.get('intakeId')
                intakeName = request.POST.get('intakeName')
                intakeDesc = request.POST.get('intakeDesc')
                intakeWaterSource = request.POST.get('intakeWaterSource')
                intakeCity = request.POST.get('intakeCity')
                intakeAreaString = request.POST.get('intakeAreaPolygon')
                pointIntakeString = request.POST.get('pointIntake')
                existingIntake = Intake.objects.get(id=intakeId)
                print(intakeId)
                existingIntake.name = intakeName
                existingIntake.description = intakeDesc
                existingIntake.water_source_name = intakeWaterSource
                existingIntake.city = Cities.objects.get(id=intakeCity)
                existingIntake.updated_date = datetime.datetime.now()
                existingIntake.save()
                existingPolygon = Polygon.objects.get(intake=existingIntake.pk)
                existingPolygon.geomIntake = intakeAreaString
                existingPolygon.geomPoint = pointIntakeString
                existingPolygon.save()
                response = {
                    'status': True,
                    'intakeId': existingIntake.pk
                }
                return response
            except Exception as e:
                print(e)
                response = {
                    'status': False,
                    'message': e
                }
                return response
"""
Intake creation data
Step two wizard

Attributes
----------

request: Request
"""
def createStepTwo(request):
    print("createStepTwo")
    if not request.user.is_authenticated:
        return render(request, 'waterproof_nbs_ca/waterproofnbsca_login_error.html')
    else:
        try:
            intakeId = request.POST.get('intakeId')
            existingIntake = Intake.objects.get(id=intakeId)
            xmlGraph = request.POST.get('xmlGraph')
            graphElementsString = request.POST.get('graphElements')
            connectionsElementString = request.POST.get('graphConnections')
            graphElements = json.loads(graphElementsString)
            connectionsElements = json.loads(connectionsElementString)
            existingIntake.xml_graph = xmlGraph
            print("existingIntake.save()")
            existingIntake.save()
            actualElements = list(ElementSystem.objects.filter(
                intake=existingIntake.pk).values_list('id', flat=True))

            if (len(actualElements) > 0):
                for element in actualElements:
                    print("deleting actualElements: %s" % element)
                    el = ElementSystem.objects.get(id=element)
                    existingValuesTime = list(ValuesTime.objects.filter(element=el.pk).values_list('id', flat=True))
                    for value in existingValuesTime:
                        val = ValuesTime.objects.get(id=value)
                        val.delete()
                    el.delete()

            elementsCreated = []
            # Save all graph elements
            for idx, element in enumerate(graphElements):

                if ('external' in element):
                    try:
                        # Regular element
                        if (element['external'] == 'false'):
                            print ("element['external'] == 'false'")
                            parameter = json.loads(element['resultdb'])
                            element_system = ElementSystem.objects.create(
                                graphId=element['id'],
                                name=element['name'],
                                normalized_category=parameter[0]['fields']['normalized_category'],
                                transported_water=parameter[0]['fields']['predefined_transp_water_perc'],
                                sediment=parameter[0]['fields']['predefined_sediment_perc'],
                                nitrogen=parameter[0]['fields']['predefined_nitrogen_perc'],
                                phosphorus=parameter[0]['fields']['predefined_phosphorus_perc'],
                                is_external=False,
                                intake=existingIntake
                            )
                            elementC = {}
                            elementC['pk'] = element_system.pk
                            elementC['xmlId'] = element_system.graphId
                            elementsCreated.append(elementC)

                            if not (element['funcost'] == None):
                                costFunction = json.loads(element['funcost'])
                                print("costFunction: %s" % costFunction)
                                if (len(costFunction) > 0):
                                    templateFunction = None
                                    for function in costFunction:
                                        try:
                                            if 'pk' in function:
                                                templateFunction = CostFunctionsProcess.objects.get(id=function['pk'])
                                            currency = None
                                            fn_fields = function['fields']
                                            if ('currencyCost' in fn_fields):
                                                currency = Countries.objects.get(id = fn_fields['currencyCost'])
                                            
                                            fn_fields = function['fields']                                            
                                            mainFunction = UserCostFunctions.objects.create(
                                                name = fn_fields['function_name'],
                                                description = fn_fields['function_description'],
                                                function = fn_fields['function_value'],
                                                function_factor = fn_fields['global_multiplier_factorCalculator'],
                                                currency = currency,
                                                template_function = templateFunction,
                                                user = request.user,
                                                element_system = element_system,
                                                intake = existingIntake,
                                            )
                                        except Exception as e:
                                            print(e)
                        # External element
                        else:
                            parameter = json.loads(element['resultdb'])
                            print ("element['external'] == 'true'")
                            try:
                                if (len(parameter) > 0):
                                    element_system = ElementSystem.objects.create(
                                        graphId=element['id'],
                                        name=element['name'],
                                        normalized_category=parameter[0]['fields']['normalized_category'],
                                        transported_water=parameter[0]['fields']['predefined_transp_water_perc'],
                                        sediment=parameter[0]['fields']['predefined_sediment_perc'],
                                        nitrogen=parameter[0]['fields']['predefined_nitrogen_perc'],
                                        phosphorus=parameter[0]['fields']['predefined_phosphorus_perc'],
                                        is_external=True,
                                        intake=existingIntake
                                    )
                                    elementC = {}
                                    elementC['pk'] = element_system.pk
                                    elementC['xmlId'] = element_system.graphId
                                    elementsCreated.append(elementC)

                                    if not (element['funcost'] == None):
                                        costFunction = json.loads(element['funcost'])
                                        if (len(costFunction) > 0):
                                            for function in costFunction:
                                                templateFunction = CostFunctionsProcess.objects.get(id=function['pk'])
                                                fn_fields = function['fields']                                                
                                                if ('currencyCost' in fn_fields):
                                                    currency = Countries.objects.get(id=function['fields']['currencyCost'])
                                                else:
                                                    currency = None
                                                mainFunction = UserCostFunctions.objects.create(
                                                    name=fn_fields['function_name'],
                                                    description=fn_fields['function_description'],
                                                    function=fn_fields['function_value'],
                                                    function_factor=fn_fields['global_multiplier_factorCalculator'],
                                                    template_function=templateFunction,
                                                    currency=currency,
                                                    user=request.user,
                                                    element_system = element_system,
                                                    intake = existingIntake,
                                                )
                                           
                                    external_info = json.loads(element['externaldata'])
                                    elementCreated = ElementSystem.objects.get(graphId=element['id'], intake=intakeId)
                                    for external in external_info:
                                        external_input = ValuesTime.objects.create(
                                            year=external['year'],
                                            water_volume=external['waterVol'],
                                            sediment=external['sediment'],
                                            nitrogen=external['nitrogen'],
                                            phosphorus=external['phosphorus'],
                                            element=elementCreated
                                        )
                                else:
                                    element_system = ElementSystem.objects.create(
                                        graphId=element['id'],
                                        name=element['name'],
                                        transported_water=0,
                                        sediment=0,
                                        nitrogen=0,
                                        phosphorus=0,
                                        is_external=True,
                                        intake=existingIntake
                                    )
                            except Exception as e:
                                print(e)
                    except Exception as e:
                        print(e)
                # Connections
                else:
                    print ("Not exist external info")
                    parameter = json.loads(element['resultdb'])
                    if (len(parameter) > 0):
                        element_system = ElementSystem.objects.create(
                            graphId=element['id'],
                            name=element['name'],
                            normalized_category=parameter[0]['fields']['normalized_category'],
                            transported_water=parameter[0]['fields']['predefined_transp_water_perc'],
                            sediment=parameter[0]['fields']['predefined_sediment_perc'],
                            nitrogen=parameter[0]['fields']['predefined_nitrogen_perc'],
                            phosphorus=parameter[0]['fields']['predefined_phosphorus_perc'],
                            is_external=False,
                            intake=existingIntake
                        )
                        elementC = {}
                        elementC['pk'] = element_system.pk
                        elementC['xmlId'] = element_system.graphId
                        elementsCreated.append(elementC)
                        if not (element['funcost'] == None):
                            costFunction = json.loads(element['funcost'])
                            print("costFunction: %s" % costFunction)
                            if (len(costFunction) > 0):
                                templateFunction = None                             
                                for function in costFunction:
                                    if 'pk' in function:
                                        templateFunction = CostFunctionsProcess.objects.get(id=function['pk'])
                                    fn_fields = function['fields']                                    
                                    currency = None
                                    if ('currencyCost' in fn_fields):
                                        currency = Countries.objects.get(id=fn_fields['currencyCost'])
                                    mainFunction = UserCostFunctions.objects.create(
                                        name=fn_fields['function_name'],
                                        description=fn_fields['function_description'],
                                        function=fn_fields['function_value'],
                                        function_factor=fn_fields['global_multiplier_factorCalculator'],
                                        currency=currency,
                                        template_function=templateFunction,
                                        user=request.user,
                                        element_system = element_system,
                                        intake = existingIntake,
                                    )                                    

            # Once all elements created, save the connections
            for con in connectionsElements:
                source = next((item for item in elementsCreated if item["xmlId"] == con['source']), None)
                target = next((item for item in elementsCreated if item["xmlId"] == con['target']), None)
                sourceElement = ElementSystem.objects.get(id=source['pk'])
                targetElement = ElementSystem.objects.get(id=target['pk'])
                ElementConnections.objects.create(
                    source=sourceElement,
                    target=targetElement
                )
            response = {
                'status': True,
                'intakeId': existingIntake.pk
            }
            return response
        except Exception as e:
            response = {
                'status': False,
                'message': e
            }
            return response


"""
Intake creation data
Step three wizard

Attributes
----------

request: Request
"""
def createStepThree(request):
    if not request.user.is_authenticated:
        return render(request, 'waterproof_nbs_ca/waterproofnbsca_login_error.html')
    else:
        try:
            intakeId = request.POST.get('intakeId')
            edit = request.POST.get('edit')
            existingIntake = Intake.objects.get(id=intakeId)
            interpolationString = request.POST.get('waterExtraction')
            interpolation = json.loads(interpolationString)
            if (interpolation['typeInterpolation'] == 'MANUAL'):
                isManual = True
                interpolation['initialValue'] = 0
                interpolation['finalValue'] = 0
            else:
                isManual = False
            if (edit == 'false'):
                demand_parameters = DemandParameters.objects.create(
                    interpolation_type=interpolation['typeInterpolation'],
                    initial_extraction=interpolation['initialValue'],
                    ending_extraction=interpolation['finalValue'],
                    years_number=interpolation['yearCount'],
                    is_manual=isManual,
                )
                for extraction in interpolation['yearValues']:
                    water_extraction = WaterExtraction.objects.create(
                        year=extraction['year'],
                        value=extraction['value'],
                        demand=demand_parameters
                    )
                existingIntake.demand_parameters = demand_parameters
                existingIntake.save()
                response = {
                    'status': True,
                    'intakeId': existingIntake.pk
                }
                return response
            else:
                if (existingIntake.demand_parameters != None):
                    demandParameter = DemandParameters.objects.get(id=existingIntake.demand_parameters.pk)
                    demandParameter.interpolation_type = interpolation['typeInterpolation']
                    demandParameter.initial_extraction = interpolation['initialValue']
                    demandParameter.ending_extraction = interpolation['finalValue']
                    demandParameter.years_number = interpolation['yearCount']
                    demandParameter.save()
                    actualWaterExtraction = list(WaterExtraction.objects.filter(
                        demand=demandParameter.pk).values_list('id', flat=True))
                    for extraction in actualWaterExtraction:
                        ext = WaterExtraction.objects.get(id=extraction)
                        ext.delete()
                    for extraction in interpolation['yearValues']:
                        water_extraction = WaterExtraction.objects.create(
                            year=extraction['year'],
                            value=extraction['value'],
                            demand=demandParameter
                        )
                    response = {
                        'status': True,
                        'intakeId': existingIntake.pk
                    }
                    return response
                else:
                    demand_parameters = DemandParameters.objects.create(
                        interpolation_type=interpolation['typeInterpolation'],
                        initial_extraction=interpolation['initialValue'],
                        ending_extraction=interpolation['finalValue'],
                        years_number=interpolation['yearCount'],
                        is_manual=isManual,
                    )
                    for extraction in interpolation['yearValues']:
                        water_extraction = WaterExtraction.objects.create(
                            year=extraction['year'],
                            value=extraction['value'],
                            demand=demand_parameters
                        )
                    existingIntake.demand_parameters = demand_parameters
                    existingIntake.save()
                    response = {
                        'status': True,
                        'intakeId': existingIntake.pk
                    }
                    return response
        except Exception as e:
            print("Fallo paso 3")
            print(e)
            response = {
                'status': False,
                'message': e
            }
            return response


"""
Intake creation data
Step four wizard

Attributes
----------

request: Request
"""
def createStepFour(request):
    if not request.user.is_authenticated:
        return render(request, 'waterproof_nbs_ca/waterproofnbsca_login_error.html')
    else:
        try:
            intakeId = request.POST.get('intakeId')
            edit = request.POST.get('edit')
            existingIntake = Intake.objects.get(id=intakeId)
            graphElementsString = request.POST.get('graphElements')
            graphElements = json.loads(graphElementsString)
            if (edit == 'false'):
                for element in graphElements:
                    if ('external' in element):
                        if (element['external'] == 'true'):
                            external_info = json.loads(element['externaldata'])
                            elementCreated = ElementSystem.objects.get(graphId=element['id'], intake=intakeId)
                            for external in external_info:
                                external_input = ValuesTime.objects.create(
                                    year=external['year'],
                                    water_volume=external['waterVol'],
                                    sediment=external['sediment'],
                                    nitrogen=external['nitrogen'],
                                    phosphorus=external['phosphorus'],
                                    element=elementCreated
                                )
                response = {
                    'status': True,
                    'intakeId': existingIntake.pk
                }
                return response
            else:
                actualElements = list(ElementSystem.objects.filter(
                    intake=existingIntake.pk).values_list('id', flat=True))
                if (len(actualElements) > 0):
                    for element in actualElements:
                        print(element)
                        el = ElementSystem.objects.get(id=element)
                        existingValuesTime = list(ValuesTime.objects.filter(element=el.pk).values_list('id', flat=True))
                        if (len(existingValuesTime) > 0):
                            for value in existingValuesTime:
                                val = ValuesTime.objects.get(id=value)
                                val.delete()

                for element in graphElements:
                    if ('external' in element):
                        if (element['external'] == 'true'):
                            external_info = json.loads(element['externaldata'])
                            elementCreated = ElementSystem.objects.get(graphId=element['id'], intake=intakeId)
                            print("External")
                            for external in external_info:
                                external_input = ValuesTime.objects.create(
                                    year=external['year'],
                                    water_volume=external['waterVol'],
                                    sediment=external['sediment'],
                                    nitrogen=external['nitrogen'],
                                    phosphorus=external['phosphorus'],
                                    element=elementCreated
                                )
                response = {
                    'status': True,
                    'intakeId': existingIntake.pk
                }
                return response
        except Exception as e:
            print(e)
            response = {
                'status': False,
                'message': e
            }
            return response


"""
Intake creation data
Step five wizard

Attributes
----------

request: Request
"""
def createStepFive(request):
    if not request.user.is_authenticated:
        return render(request, 'waterproof_nbs_ca/waterproofnbsca_login_error.html')
    else:
        try:
            intakeId = request.POST.get('intakeId')
            basinId = request.POST.get('basinId')
            existingIntake = Intake.objects.get(id=intakeId)
            intakeAreaString = request.POST.get('intakeAreaPolygon')
            delimitAreaString = request.POST.get('delimitArea')
            # True | False
            isFile = request.POST.get('isFile')
            # GeoJSON | SHP
            typeDelimitFile = request.POST.get('typeDelimit')
            if (isFile == 'true'):
                # Validate file's extension
                if (typeDelimitFile == 'geojson'):
                    delimitAreaJson = json.loads(delimitAreaString)
                    #print(delimitAreaJson)
                    for feature in delimitAreaJson['features']:
                        delimitAreaGeom = GEOSGeometry(str(feature['geometry']))
                    print('Delimitation file: geojson')
                # Shapefile
                else:
                    delimitAreaJson = json.loads(delimitAreaString)
                    for feature in delimitAreaJson['features']:
                        delimitAreaGeom = GEOSGeometry(str(feature['geometry']))
                    print('Delimitation file: shp')
            # Manually delimit
            else:
                delimitAreaJson = json.loads(delimitAreaString)
                delimitAreaGeom = GEOSGeometry(str(delimitAreaJson['geometry']))
            intakeGeomJson = json.loads(intakeAreaString)
            # Get intake original area
            for feature in intakeGeomJson['features']:
                intakeGeom = GEOSGeometry(str(feature['geometry']))
            
            delimitation_type = 'SBN'
            if (intakeGeom.equals(delimitAreaGeom)):  # Delimit geom equal to intake geom
                delimitation_type = 'CATCHMENT'
            
            existingPolygon = Polygon.objects.get(intake=existingIntake.pk)
            existingPolygon.geom = delimitAreaGeom
            existingPolygon. geomIntake = intakeAreaString
            existingPolygon.delimitation_date = datetime.datetime.now()
            existingPolygon.delimitation_type = delimitation_type
            existingPolygon.save()
            existingIntake.is_complete = True
            existingIntake.save()

            print ("Current User ID: %s" % request.user.pk)
            argsInvest = {
                'type': 'quality',
                'id_usuario': request.user.pk,
                'basin': basinId,
                'models': ['sdr','awy','ndr'],                
                'case': '-1', 
                'catchment': [existingIntake.pk],
            }
            argsWb = {
                'id_intake': existingIntake.pk
            }
            execInvest(requests, argsInvest)
            execWb(requests, argsWb)
            response = {
                'status': True,
                'intakeId': existingIntake.pk
            }
            return response
        except Exception as e:
            print(e)
            response = {
                'status': False,
                'message': e
            }
            return response

def listIntake(request):

    if request.method == 'GET':
        try:            
            city_id = request.GET['city']
        except:
            city_id = ''
        return intakes(request, city_id)


def get_geoms_intakes(intakes):
    intake_geoms = []
    for i in intakes:
        ig = dict()
        ig['id'] = i.pk
        if not i.polygon_set.first().geom is None:
            ig['geom'] = json.loads(i.polygon_set.first().geomIntake)['features'][0]['geometry'] # geom.geojson
            ig['name'] = i.name
        intake_geoms.append(ig)
    return intake_geoms

def intakes(request, city_id):
    # print ("total intakes: %s" % count)
    if request.user.is_authenticated:            
        userCountry = Countries.objects.get(iso3=request.user.country)
        region = Regions.objects.get(id=userCountry.region_id)

        if (request.user.professional_role == 'ADMIN'):
            if (city_id != ''):
                intakes = Intake.objects.filter(city=city_id)
            else:
                intakes = Intake.objects.all()

            intake_geoms = get_geoms_intakes(intakes)
            
            return render(
                request,
                'waterproof_intake/intake_list.html',
                {
                    'intakeList': intakes,
                    'userCountry': userCountry,
                    'region': region,
                    'intakes': json.dumps(intake_geoms)
                }
            )
        else:
            if (city_id != ''):
                intakes = Intake.objects.filter(city=city_id, added_by=request.user)            
            else:
                intakes = Intake.objects.filter(added_by=request.user)

            intake_geoms = get_geoms_intakes(intakes)

        if (request.user.professional_role == 'ANALYS'):
            return render(
                request,
                'waterproof_intake/intake_list.html',
                {
                    'intakeList': intakes,
                    'userCountry': userCountry,
                    'region': region,
                    'intakes': json.dumps(intake_geoms)
                }
            )

        if (request.user.professional_role == 'COPART'):
            return render(
                request,
                'waterproof_intake/intake_list.html',
                {
                    'intakeList': intakes,
                    'userCountry': userCountry,
                    'region': region
                }
            )

        if (request.user.professional_role == 'ACDMC'):
            return render(
                request,
                'waterproof_intake/intake_list.html',
                {
                    'intakeList': intakes,
                    'userCountry': userCountry,
                    'region': region
                }
            )

        if (request.user.professional_role == 'SCADM'):
            return render(
                request,
                'waterproof_intake/intake_list.html',
                {
                    'intakeList': intakes,
                    'userCountry': userCountry,
                    'region': region
                }
            )

        if (request.user.professional_role == 'MCOMC'):
            return render(
                request,
                'waterproof_intake/intake_list.html',
                {
                    'intakeList': intakes,
                    'userCountry': userCountry,
                    'region': region
                }
            )

        if (request.user.professional_role == 'CITIZN'):
            return render(
                request,
                'waterproof_intake/intake_list.html',
                {
                    'intakeList': intakes,
                    'userCountry': userCountry,
                    'region': region
                }
            )

        if (request.user.professional_role == 'REPECS'):
            return render(
                request,
                'waterproof_intake/intake_list.html',
                {
                    'intakeList': intakes,
                    'userCountry': userCountry,
                    'region': region
                }
            )

        if (request.user.professional_role == 'OTHER'):
            return render(
                request,
                'waterproof_intake/intake_list.html',
                {
                    'intakeList': intakes,
                    'userCountry': userCountry,
                    'region': region
                }
            )
    else:
        return render(
            request,
            'waterproof_intake/intake_list.html',
            {
                'intakes': [],
            }
        )

def profile_detail(request, username):
    profile = get_object_or_404(get_user_model(), Q(is_active=True), username=username)
    # combined queryset from each model content type

    access_token = None
    if request and request.user:
        access_token = get_or_create_token(request.user)
        if access_token and not access_token.is_expired():
            access_token = access_token.token
        else:
            access_token = None

    return render(request, "waterproof_intake/intake_list.html", {
        'access_token': access_token,
        "profile": profile,
    })

def editIntake(request, idx):
    #print("editIntake. request.method = %s" % request.method)
    if not request.user.is_authenticated:
        return render(request, 'waterproof_intake/intake_login_error.html')
    else:
        filterIntake = Intake.objects.get(id=idx)
        if request.method == 'GET':
            filterExternal = ElementSystem.objects.filter(intake=filterIntake.pk, is_external=True)
            extInputs = []
            extraction_result = []
            initial_extraction = 0
            final_extraction = 0

            for element in filterExternal:
                filterExtraction = ValuesTime.objects.filter(element=element.pk)
                extractionElements = []
                for extraction in filterExtraction:
                    extractionObject = {
                        'year': extraction.year,
                        'waterVol': extraction.water_volume,
                        'sediment': extraction.sediment,
                        'nitrogen': extraction.nitrogen,
                        'phosphorus': extraction.phosphorus
                    }
                    extractionElements.append(extractionObject)
                external = {
                    'name': element.name,
                    'xmlId': element.graphId,
                    'waterExtraction': extractionElements
                }
                # external['waterExtraction'] = extractionElements
                extInputs.append(external)
            intakeExtInputs = json.dumps(extInputs)
            demand = {}
            years = {}
            interpolation = ""
            if (not filterIntake.demand_parameters is None):
                demand = DemandParameters.objects.get(id=filterIntake.demand_parameters.pk)
                years = WaterExtraction.objects.filter(demand=filterIntake.demand_parameters.pk).order_by('year')
                interpolation = interpolations[filterIntake.demand_parameters.interpolation_type]
                initial_extraction = '{0:.2f}'.format(demand.initial_extraction).replace('.', ',')
                final_extraction = '{0:.2f}'.format(demand.ending_extraction).replace('.', ',')
                for y in years:
                    extraction_result.append([y.year, '{0:.2f}'.format(y.value).replace(',', '.')])
                print (extraction_result)
            currencies = Countries.objects.values('pk','currency', 'name', 'iso3').distinct().exclude(currency='').order_by('currency')
            return render(
                request, 'waterproof_intake/intake_edit.html',
                {
                    'intake': filterIntake,
                    'city': filterIntake.city,
                    'externalInputs': intakeExtInputs,
                    "serverApi": settings.WATERPROOF_API_SERVER,
                    'currencies': currencies,
                    'interpolation': interpolation,
                    'extraction_result': extraction_result,
                    'initial_extraction': initial_extraction,
                    'final_extraction': final_extraction,
                }
            )        
            
        # print("redirect with parameters, city =  %s" % filterIntake.city.pk)
        # response = redirect('/intake', city=filterIntake.city.pk)
        # return response
        return intakes(request, filterIntake.city.pk)


def viewIntake(request, idx):
    if request.method == 'GET':
        countries = Countries.objects.values('pk','currency', 'name', 'iso3').distinct().exclude(currency='').order_by('currency')
        filterIntake = Intake.objects.get(id=idx)
        filterExternal = ElementSystem.objects.filter(intake=filterIntake.pk, is_external=True)
        extInputs = []
        extraction_result = []
        initial_extraction = 0
        final_extraction = 0

        for element in filterExternal:
            filterExtraction = ValuesTime.objects.filter(element=element.pk)
            extractionElements = []
            for extraction in filterExtraction:
                extractionObject = {
                    'year': extraction.year,
                    'waterVol': extraction.water_volume,
                    'sediment': extraction.sediment,
                    'nitrogen': extraction.nitrogen,
                    'phosphorus': extraction.phosphorus
                }
                extractionElements.append(extractionObject)
            external = {
                'name': element.name,
                'xmlId': element.graphId,
                'waterExtraction': extractionElements
            }
            # external['waterExtraction'] = extractionElements
            extInputs.append(external)
        intakeExtInputs = json.dumps(extInputs)
        city = Cities.objects.all()
        demand = {}
        years = {}
        interpolation = ""
        if (not filterIntake.demand_parameters is None):
            demand = DemandParameters.objects.get(id=filterIntake.demand_parameters.pk)
            years = WaterExtraction.objects.filter(demand=filterIntake.demand_parameters.pk)
            interpolation = interpolations[filterIntake.demand_parameters.interpolation_type]
            initial_extraction = '{0:.2f}'.format(demand.initial_extraction).replace('.', ',')
            final_extraction = '{0:.2f}'.format(demand.ending_extraction).replace('.', ',')

            for y in years:
                extraction_result.append([y.year-1, '{0:.2f}'.format(y.value).replace('.', ',')])
        
        return render(
            request, 'waterproof_intake/intake_detail_list.html',
            {
                'intake': filterIntake,
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


def viewIntakeDemand(request, idx):
    if request.method == 'GET':
        intake = Intake.objects.get(id=idx)
       
        extraction_result = []
        initial_extraction = 0
        final_extraction = 0
        if (intake.demand_parameters is None):
            demand = {}
            years = {}
            interpolation = ""
        else:
            demand = DemandParameters.objects.get(id=intake.demand_parameters.pk)
            years = WaterExtraction.objects.filter(demand=intake.demand_parameters.pk).order_by('year')
            interpolation = interpolations[intake.demand_parameters.interpolation_type]
            initial_extraction = '{0:.2f}'.format(demand.initial_extraction).replace('.', ',')
            final_extraction = '{0:.2f}'.format(demand.ending_extraction).replace('.', ',')

            for y in years:
                extraction_result.append([y.year, '{0:.2f}'.format(y.value).replace('.', ',')])
        
        return render(
            request, 'waterproof_intake/intake_demand.html',
            {
                'intake': intake,
                'demand': demand,
                'interpolation': interpolation,
                'extraction_result': extraction_result,
                'initial_extraction': initial_extraction,
                'final_extraction': final_extraction,
            }
        )


def cloneIntake(request, idx):

    if not request.user.is_authenticated:
        return render(request, 'waterproof_intake/intake_login_error.html')
    else:
        filterIntake = Intake.objects.get(id=idx)
        if request.method == 'GET':
            currencies = Countries.objects.values('pk','currency', 'name', 'iso3').distinct().exclude(currency='').order_by('currency')
            countries = currencies
            filterElementSystem = ElementSystem.objects.filter(intake=filterIntake.pk)
            filterPolygon = Polygon.objects.get(intake=filterIntake.pk)
            try:
                now = datetime.datetime.now()
                newIntake = Intake.objects.create(
                    name=filterIntake.name,
                    description=filterIntake.description,
                    water_source_name=filterIntake.water_source_name,
                    city=filterIntake.city,
                    xml_graph=filterIntake.xml_graph,                    
                    creation_date=now,
                    updated_date=now,
                    added_by=filterIntake.added_by
                )
                # print(filterPolygon)
                newPolygon = Polygon.objects.create(
                    area=filterPolygon.area,
                    geom=filterPolygon.geom,
                    geomIntake=filterPolygon.geomIntake,
                    geomPoint=filterPolygon.geomPoint,
                    delimitation_date=filterPolygon.delimitation_date,
                    delimitation_type=filterPolygon.delimitation_type,
                    basin=filterPolygon.basin,
                    intake=newIntake
                )
            except Exception as e:
                print(e)
            try:
                if (filterIntake.demand_parameters != None):
                    demandParameter = DemandParameters.objects.get(id=filterIntake.demand_parameters.pk)
                    newDemandParameter = DemandParameters.objects.create(
                        interpolation_type=demandParameter.interpolation_type,
                        initial_extraction=demandParameter.initial_extraction,
                        ending_extraction=demandParameter.ending_extraction,
                        years_number=demandParameter.years_number,
                        is_manual=demandParameter.is_manual,

                    )
                    newIntake.demand_parameters = newDemandParameter
                    filterWaterExtraction = WaterExtraction.objects.filter(demand=demandParameter.pk)
                    for extraction in filterWaterExtraction:
                        newWaterExtraction = WaterExtraction.objects.create(
                            year=extraction.year,
                            value=extraction.value,
                            demand=newDemandParameter
                        )
                for element in filterElementSystem:
                    newElement = ElementSystem.objects.create(
                        graphId=element.graphId,
                        name=element.name,
                        normalized_category=element.normalized_category,
                        transported_water=element.transported_water,
                        sediment=element.sediment,
                        nitrogen=element.nitrogen,
                        phosphorus=element.phosphorus,
                        is_external=element.is_external,
                        intake=newIntake,
                        awy=element.awy,
                        q_l_s=element.q_l_s,
                        wsed_ton=element.wsed_ton,
                        wn_kg=element.wn_kg,
                        wp_kg=element.wp_kg,
                        csed_mg_l=element.csed_mg_l,
                        cn_mg_l=element.cn_mg_l,
                        cp_mg_l=element.cp_mg_l,
                        wsed_ret_ton=element.wsed_ret_ton,
                        wn_ret_kg=element.wn_ret_kg,
                        wp_ret_ton=element.wp_ret_ton
                    )
                    if (newElement.is_external == True):
                        filterValuesTime = ValuesTime.objects.filter(element=element.pk)
                        for value in filterValuesTime:
                            print(value)
                            newValuesTime = ValuesTime.objects.create(
                                year=value.year,
                                water_volume=value.water_volume,
                                sediment=value.sediment,
                                nitrogen=value.nitrogen,
                                phosphorus=value.phosphorus,
                                element=newElement
                            )
                newIntake.save()
            except Exception as e:
                print(e)
            print("Intake pk::: %s", newIntake.pk)
            
            filterExternal = ElementSystem.objects.filter(intake=newIntake.pk, is_external=True)
            extInputs = []
            extraction_result = []
            initial_extraction = 0
            final_extraction = 0

            for element in filterExternal:
                filterExtraction = ValuesTime.objects.filter(element=element.pk)
                extractionElements = []
                for extraction in filterExtraction:
                    extractionObject = {
                        'year': extraction.year,
                        'waterVol': extraction.water_volume,
                        'sediment': extraction.sediment,
                        'nitrogen': extraction.nitrogen,
                        'phosphorus': extraction.phosphorus
                    }
                    extractionElements.append(extractionObject)
                external = {
                    'name': element.name,
                    'xmlId': element.graphId,
                    'waterExtraction': extractionElements
                }
                # external['waterExtraction'] = extractionElements
                extInputs.append(external)
            intakeExtInputs = json.dumps(extInputs)
            demand = {}
            years = {}
            interpolation = ""
            if (not filterIntake.demand_parameters is None):
                demand = DemandParameters.objects.get(id=filterIntake.demand_parameters.pk)
                years = WaterExtraction.objects.filter(demand=filterIntake.demand_parameters.pk).order_by('year')
                interpolation = interpolations[filterIntake.demand_parameters.interpolation_type]
                initial_extraction = '{0:.2f}'.format(demand.initial_extraction).replace('.', ',')
                final_extraction = '{0:.2f}'.format(demand.ending_extraction).replace('.', ',')
                for y in years:
                    extraction_result.append([y.year, '{0:.2f}'.format(y.value).replace(',', '.')])
                print (extraction_result)

            form = forms.IntakeForm()
            return render(
                request, 'waterproof_intake/intake_clone.html',
                {
                    'intake': newIntake,
                    'city': filterIntake.city,
                    'externalInputs': intakeExtInputs,
                    "serverApi": settings.WATERPROOF_API_SERVER,
                    'currencies': currencies,
                    'countries': countries,
                    'interpolation': interpolation,
                    'extraction_result': extraction_result,
                    'initial_extraction': initial_extraction,
                    'final_extraction': final_extraction
                }
            )
        else:
            return intakes(request, filterIntake.city.pk)            

def deleteIntake(request, idx):
    if request.method == "POST":
        print(idx)
        intake = Intake.objects.get(id=idx)
        if not intake:
            print("Not found")
            context = {
                'status': '400', 'reason': 'Intake not found'
            }
            response = HttpResponse(json.dumps(context), content_type='application/json')
            response.status_code = 400
            return response
        else:
            # delete object
            print(intake.delete())
            # after deleting redirect to
            # home page
            context = {
                'status': '200', 'reason': 'sucess'
            }
            response = HttpResponse(json.dumps(context), content_type='application/json')
            response.status_code = 200
            return response

def viewDiagram(request, idx):
    if request.method == 'GET':
        filterIntake = Intake.objects.get(id=idx)
        filterExternal = ElementSystem.objects.filter(intake=filterIntake.pk, is_external=True)
        extInputs = []

        for element in filterExternal:
            filterExtraction = ValuesTime.objects.filter(element=element.pk)
            extractionElements = []
            for extraction in filterExtraction:
                extractionObject = {
                    'year': extraction.year,
                    'waterVol': extraction.water_volume,
                    'sediment': extraction.sediment,
                    'nitrogen': extraction.nitrogen,
                    'phosphorus': extraction.phosphorus
                }
                extractionElements.append(extractionObject)
            external = {
                'name': element.name,
                'xmlId': element.graphId,
                'waterExtraction': extractionElements
            }
            
            extInputs.append(external)
        intakeExtInputs = json.dumps(extInputs)
        return render(
            request, 'waterproof_intake/intake_diagram.html',
            {
                'intake': filterIntake,                
                'externalInputs': intakeExtInputs,                
            }
        )

""""""""""""""""""""""
Execute Invest API

Attributes
----------
request
args:   Object
    type:       string
    id_usuario: int
    basin:      int
    models:     string
    catchment   int
"""""""""""""""""""""


def execInvest(request, args):
    print("exectInvest ::")
    
    url = settings.WATERPROOF_INVEST_API+'execInvest'
    print("URL = %s" % url)
    print(args)
    r = request.get(url, params=args, verify=False)
    if r.status_code == 200:
        print("Resultado correcto Exec Invest:::")
        print(r.text)
    else:
        print("Error ejecutando Invest:::")
        print(r.text)

def execInvestPost(request, args):
    print("execInvestPost ::")
    
    url = settings.WATERPROOF_INVEST_API+'task-exec-invest'
    print("URL = %s" % url)
    print(args)
    jsonObject = json.dumps(args)
    r = request.post(url, data=jsonObject, verify=False)
    if r.status_code == 200:
        print("Resultado correcto Exec Invest:::")
        print(r.text)
    else:
        print("Error ejecutando Invest:::")
        print(r.text)


""""""""""""""""""""""
Execute Water Balance API

Attributes
----------
request
catchment:  Int Intake id
"""""""""""""""""""""


def execWb(request, args):
    print ("execWb :: init")
    url = settings.WATERPROOF_INVEST_API+'wb'
    print ("URL = %s" % url)
    print (args)
    r = request.get(url, params=args, verify=False)
    if r.status_code == 200:
        print("Resultado correcto WB:::")
        print(r.text)
    else:
        print("Error ejecutando WB:::")
        print(r.text)


"""
Load process by category

Attributes
----------
cagegory: string Category
"""


def loadProcessEfficiency(request, category):
    process = ProcessEfficiencies.objects.filter(normalized_category=category)
    process_serialized = serializers.serialize('json', process)
    return JsonResponse(process_serialized, safe=False)


"""
Load Cost function by category

Attributes
----------
cagegory: string Category
"""


def loadCostFunctionsProcess(request, symbol):
    function = CostFunctionsProcess.objects.filter(symbol=symbol)
    function_serialized = serializers.serialize('json', function)
    return JsonResponse(function_serialized, safe=False)


"""
Validate polygon geometry

Attributes
----------
geometry: geoJSON
    Polygon geometry
"""


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
    print("Is file delimitation?:"+isFile)
    # Validate if delimited by file or manually
    if (isFile == 'true'):
        # Validate file's extension
        if (typeDelimitFile == 'geojson'):
            editableGeomJson = json.loads(editableGeomString)
            print(editableGeomJson)
            for feature in editableGeomJson['features']:
                editableGeometry = GEOSGeometry(str(feature['geometry']))
            print('geojson')
        # Shapefile
        else:
            editableGeomJson = json.loads(editableGeomString)
            for feature in editableGeomJson['features']:
                editableGeometry = GEOSGeometry(str(feature['geometry']))
            print('shp')
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


def compareMaps(request):

    return render(
                request,
                'waterproof_intake/intake_compare_maps.html',
                {
                    'test': 'test',
                }
            )