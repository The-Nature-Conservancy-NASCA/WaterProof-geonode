from django.http import HttpResponse
from django.http.response import JsonResponse

from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework.decorators import api_view
from django.conf import settings
from django.contrib.auth.models import User
from random import randrange, choice

from rest_framework.views import APIView
from rest_framework.response import Response
from geonode.waterproof_treatment_plants.models import Header, Csinfra, Element, Function, Ptap
from geonode.waterproof_intake.models import ElementSystem, ProcessEfficiencies, CostFunctionsProcess
from geonode.waterproof_parameters.models import Countries
from geonode.waterproof_study_cases.models import StudyCases
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import DateTimeField
import requests
from django.db.models import Q
import json

class Process(APIView):

	@method_decorator(cache_page(60*60*2))
	def get(self, request, format=None):
		process = ProcessEfficiencies.objects.values('categorys','normalized_category').filter(name='PTAP').exclude(normalized_category='')
		list_process = []
		for p in process:
			list_process.append(p)
		
		return Response(list_process)

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
		obj_plant_list = []
		lastNull = ''
		lastInstakeName = ''
		plantList = []
		user = request.GET['user']
		city_id = request.GET['city']
		
		if user != '-1':
			#print ("getTreatmentPlantsList, user: %s, city: %s" % (user, city_id))
			headers = Header.objects.filter(plant_city=city_id, plant_user=user)
			#print ("headers: %s" % headers)
		else:
			#print("getTreatmentPlantsList (without user), city: %s" % city_id)
			headers = Header.objects.filter(plant_city=city_id)
		try:				
			plantList = Csinfra.objects.filter(csinfra_plant__in=headers)
		except:
			city_id = ''
			plantList = Csinfra.objects.all()

		dict_plants = {}
		for plant in plantList:
			plantIntakes = {}
			csinfra = plant.csinfra_plant
			
			try:
				element = plant.csinfra_elementsystem
				plantIntakes = {"name":("%s:%s::%s") % (element.intake.name, element.name, element.graphId), "id":element.intake.id}
				datePTAP = csinfra.plant_date_create
				dateFormat = datePTAP.strftime("%Y-%m-%d")
				obj_plant = {
					"plantId": csinfra.id,
					"plantUser": element.intake.added_by.first_name + " " + element.intake.added_by.last_name,
					"plantDate": dateFormat,
					"plantName": csinfra.plant_name,
					"plantDescription": csinfra.plant_description,
					"plantSuggest": csinfra.plant_suggest,
					"plantCityId": csinfra.plant_city_id,
					"standardNameSpanish": csinfra.plant_city.standard_name_spanish,
					"plantIntakeName": [plantIntakes],
					"geom" : element.intake.polygon_set.first().geom.geojson #json.loads(element.intake.polygon_set.first().geomIntake)['features'][0]['geometry'] # geom.geojson 
				}
				if (not csinfra.id in dict_plants):
					dict_plants[csinfra.id] = obj_plant
				else:
					dict_plants[csinfra.id]['plantIntakeName'].append(plantIntakes)
			except:
				lastNull = ''			
								
		for k in dict_plants:
			obj_plant_list.append(dict_plants[k])

		return JsonResponse(obj_plant_list, safe=False)

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
		elements = []
		if request.user.is_authenticated:
			# print("getIntakeList, user: %s, city: %s" % (request.user.id, city_id))
			elements = ElementSystem.objects.filter(normalized_category='CSINFRA').filter(intake__city__id=city_id, intake__added_by=request.user).order_by('intake__name')
		else:
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
		
		url = settings.WATERPROOF_INVEST_API + 'ptapSelection'
		print ("getTypePtap :: url: %s" % url)
		x = requests.post( url, json = request.data, verify=False)
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
			country = request.query_params.get('country')
			for countries in Countries.objects.filter(Q(name=country) | Q(native=country)):
				countryFactor = countries.global_multiplier_factor

			objects_list = []
			lastNull = ''
			objects_list = []
			for process in CostFunctionsProcess.objects.all():
				try:
					if process.process_efficiencies.normalized_category == request.query_params.get('plantElement'):
						objects_list.append({
							"idSubprocess": process.id,
							"subprocess": process.sub_process,
							"subprocessAddId": process.sub_process,
							"technology": process.process_efficiencies.categorys,
							"technologyAddId": str(process.process_efficiencies.id) + process.process_efficiencies.categorys,
							"costFunction": process.function_name,
							"function": process.function_value,
							"default": process.default_function,
							"transportedWater": process.process_efficiencies.predefined_transp_water_perc,
							"sedimentsRetained": process.process_efficiencies.predefined_sediment_perc,
							"nitrogenRetained": process.process_efficiencies.predefined_nitrogen_perc,
							"phosphorusRetained": process.process_efficiencies.predefined_phosphorus_perc,
							"minimalTransportedWater": process.process_efficiencies.minimal_transp_water_perc,
							"minimalSedimentsRetained": process.process_efficiencies.minimal_sediment_perc,
							"minimalNitrogenRetained": process.process_efficiencies.minimal_nitrogen_perc,
							"minimalPhosphorusRetained": process.process_efficiencies.minimal_phoshorus_perc,
							"maximalTransportedWater": process.process_efficiencies.maximal_transp_water_perc,
							"maximalSedimentsRetained": process.process_efficiencies.maximal_sediment_perc,
							"maximalNitrogenRetained": process.process_efficiencies.maximal_nitrogen_perc,
							"maximalPhosphorusRetained": process.process_efficiencies.maximal_phosphorus_perc,							
							"currency": process.currency,
							"factor": countryFactor
						})
				except:
					lastNull = ''
				order_register = sorted(objects_list, key=lambda tree : tree['technologyAddId'])
			return JsonResponse(order_register, safe=False)

