"""
Views for the ``Waterproof intake`` application.

"""

import logging

from django.conf import settings
from django.urls import reverse
from django.contrib import messages
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.shortcuts import render, redirect, get_object_or_404
from django.utils.translation import ugettext as _
from .models import ValuesTime, ProcessEfficiencies, Intake, DemandParameters, WaterExtraction, ElementSystem, ValuesTime, CostFunctionsProcess, Polygon, Basins, ElementConnections, userCostFunctions
from geonode.waterproof_parameters.models import Countries, Regions, Cities
from django.contrib.gis.gdal import SpatialReference, CoordTransform
from django.core import serializers
from django.http import JsonResponse
from . import forms
from types import SimpleNamespace
import simplejson as json
from django.contrib.gis.geos import GEOSGeometry
from django.contrib.gis.gdal import OGRGeometry
import datetime
import requests
logger = logging.getLogger(__name__)

"""
Create Waterproof intake

Attributes
----------
request: Request
"""


def createIntake(request):
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
        else:
            print("Error step doesn't exits")

        form = forms.IntakeForm(request.POST)
        """
        if form.is_valid():
            intake = form.save(commit=False)
            intakeCity = request.POST.get('intakeCity')
            xmlGraph = request.POST.get('xmlGraph')
            # True | False
            isFile = request.POST.get('isFile')
            # GeoJSON | SHP
            typeDelimitFile = request.POST.get('typeDelimit')
            basinId = request.POST.get('basinId')
            interpolationString = request.POST.get('waterExtraction')
            interpolation = json.loads(interpolationString)
            delimitAreaString = request.POST.get('delimitArea')
            intakeAreaString = request.POST.get('intakeAreaPolygon')
            pointIntakeString = request.POST.get('pointIntake')
            graphElementsString = request.POST.get('graphElements')
            connectionsElementString = request.POST.get('graphConnections')
            graphElements = json.loads(graphElementsString)
            connectionsElements = json.loads(connectionsElementString)
            if (isFile == 'true'):
                # Validate file's extension
                if (typeDelimitFile == 'geojson'):
                    delimitAreaJson = json.loads(delimitAreaString)
                    print(delimitAreaJson)
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
            pointIntakeJson = json.loads(pointIntakeString)
            # Get intake original area
            for feature in intakeGeomJson['features']:
                intakeGeom = GEOSGeometry(str(feature['geometry']))
            # Get the intake point geom
            pointIntakeGeom = GEOSGeometry(str(pointIntakeJson['geometry']))

            if (intakeGeom.equals(delimitAreaGeom)):  # Delimit geom equal to intake geom
                delimitation_type = 'CATCHMENT'
            else:
                delimitation_type = 'SBN'

            if (interpolation['typeInterpolation'] == 'MANUAL'):
                print("IS MANUAL")
                isManual = True
                interpolation['initialValue'] = 0
                interpolation['finalValue'] = 0
            else:
                isManual = False

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
            intake.xml_graph = xmlGraph
            intake.city = Cities.objects.get(id=intakeCity)
            intake.demand_parameters = demand_parameters
            intake.creation_date = datetime.datetime.now()
            intake.updated_date = datetime.datetime.now()
            intake.added_by = request.user
            intake.save()
            intakeCreated = Intake.objects.get(id=intake.pk)
            print("Basin Id:"+basinId)
            print("Delimitation type:"+delimitation_type)
            basin = Basins.objects.get(id=basinId)
            intakePolygon = Polygon.objects.create(
                area=0,
                geom=delimitAreaGeom,
                geomIntake=intakeAreaString,
                geomPoint=pointIntakeString,
                delimitation_date=datetime.datetime.now(),
                delimitation_type=delimitation_type,
                basin=basin,
                intake=intakeCreated
            )
            elementsCreated = []
            # Save all graph elements
            for element in graphElements:
                if ('external' in element):
                    # Regular element
                    if (element['external'] == 'false'):
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
                            intake=intakeCreated
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
                                    userCostFunctions.objects.create(
                                        function=function['fields']['function_value'],
                                        template_function=templateFunction,
                                        user=request.user
                                    )
                    # External element
                    else:
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
                                is_external=True,
                                intake=intakeCreated
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
                                        userCostFunctions.objects.create(
                                            function=function['fields']['function_value'],
                                            template_function=templateFunction,
                                            user=request.user
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
                                intake=intakeCreated
                            )
                            elementC = {}
                            elementC['pk'] = element_system.pk
                            elementC['xmlId'] = element_system.graphId
                            elementsCreated.append(elementC)
                        external_info = json.loads(element['externaldata'])
                        elementCreated = ElementSystem.objects.get(id=element_system.pk)
                        for external in external_info:
                            external_input = ValuesTime.objects.create(
                                year=external['year'],
                                water_volume=external['waterVol'],
                                sediment=external['sediment'],
                                nitrogen=external['nitrogen'],
                                phosphorus=external['phosphorus'],
                                element=elementCreated
                            )
                # Connections
                else:
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
                            intake=intakeCreated
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
                                    userCostFunctions.objects.create(
                                        function=function['fields']['function_value'],
                                        template_function=templateFunction,
                                        user=request.user
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
            argsInvest = {
                'type': 'quality',
                'id_usuario': 1,
                'basin': basin.pk,
                'models': 'sdr',
                'models': 'awy',
                'models': 'ndr',
                'models': 'carbon',
                'catchment': intakeCreated.pk,
            }
            argsWb = {
                'id_intake': intakeCreated.pk
            }
            execInvest(requests, argsInvest)
            execWb(requests, argsWb)
            messages.success(request, ("Water Intake created."))
            return HttpResponseRedirect(reverse('list-intake'))
        else:
            messages.error(request, ("Water Intake not created."))
            return HttpResponseRedirect(request, 'waterproof_intake/intake_list.html')
    """
    else:
        form = forms.IntakeForm()
        currencies = Countries.objects.all()

    return render(request, 'waterproof_intake/intake_form.html', context={
        "form": form, "serverApi": settings.WATERPROOF_API_SERVER,
        'currencies': currencies,
    })


