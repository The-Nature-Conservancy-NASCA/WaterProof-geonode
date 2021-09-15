from django.http import HttpResponse
from django.http.response import JsonResponse
from rest_framework.decorators import api_view
from django.conf import settings
from django.contrib.auth.models import User
from random import randrange, choice
from geonode.waterproof_treatment_plants.models import Header, Csinfra, Element, Function, Ptap
from geonode.waterproof_intake.models import ElementSystem, Intake, ProcessEfficiencies, CostFunctionsProcess
from geonode.waterproof_parameters.models import Countries, Cities
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import DateTimeField
import requests
import psycopg2
import json


@api_view(['GET'])
def getTreatmentPlantsList(request):
	"""Returns the list of treatment plants
	Find all the stored treatment plants that have
	the minimum characteristics stored in all components
	Parameters:
	without parameters
	Exceptions:
	If it does not have data in the minimal relations of the model it does not deliver
	information about the treatment plant
	"""
	if request.method == 'GET':
		objects_list = []
		lastNull = ''
		lastInstakeName = ''
		tratamentPlantsList = []
		user = request.GET['user']
		city_id = request.GET['city']
				
		if user != '-1':			
			print("FILTER in API PTAP : %s" % user)
			try:
				headers = Header.objects.filter(plant_city=city_id, user=user)
				tratamentPlantsList = Csinfra.objects.filter(csinfra_plant__in=headers)
			except:
				city_id = ''
				tratamentPlantsList = Csinfra.objects.all()	
			for tratamentPlants in tratamentPlantsList:
				lastPlantIntakeName = ''
				try:
					lastPlantIntakeName = tratamentPlants.csinfra_elementsystem.intake.name + " " + tratamentPlants.csinfra_elementsystem.name + " " + str(tratamentPlants.csinfra_elementsystem.graphId)
				except:
					lastNull = ''
				if lastInstakeName != tratamentPlants.csinfra_plant.plant_name:
					lastInstakeName = tratamentPlants.csinfra_plant.plant_name
					datePTAP = tratamentPlants.csinfra_plant.plant_date_create
					dateFormat = datePTAP.strftime("%Y-%m-%d")
					objects_list.append({
						"plantId": tratamentPlants.csinfra_plant.id,
						"plantUser": tratamentPlants.csinfra_plant.plant_user,
						"plantDate": dateFormat,
						"plantName": tratamentPlants.csinfra_plant.plant_name,
						"plantDescription": tratamentPlants.csinfra_plant.plant_description,
						"plantSuggest": tratamentPlants.csinfra_plant.plant_suggest,
						"plantCityId": tratamentPlants.csinfra_plant.plant_city_id,
						"standardNameSpanish": tratamentPlants.csinfra_plant.plant_city.standard_name_spanish,
						"plantIntakeName": [lastPlantIntakeName]
					})
				else: 
					objects_list[len(objects_list) - 1]["plantIntakeName"].append (lastPlantIntakeName);

		return JsonResponse(objects_list, safe=False)

@api_view(['GET'])
def getIntakeList(request):
	"""Returns the list of intakes available
	Search the intakes table for intakes
	available in the city that is defined
	Parameters:
	cityName - Name of the city to search
	Exceptions:
	if there are no intakes in that city, the empty set returns
	"""
	if request.method == 'GET':
		objects_list = []
		city_id = request.query_params.get('cityId')
		elements = ElementSystem.objects.filter(normalized_category='CSINFRA').filter(intake__city__id=city_id).order_by('intake__name')
		for elementSystem in elements:
			intake_name = elementSystem.intake.name
			objects_list.append({
				"id": elementSystem.id,
				"name": intake_name,
				"csinfra": elementSystem.name,
				"graphId": elementSystem.graphId,
				"cityId": city_id,
				"nameIntake":str(intake_name) + str(" - ") + str(elementSystem.name) + str(" - ") + str(elementSystem.graphId)})

		#order_register = sorted(objects_list, key=lambda tree : tree['nameIntake'])
		return JsonResponse(objects_list, safe=False)