@api_view(['GET'])
def getInfoTreeMany(request):
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
			country = request.query_params.get('country')
			elements = request.query_params.get('elements')
			country_row = Countries.objects.filter(Q(name=country) | Q(native=country)).first()
			countryFactor = country_row.global_multiplier_factor

			objects_list = []
			lastNull = ''
			objects_list = []

			list_elements = elements.split(',')
			for process in CostFunctionsProcess.objects.filter(process_efficiencies__normalized_category__in=list_elements):
				try:					
					objects_list.append({
						"idSubprocess": process.id,
						"subprocess": process.sub_process,
						"subprocessAddId": process.sub_process,
						"technology": process.process_efficiencies.categorys,
						"technologyAddId": str(process.process_efficiencies.id) + process.process_efficiencies.categorys,
						"costFunction": process.function_name,
						"function": process.function_value,
						"default": process.default_function,
						"transportedWater": process.process_efficiencies.predefined_transp_water_perc,
						"sedimentsRetained": process.process_efficiencies.predefined_sediment_perc,
						"nitrogenRetained": process.process_efficiencies.predefined_nitrogen_perc,
						"phosphorusRetained": process.process_efficiencies.predefined_phosphorus_perc,
						"minimalTransportedWater": process.process_efficiencies.minimal_transp_water_perc,
						"minimalSedimentsRetained": process.process_efficiencies.minimal_sediment_perc,
						"minimalNitrogenRetained": process.process_efficiencies.minimal_nitrogen_perc,
						"minimalPhosphorusRetained": process.process_efficiencies.minimal_phoshorus_perc,
						"maximalTransportedWater": process.process_efficiencies.maximal_transp_water_perc,
						"maximalSedimentsRetained": process.process_efficiencies.maximal_sediment_perc,
						"maximalNitrogenRetained": process.process_efficiencies.maximal_nitrogen_perc,
						"maximalPhosphorusRetained": process.process_efficiencies.maximal_phosphorus_perc,
						"currency": process.currency,
						"factor": countryFactor,
						"normalizedCategory" : process.process_efficiencies.normalized_category,
						"greaterCaudal": process.greater_than_caudal,
						"caudal": process.caudal,
					})
				except:
					lastNull = ''
				objs = sorted(objects_list, key=lambda tree : tree['technologyAddId'])
			return JsonResponse(objs, safe=False)

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
				"csinfraSourceName": csinfra.csinfra_elementsystem.intake.water_source_name,
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
				"functionGraphId" : function.function_graph_id
			})

		response = {
			'plant' : objectPlant,
			'csinfra' : objectCsinfra,
			'element' : objectElement,
			'function' : objectFunction
		}

		return JsonResponse(response, safe=False)


@api_view(['GET'])
def getCountStudyCasesByPlant(request, id):
    if request.method == 'GET':
        #print("getCountStudyCasesByPlant :: id: %s" % id)
        plants = StudyCases.objects.filter(ptaps=id)        
        #print ("plants: %s" % plants)
        count = len(plants)
        #print ("count: %s" % count)
        return JsonResponse({"count":count}, safe=False)

def get_geoms_intakes(plants):
	intake_geoms = []
	for p in plants:
		i = p.csinfra_elementsystem.intake
		ig = dict()
		ig['id'] = i.id
		if not i.polygon_set.first().geom is None:
				ig['geom'] = json.loads(i.polygon_set.first().geomIntake)['features'][0]['geometry'] # geom.geojson
				ig['name'] = i.name
		intake_geoms.append(ig)
	return intake_geoms