"""
Intake creation data
Step one wizard

Attributes
----------
request: Request
"""


def createStepOne(request):
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
            existingIntake.save()
            actualElements = list(ElementSystem.objects.filter(
                intake=existingIntake.pk).values_list('id', flat=True))
            print(existingIntake.pk)
            if (len(actualElements) > 0):
                for element in actualElements:
                    el = ElementSystem.objects.get(id=element)
                    existingValuesTime = list(ValuesTime.objects.filter(element=el.pk).values_list('id', flat=True))
                    for value in existingValuesTime:
                        val = ValuesTime.objects.get(id=value)
                        val.delete()
                    el.delete()
                
           
            elementsCreated = []
            # Save all graph elements
            for element in graphElements:
                if ('external' in element):
                    try:
                        # Regular element
                        if (element['external'] == 'false'):
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
                                if (len(costFunction) > 0):
                                    for function in costFunction:
                                        templateFunction = CostFunctionsProcess.objects.get(id=function['pk'])
                                        userCostFunctions.objects.create(
                                            function=function['fields']['function_value'],
                                            template_function=templateFunction,
                                            user=request.user
                                        )
                    except Exception as e:
                        print(e) 
                    # External element
                    else:
                        parameter = json.loads(element['resultdb'])
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
                                            userCostFunctions.objects.create(
                                                function=function['fields']['function_value'],
                                                template_function=templateFunction,
                                                user=request.user
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
                                elementC = {}
                                elementC['pk'] = element_system.pk
                                elementC['xmlId'] = element_system.graphId
                                elementsCreated.append(elementC)
                            
                        except Exception as e:
                            print(e) 
                    # Connections
                else:
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
                            if (len(costFunction) > 0):
                                for function in costFunction:
                                    templateFunction = CostFunctionsProcess.objects.get(id=function['pk'])
                                    userCostFunctions.objects.create(
                                        function=function['fields']['function_value'],
                                        template_function=templateFunction,
                                        user=request.user
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
            existingIntake = Intake.objects.get(id=intakeId)
            interpolationString = request.POST.get('waterExtraction')
            interpolation = json.loads(interpolationString)
            if (interpolation['typeInterpolation'] == 'MANUAL'):
                print("IS MANUAL")
                isManual = True
                interpolation['initialValue'] = 0
                interpolation['finalValue'] = 0
            else:
                isManual = False

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
            existingIntake = Intake.objects.get(id=intakeId)
            graphElementsString = request.POST.get('graphElements')
            graphElements = json.loads(graphElementsString)
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
                    print(delimitAreaJson)
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
            if (intakeGeom.equals(delimitAreaGeom)):  # Delimit geom equal to intake geom
                delimitation_type = 'CATCHMENT'
            else:
                delimitation_type = 'SBN'

            existingPolygon = Polygon.objects.get(intake=existingIntake.pk)
            existingPolygon.geom = delimitAreaGeom
            existingPolygon. geomIntake = intakeAreaString
            existingPolygon.delimitation_date = datetime.datetime.now()
            existingPolygon.delimitation_type = delimitation_type
            existingPolygon.save()
            existingIntake.is_complete = True
            existingIntake.save()
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
        if request.user.is_authenticated:
            if (request.user.professional_role == 'ADMIN'):
                userCountry = Countries.objects.get(iso3=request.user.country)
                region = Regions.objects.get(id=userCountry.region_id)
                intake = Intake.objects.all()
                city = Cities.objects.all()
                return render(
                    request,
                    'waterproof_intake/intake_list.html',
                    {
                        'intakeList': intake,
                        'city': city,
                        'userCountry': userCountry,
                        'region': region
                    }
                )

            if (request.user.professional_role == 'ANALYS'):
                intake = Intake.objects.all()
                userCountry = Countries.objects.get(iso3=request.user.country)
                region = Regions.objects.get(id=userCountry.region_id)
                city = Cities.objects.all()
                return render(
                    request,
                    'waterproof_intake/intake_list.html',
                    {
                        'intakeList': intake,
                        'city': city,
                        'userCountry': userCountry,
                        'region': region
                    }
                )

            if (request.user.professional_role == 'COPART'):
                intake = Intake.objects.all()
                userCountry = Countries.objects.get(iso3=request.user.country)
                region = Regions.objects.get(id=userCountry.region_id)
                city = Cities.objects.all()
                return render(
                    request,
                    'waterproof_intake/intake_list.html',
                    {
                        'intakeList': intake,
                        'city': city,
                        'userCountry': userCountry,
                        'region': region
                    }
                )

            if (request.user.professional_role == 'ACDMC'):
                intake = Intake.objects.all()
                userCountry = Countries.objects.get(iso3=request.user.country)
                region = Regions.objects.get(id=userCountry.region_id)
                city = Cities.objects.all()
                return render(
                    request,
                    'waterproof_intake/intake_list.html',
                    {
                        'intakeList': intake,
                        'city': city,
                        'userCountry': userCountry,
                        'region': region
                    }
                )

            if (request.user.professional_role == 'SCADM'):
                intake = Intake.objects.all()
                userCountry = Countries.objects.get(iso3=request.user.country)
                region = Regions.objects.get(id=userCountry.region_id)
                city = Cities.objects.all()
                return render(
                    request,
                    'waterproof_intake/intake_list.html',
                    {
                        'intakeList': intake,
                        'city': city,
                        'userCountry': userCountry,
                        'region': region
                    }
                )

            if (request.user.professional_role == 'MCOMC'):
                intake = Intake.objects.all()
                userCountry = Countries.objects.get(iso3=request.user.country)
                region = Regions.objects.get(id=userCountry.region_id)
                city = Cities.objects.all()
                return render(
                    request,
                    'waterproof_intake/intake_list.html',
                    {
                        'intakeList': intake,
                        'city': city,
                        'userCountry': userCountry,
                        'region': region
                    }
                )

            if (request.user.professional_role == 'CITIZN'):
                intake = Intake.objects.all()
                userCountry = Countries.objects.get(iso3=request.user.country)
                region = Regions.objects.get(id=userCountry.region_id)
                city = Cities.objects.all()
                return render(
                    request,
                    'waterproof_intake/intake_list.html',
                    {
                        'intakeList': intake,
                        'city': city,
                        'userCountry': userCountry,
                        'region': region
                    }
                )

            if (request.user.professional_role == 'REPECS'):
                intake = Intake.objects.all()
                userCountry = Countries.objects.get(iso3=request.user.country)
                region = Regions.objects.get(id=userCountry.region_id)
                city = Cities.objects.all()
                return render(
                    request,
                    'waterproof_intake/intake_list.html',
                    {
                        'intakeList': intake,
                        'city': city,
                        'userCountry': userCountry,
                        'region': region
                    }
                )

            if (request.user.professional_role == 'OTHER'):
                intake = Intake.objects.all()
                userCountry = Countries.objects.get(iso3=request.user.country)
                region = Regions.objects.get(id=userCountry.region_id)
                city = Cities.objects.all()
                return render(
                    request,
                    'waterproof_intake/intake_list.html',
                    {
                        'intakeList': intake,
                        'city': city,
                        'userCountry': userCountry,
                        'region': region
                    }
                )
        else:
            intake = Intake.objects.all()
            userCountry = Countries.objects.get(iso3='COL')
            region = Regions.objects.get(id=userCountry.region_id)
            city = Cities.objects.all()
            return render(
                request,
                'waterproof_intake/intake_list.html',
                {
                    'intakeList': intake,
                    'city': city,
                }
            )


def editIntake(request, idx):
    if not request.user.is_authenticated:
        return render(request, 'waterproof_intake/intake_login_error.html')
    else:
        if request.method == 'GET':
            countries = Countries.objects.all()
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
                # external['waterExtraction'] = extractionElements
                extInputs.append(external)
            intakeExtInputs = json.dumps(extInputs)
            city = Cities.objects.all()
            form = forms.IntakeForm()
            return render(
                request, 'waterproof_intake/intake_edit.html',
                {
                    'intake': filterIntake,
                    'countries': countries,
                    'city': city,
                    'externalInputs': intakeExtInputs,
                    "serverApi": settings.WATERPROOF_API_SERVER
                }
            )
        else:
            print("Proceso de guardado")
            form = forms.IntakeForm(request.POST)
            if form.is_valid():
                intake = form.save(commit=False)
                xmlGraph = request.POST.get('xmlGraph')
                intakeCity = request.POST.get('intakeCity')
                # True | False
                isFile = request.POST.get('isFile')
                # GeoJSON | SHP
                typeDelimitFile = request.POST.get('typeDelimit')
                basinId = request.POST.get('basinId')
                interpolationString = request.POST.get('waterExtraction')
                interpolation = json.loads(interpolationString)
                delimitAreaString = request.POST.get('delimitArea')
                intakeAreaString = request.POST.get('intakeAreaPolygon')
                pointIntakeString = request.POST.get('pointIntake')
                graphElementsString = request.POST.get('graphElements')
                connectionsElementString = request.POST.get('graphConnections')
                graphElements = json.loads(graphElementsString)
                connectionsElements = json.loads(connectionsElementString)
                if (isFile == 'true'):
                    # Validate file's extension
                    if (typeDelimitFile == 'geojson'):
                        delimitAreaJson = json.loads(delimitAreaString)
                        print(delimitAreaJson)
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
                pointIntakeJson = json.loads(pointIntakeString)
                # Get intake original area
                for feature in intakeGeomJson['features']:
                    intakeGeom = GEOSGeometry(str(feature['geometry']))
                # Get the intake point geom
                pointIntakeGeom = GEOSGeometry(str(pointIntakeJson['geometry']))

                if (intakeGeom.equals(delimitAreaGeom)):  # Delimit geom equal to intake geom
                    delimitation_type = 'CATCHMENT'
                else:
                    delimitation_type = 'SBN'

                basin = Basins.objects.get(id=basinId)
                existingIntake = Intake.objects.get(id=idx)
                existingIntake.name = intake.name
                existingIntake.description = intake.description
                existingIntake.water_source_name = intake.water_source_name
                existingIntake.xml_graph = xmlGraph
                existingIntake.added_by = request.user
                existingIntake.city = Cities.objects.get(id=intakeCity)
                existingIntake.save()
                existingPolygon = Polygon.objects.get(intake=existingIntake.pk)
                existingPolygon.geom = delimitAreaGeom
                existingPolygon. geomIntake = intakeAreaString
                existingPolygon.geomPoint = pointIntakeString
                existingPolygon.delimitation_date = datetime.datetime.now()
                existingPolygon.delimitation_type = delimitation_type
                existingPolygon.basin = basin
                existingPolygon.intake = existingIntake
                existingPolygon.save()
                print(interpolation)
                if (interpolation['typeInterpolation'] == 'MANUAL'):
                    print("IS MANUAL")
                    isManual = True
                    interpolation['initialValue'] = 0
                    interpolation['finalValue'] = 0
                else:
                    isManual = False
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
                actualElements = list(ElementSystem.objects.filter(
                    intake=existingIntake.pk).values_list('id', flat=True))
                for element in actualElements:
                    el = ElementSystem.objects.get(id=element)
                    existingValuesTime = list(ValuesTime.objects.filter(element=el.pk).values_list('id', flat=True))
                    for value in existingValuesTime:
                        val = ValuesTime.objects.get(id=value)
                        val.delete()
                    el.delete()
                elementsCreated = []
                # Save all graph elements
                for element in graphElements:
                    if ('external' in element):
                        # Regular element
                        if (element['external'] == 'false'):
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
                                if (len(costFunction) > 0):
                                    for function in costFunction:
                                        templateFunction = CostFunctionsProcess.objects.get(id=function['pk'])
                                        userCostFunctions.objects.create(
                                            function=function['fields']['function_value'],
                                            template_function=templateFunction,
                                            user=request.user
                                        )
                        # External element
                        else:
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
                                            userCostFunctions.objects.create(
                                                function=function['fields']['function_value'],
                                                template_function=templateFunction,
                                                user=request.user
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
                                elementC = {}
                                elementC['pk'] = element_system.pk
                                elementC['xmlId'] = element_system.graphId
                                elementsCreated.append(elementC)
                            external_info = json.loads(element['externaldata'])
                            elementCreated = ElementSystem.objects.get(id=element_system.pk)
                            for external in external_info:
                                print("External data info::::")
                                print(external)
                                external_input = ValuesTime.objects.create(
                                    year=external['year'],
                                    water_volume=external['waterVol'],
                                    sediment=external['sediment'],
                                    nitrogen=external['nitrogen'],
                                    phosphorus=external['phosphorus'],
                                    element=elementCreated
                                )
                    # Connections
                    else:
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
                                if (len(costFunction) > 0):
                                    for function in costFunction:
                                        templateFunction = CostFunctionsProcess.objects.get(id=function['pk'])
                                        userCostFunctions.objects.create(
                                            function=function['fields']['function_value'],
                                            template_function=templateFunction,
                                            user=request.user
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
            argsInvest = {
                'type': 'quality',
                'id_usuario': 1,
                'basin': basin.pk,
                'models': 'sdr',
                'models': 'awy',
                'models': 'ndr',
                'models': 'carbon',
                'catchment': existingIntake.pk,
            }
            argsWb = {
                'id_intake': existingIntake.pk
            }
            execInvest(requests, argsInvest)
            execWb(requests, argsWb)
            messages.success(request, ("Water Intake edited."))
            return HttpResponseRedirect(reverse('list-intake'))


def viewIntake(request, idx):
    if request.method == 'GET':
        countries = Countries.objects.all()
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
            # external['waterExtraction'] = extractionElements
            extInputs.append(external)
        intakeExtInputs = json.dumps(extInputs)
        city = Cities.objects.all()
        form = forms.IntakeForm()
        return render(
            request, 'waterproof_intake/intake_detail_list.html',
            {
                'intake': filterIntake,
                'countries': countries,
                'city': city,
                'externalInputs': intakeExtInputs,
                "serverApi": settings.WATERPROOF_API_SERVER
            }
        )


def viewIntakeDemand(request, idx):
    if request.method == 'GET':
        filterIntake = Intake.objects.get(id=idx)
        filterExternal = ElementSystem.objects.filter(intake=filterIntake.pk, is_external=True)
        intakeDemand = DemandParameters.objects.get(id=filterIntake.demand_parameters.pk)
        yearsDemand = WaterExtraction.objects.filter(demand=filterIntake.demand_parameters.pk)
        for year in yearsDemand:
            print(year.value)

        return render(
            request, 'waterproof_intake/intake_demand.html',
            {
                'intake': filterIntake,
                'demand': intakeDemand,
                'yeardDemand': yearsDemand
            }
        )


def cloneIntake(request, idx):
    if not request.user.is_authenticated:
        return render(request, 'waterproof_intake/intake_login_error.html')
    else:
        if request.method == 'GET':
            countries = Countries.objects.all()
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
                # external['waterExtraction'] = extractionElements
                extInputs.append(external)
            intakeExtInputs = json.dumps(extInputs)
            city = Cities.objects.all()
            form = forms.IntakeForm()
            return render(
                request, 'waterproof_intake/intake_clone.html',
                {
                    'intake': filterIntake,
                    'countries': countries,
                    'city': city,
                    'externalInputs': intakeExtInputs,
                    "serverApi": settings.WATERPROOF_API_SERVER
                }
            )
        else:
            form = forms.IntakeForm(request.POST)
            if form.is_valid():
                intake = form.save(commit=False)
                xmlGraph = request.POST.get('xmlGraph')
                intakeCity = request.POST.get('intakeCity')
                # True | False
                isFile = request.POST.get('isFile')
                # GeoJSON | SHP
                typeDelimitFile = request.POST.get('typeDelimit')
                basinId = request.POST.get('basinId')
                interpolationString = request.POST.get('waterExtraction')
                interpolation = json.loads(interpolationString)
                delimitAreaString = request.POST.get('delimitArea')
                intakeAreaString = request.POST.get('intakeAreaPolygon')
                pointIntakeString = request.POST.get('pointIntake')
                graphElementsString = request.POST.get('graphElements')
                connectionsElementString = request.POST.get('graphConnections')
                graphElements = json.loads(graphElementsString)
                connectionsElements = json.loads(connectionsElementString)
                if (isFile == 'true'):
                    # Validate file's extension
                    if (typeDelimitFile == 'geojson'):
                        delimitAreaJson = json.loads(delimitAreaString)
                        print(delimitAreaJson)
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
                pointIntakeJson = json.loads(pointIntakeString)
                # Get intake original area
                for feature in intakeGeomJson['features']:
                    intakeGeom = GEOSGeometry(str(feature['geometry']))
                # Get the intake point geom
                pointIntakeGeom = GEOSGeometry(str(pointIntakeJson['geometry']))

                if (intakeGeom.equals(delimitAreaGeom)):  # Delimit geom equal to intake geom
                    delimitation_type = 'CATCHMENT'
                else:
                    delimitation_type = 'SBN'

                demand_parameters = DemandParameters.objects.create(
                    interpolation_type=interpolation['typeInterpolation'],
                    initial_extraction=interpolation['initialValue'],
                    ending_extraction=interpolation['finalValue'],
                    years_number=interpolation['yearCount'],
                    is_manual=True,
                )

                for extraction in interpolation['yearValues']:
                    water_extraction = WaterExtraction.objects.create(
                        year=extraction['year'],
                        value=extraction['value'],
                        demand=demand_parameters
                    )
                intake.xml_graph = xmlGraph
                intake.city = Cities.objects.get(id=intakeCity)
                intake.demand_parameters = demand_parameters
                intake.creation_date = datetime.datetime.now()
                intake.updated_date = datetime.datetime.now()
                intake.added_by = request.user
                intake.save()
                intakeCreated = Intake.objects.get(id=intake.pk)
                print("Basin Id:"+basinId)
                print("Delimitation type:"+delimitation_type)
                basin = Basins.objects.get(id=basinId)
                intakePolygon = Polygon.objects.create(
                    area=0,
                    geom=delimitAreaGeom,
                    geomIntake=intakeAreaString,
                    geomPoint=pointIntakeString,
                    delimitation_date=datetime.datetime.now(),
                    delimitation_type=delimitation_type,
                    basin=basin,
                    intake=intakeCreated
                )
                elementsCreated = []
                # Save all graph elements
                for element in graphElements:
                    if ('external' in element):
                        # Regular element
                        if (element['external'] == 'false'):
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
                                intake=intakeCreated
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
                                        userCostFunctions.objects.create(
                                            function=function['fields']['function_value'],
                                            template_function=templateFunction,
                                            user=request.user
                                        )
                        # External element
                        else:
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
                                    is_external=True,
                                    intake=intakeCreated
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
                                            userCostFunctions.objects.create(
                                                function=function['fields']['function_value'],
                                                template_function=templateFunction,
                                                user=request.user
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
                                    intake=intakeCreated
                                )
                                elementC = {}
                                elementC['pk'] = element_system.pk
                                elementC['xmlId'] = element_system.graphId
                                elementsCreated.append(elementC)
                            external_info = json.loads(element['externaldata'])
                            print(external_info)
                            elementCreated = ElementSystem.objects.get(id=element_system.pk)
                            for external in external_info:
                                external_input = ValuesTime.objects.create(
                                    year=external['year'],
                                    water_volume=external['waterVol'],
                                    sediment=external['sediment'],
                                    nitrogen=external['nitrogen'],
                                    phosphorus=external['phosphorus'],
                                    element=elementCreated
                                )
                    # Connections
                    else:
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
                                intake=intakeCreated
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
                                        userCostFunctions.objects.create(
                                            function=function['fields']['function_value'],
                                            template_function=templateFunction,
                                            user=request.user
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
                argsInvest = {
                    'type': 'quality',
                    'id_usuario': 1,
                    'basin': basin.pk,
                    'models': 'sdr',
                    'models': 'awy',
                    'models': 'ndr',
                    'models': 'carbon',
                    'catchment': intakeCreated.pk,
                }
                argsWb = {
                    'id_intake': intakeCreated.pk
                }
                execInvest(requests, argsInvest)
                execWb(requests, argsWb)
                messages.success(request, ("Water Intake created."))
                return HttpResponseRedirect(reverse('list-intake'))
            else:
                messages.error(request, ("Water Intake not created."))
                return HttpResponseRedirect(request, 'waterproof_intake/intake_list.html')


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
    url = settings.WATERPROOF_INVEST_API+'execInvest'
    r = request.get(url, params=args)
    if r.status_code == 200:
        print(r.text)
    else:
        print(r.text)


""""""""""""""""""""""
Execute Water Balance API

Attributes
----------
request
catchment:  Int Intake id
"""""""""""""""""""""


def execWb(request, args):
    print(args)
    url = settings.WATERPROOF_INVEST_API+'wb'
    r = request.get(url, params=args)
    if r.status_code == 200:
        print(r.text)
    else:
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