@api_view(['POST'])
def getTypePtap(request):
	"""Returns the Ptap information
	Call the available service to calculate the Ptap
	from the information of the intake sectioned
	Parameters:
	data - array with the id of the selected intakes
	Exceptions:
	Those that are defined in the service that generates the calculation since that same
	information is returned to the user without making any changes
	"""
	if request.method == 'POST':
		if request.user.is_authenticated:
			url = settings.WATERPROOF_INVEST_API + 'ptapSelection'
			
			x = requests.post( url, json = request.data)
			return JsonResponse(json.loads(x.text), safe=False)


@api_view(['GET'])
def getInfoTree(request):
	"""Returns the tree information
	Search the information stored in the system of functions and variables
	of the tree for each of the elements
	Parameters:
	plantElement - name of the element in the plant
	Exceptions:
	always returns the basic information of each element
	"""
	if request.method == 'GET':
		if request.user.is_authenticated:
			for countries in Countries.objects.filter(name=request.query_params.get('country')):
				countryFactor = countries.global_multiplier_factor

			objects_list = []
			lastNull = ''
			objects_list = []
			for costFunctionsProcess in CostFunctionsProcess.objects.all():
				try:
					if costFunctionsProcess.process_efficiencies.normalized_category == request.query_params.get('plantElement'):
						objects_list.append({
							"idSubprocess": costFunctionsProcess.id,
							"subprocess": costFunctionsProcess.sub_process,
							"subprocessAddId": costFunctionsProcess.sub_process,
							"technology": costFunctionsProcess.process_efficiencies.categorys,
							"technologyAddId": str(costFunctionsProcess.process_efficiencies.id) + costFunctionsProcess.process_efficiencies.categorys,
							"costFunction": costFunctionsProcess.function_name,
							"function": costFunctionsProcess.function_value,
							"default": costFunctionsProcess.default_function,
							"transportedWater": costFunctionsProcess.process_efficiencies.predefined_transp_water_perc,
							"sedimentsRetained": costFunctionsProcess.process_efficiencies.predefined_sediment_perc,
							"nitrogenRetained": costFunctionsProcess.process_efficiencies.predefined_nitrogen_perc,
							"phosphorusRetained": costFunctionsProcess.process_efficiencies.predefined_phosphorus_perc,
							"minimalTransportedWater": costFunctionsProcess.process_efficiencies.minimal_transp_water_perc,
							"minimalSedimentsRetained": costFunctionsProcess.process_efficiencies.minimal_sediment_perc,
							"minimalNitrogenRetained": costFunctionsProcess.process_efficiencies.minimal_nitrogen_perc,
							"minimalPhosphorusRetained": costFunctionsProcess.process_efficiencies.minimal_phoshorus_perc,
							"maximalTransportedWater": costFunctionsProcess.process_efficiencies.maximal_transp_water_perc,
							"maximalSedimentsRetained": costFunctionsProcess.process_efficiencies.maximal_sediment_perc,
							"maximalNitrogenRetained": costFunctionsProcess.process_efficiencies.maximal_nitrogen_perc,
							"maximalPhosphorusRetained": costFunctionsProcess.process_efficiencies.maximal_phosphorus_perc,
							"currency": costFunctionsProcess.currency,
							"factor": countryFactor
						})
				except:
					lastNull = ''
				order_register = sorted(objects_list, key=lambda tree : tree['technologyAddId'])
			return JsonResponse(order_register, safe=False)

@api_view(['PUT','DELETE'])
def setHeaderPlant(request):
	"""Create / Update the treatment plant
	Stores treatment plant information in the system
	and of the entities attached to the treatment plant to guarantee
	that the information is integrated only commits the transaction
	at the end of saving in all entities
	Parameters:
	all the information of the treatment plant
	Exceptions:
	In case of generating an error in any of the entities attached to the plant
	treatment plant or in the treatment plant, generates an html error and
	rollback the transaction
	"""
	if request.method == 'PUT':
		if request.user.is_authenticated:
			header = request.data.get('header')
			if header.get('plantId') != "null":
				Header.objects.filter(id = header.get('plantId')).update(plant_city_id = header.get('cityId'),
					plant_name = header.get('plantName'), 
					plant_description = header.get('plantDescription'),
					plant_suggest = header.get('plantSuggest'),
					plant_user = request.user.username)

				Ptap.objects.filter(ptap_plant_id = header.get('plantId')).delete()

				for row in header.get('ptap'):
					ptapSave = Ptap.objects.create(
						ptap_plant_id = header.get('plantId'),
						ptap_type = row.get('ptapType'),
						ptap_awy = row.get('ptapAwy'),
						ptap_cn = row.get('ptapCn'),
						ptap_cp = row.get('ptapCp'),
						ptap_cs = row.get('ptapCs'),
						ptap_wn = row.get('ptapWn'),
						ptap_wp = row.get('ptapWp'),
						ptap_ws = row.get('ptapWs'),
						ptap_user = request.user.username
					)
					ptapSave.save()

				Csinfra.objects.filter(csinfra_plant_id = header.get('plantId')).delete()

				for row in header.get('csinfra'):
					csinfraSave = Csinfra.objects.create(
						csinfra_plant_id = header.get('plantId'),
						csinfra_user = request.user.username,
						csinfra_elementsystem_id = row.get('intake')
					)
					csinfraSave.save()

				Element.objects.filter(element_plant_id = header.get('plantId')).delete()

				for row in header.get('element'):
					elementSave = Element.objects.create(
						element_normalize_category = row.get('normalizeCategory'),
						element_plant_id = header.get('plantId'),
						element_graph_id = row.get('graphId'),
						element_on_off = row.get('onOff'),
						element_q_l = 0,
						element_awy = 0,
						element_cn_mg_l = 0,
						element_cp_mg_l = 0,
						element_csed_mg_l = 0,
						element_wn_kg = 0,
						element_wn_rent_kg = 0,
						element_wp_rent_ton = 0,
						element_wsed_tom = 0,
						element_wp_kg = 0,
						element_user = request.user.username
					)
					elementSave.save()

				Function.objects.filter(function_plant_id = header.get('plantId')).delete()

				for row in header.get('function'):
					functionSave = Function.objects.create(
						function_name = row.get('nameFunction'),
						function_graph_id = row.get('graphid'),
						function_value = row.get('functionValue'),
						function_currency = row.get('currency'),
						function_factor = row.get('factor'),
						function_id_sub_process = row.get('idSubprocess'),
						function_user = request.user.username,
						function_transported_water = 100,
						function_sediments_retained = row.get('sedimentsRetained'),
						function_nitrogen_retained = row.get('nitrogenRetained'),
						function_phosphorus_retained = row.get('phosphorusRetained'),
						function_technology = row.get('technology'),
						function_plant_id = header.get('plantId')
					)
					functionSave.save()

				jsonObject = [{	'plant_id' : header.get('plantId')}]
			else:
				headerSave = Header.objects.create(
					plant_city_id = header.get('cityId'),
					plant_name = header.get('plantName'),
					plant_description = header.get('plantDescription'),
					plant_suggest = header.get('plantSuggest'),
					plant_user = request.user.username
				)
				headerSave.save()

				for row in header.get('ptap'):
					ptapSave = Ptap.objects.create(
						ptap_plant_id = headerSave.id,
						ptap_type = row.get('ptapType'),
						ptap_awy = row.get('ptapAwy'),
						ptap_cn = row.get('ptapCn'),
						ptap_cp = row.get('ptapCp'),
						ptap_cs = row.get('ptapCs'),
						ptap_wn = row.get('ptapWn'),
						ptap_wp = row.get('ptapWp'),
						ptap_ws = row.get('ptapWs'),
						ptap_user = request.user.username
					)
					ptapSave.save()

				for row in header.get('csinfra'):
					csinfraSave = Csinfra.objects.create(
						csinfra_plant_id = headerSave.id,
						csinfra_user = request.user.username,
						csinfra_elementsystem_id = row.get('intake')
					)
					csinfraSave.save()

				for row in header.get('element'):
					elementSave = Element.objects.create(
						element_normalize_category = row.get('normalizeCategory'),
						element_plant_id = headerSave.id,
						element_graph_id = row.get('graphId'),
						element_on_off = row.get('onOff'),
						element_q_l = 0,
						element_awy = 0,
						element_cn_mg_l = 0,
						element_cp_mg_l = 0,
						element_csed_mg_l = 0,
						element_wn_kg = 0,
						element_wn_rent_kg = 0,
						element_wp_rent_ton = 0,
						element_wsed_tom = 0,
						element_wp_kg = 0,
						element_user = request.user.username
					)
					elementSave.save()

				for row in header.get('function'):
					functionSave = Function.objects.create(
						function_name = row.get('nameFunction'),
						function_graph_id = row.get('graphid'),
						function_value = row.get('functionValue'),
						function_currency = row.get('currency'),
						function_factor = row.get('factor'),
						function_id_sub_process = row.get('idSubprocess'),
						function_user = request.user.username,
						function_transported_water = 100,
						function_sediments_retained = row.get('sedimentsRetained'),
						function_nitrogen_retained = row.get('nitrogenRetained'),
						function_phosphorus_retained = row.get('phosphorusRetained'),
						function_technology = row.get('technology'),
						function_plant_id = headerSave.id
					)
					functionSave.save()
				jsonObject = [{	'plant_id' : headerSave.id}]
			return JsonResponse(jsonObject, safe=False)
	if request.method == 'DELETE':
		if request.user.is_authenticated:
			Header.objects.filter(id = request.data.get('plantId')).delete()
			jsonObject = [{	'plant_id' : request.data.get('plantId')}]
			return JsonResponse(jsonObject, safe=False)

@api_view(['GET'])
def getTreatmentPlant(request):
	"""Query the treatment plant
	searches all the tables related to the plant and returns 
	the information related to the treatment plant
	Parameters:
	plantId - Id of the treatment plant
	Exceptions:
	Only information from previously created treatment 
	plants is returned
	"""
	if request.method == 'GET':
		objectPlant = []
		plantId = request.GET.get('plantId')
		for header in Header.objects.filter(id = plantId):
			objectPlant.append({
				"plant_id": header.id,
				"plantName": header.plant_name,
				"plantDescription": header.plant_description,
				"plantSuggest": header.plant_suggest
			})

		objectCsinfra = []
		for csinfra in Csinfra.objects.filter(csinfra_plant_id = plantId):
			objectCsinfra.append({
				"csinfraId": csinfra.id,
				"csinfraName": csinfra.csinfra_elementsystem.intake.name,
				"csinfraGraphId": csinfra.csinfra_elementsystem.graphId,
				"csinfraCode": csinfra.csinfra_elementsystem.name,
				"csinfraElementsystemId": csinfra.csinfra_elementsystem.id
			})

		objectElement = []
		for element in Element.objects.filter(element_plant_id = plantId):
			objectElement.append({
				"elementId": element.id,
				"elementNormalizeCategory": element.element_normalize_category,
				"elementOnOff": element.element_on_off,
				"elementGraphId": element.element_graph_id
			})

		objectFunction = []
		for function in Function.objects.filter(function_plant_id = plantId):
			objectFunction.append({
				"functionId": function.id,
				"functionName": function.function_name,
				"functionValue": function.function_value,
				"functionCurrency": function.function_currency,
				"functionFactor": function.function_factor,
				"functionIdSubProcess": function.function_id_sub_process,
				"functionSedimentsRetained": function.function_sediments_retained,
				"functionNitrogenRetained": function.function_nitrogen_retained,
				"functionPhosphorusRetained": function.function_phosphorus_retained,
				"functionTechnology": function.function_technology,
				"functionGraphId" : function.function_graph_id,
			})

		response = {
			'plant' : objectPlant,
			'csinfra' : objectCsinfra,
			'element' : objectElement,
			'function' : objectFunction
		}

		return JsonResponse(response, safe=False)