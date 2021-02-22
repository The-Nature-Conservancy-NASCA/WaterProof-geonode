from django.http import HttpResponse
from django.http.response import JsonResponse
from rest_framework.decorators import api_view
from django.conf import settings
from django.contrib.auth.models import User
from random import randrange, choice
import requests
import psycopg2

@api_view(['GET'])
def getTreatmentPlantsList(request):
	if request.method == 'GET':
		con = psycopg2.connect(settings.DATABASE_URL)
		cur = con.cursor()
		cur.execute("SELECT plant_id, plant_name, plant_description, plant_suggest FROM waterproof_treatment_plants_header")
		rows = cur.fetchall()
		objects_list = []
		for row in rows:
			objects_list.append({
				"plantId":row[0],
				"plantName":row[1],
				"plantDescription":row[2],
				"plantSuggest":row[3]
			})
		return JsonResponse(objects_list, safe=False)

@api_view(['GET'])
def getIntakeList(request):
	if request.method == 'GET':
		con = psycopg2.connect(settings.DATABASE_URL)
		cur = con.cursor()
		cur.execute("SELECT waterproof_intake_intake.id, waterproof_intake_intake.name, waterproof_intake_elementsystem.name, waterproof_intake_elementsystem.\"graphId\" FROM waterproof_intake_intake INNER JOIN waterproof_intake_elementsystem  ON (waterproof_intake_intake.id = waterproof_intake_elementsystem.intake_id)  WHERE waterproof_intake_elementsystem.normalized_category = 'CSINFRA'")
		rows = cur.fetchall()
		objects_list = []
		for row in rows:
			objects_list.append({
				"id":row[0],
				"name":row[1],
				"csinfra":row[2],
				"graphId":row[3],
				"nameIntake":str(row[1]) + str(" - ") + str(row[2]) + str(" - ") + str(row[3])})
		return JsonResponse(objects_list, safe=False)

@api_view(['GET'])
def getTypePtap(request):
	if request.method == 'GET':
		if request.user.is_authenticated:
#            if (request.user.professional_role == 'ADMIN'):
			jsonObject = {
							'estado' : True,
							'resultado' : {
								'sedimentsRetained': choice(["101", "301", "123", "344", "234", "756", "939"]),
								'nitrogenRetained': choice(["101", "301", "123", "344", "234", "756", "939"]),
								'phosphorusRetained': choice(["101", "301", "123", "344", "234", "756", "939"]),
								'ptapType' : choice(["A", "B", "C", "D", "E", "F", "G"])
							}
						}
			return JsonResponse(jsonObject, safe=False)

@api_view(['GET'])
def getEnviroment(request):
	if request.method == 'GET':
		con = psycopg2.connect(settings.DATABASE_URL)
		cur = con.cursor()
		cur.execute("SELECT waterproof_nbs_ca_countries.code AS code_country,waterproof_nbs_ca_countries.name AS name_country,waterproof_nbs_ca_currency.name AS name_currency, waterproof_nbs_ca_region.name AS name_region, waterproof_nbs_ca_currency.code, waterproof_nbs_ca_countries.id FROM waterproof_nbs_ca_countries  INNER JOIN waterproof_nbs_ca_currency ON  (waterproof_nbs_ca_currency.id = waterproof_nbs_ca_countries.id)  INNER JOIN waterproof_nbs_ca_region ON  (waterproof_nbs_ca_region.id = waterproof_nbs_ca_countries.region_id) WHERE waterproof_nbs_ca_currency.code = 'COP'")
		rows = cur.fetchall()
		con.commit()
		cur.close()
		objects_list = []
		for row in rows:
			objects_list.append({
				"codeCountry":row[0],
				"nameCountry":row[1],
				"nameCurrency":row[2],
				"nameRegion":row[3],
				"code":row[4],
				"id":row[5], 
				"nameCity":"Bogotá"
			})
		return JsonResponse(objects_list, safe=False)

@api_view(['GET'])
def getInfoTree(request):
	if request.method == 'GET':
		if request.user.is_authenticated:
			con = psycopg2.connect(settings.DATABASE_URL)
			cur = con.cursor()
			cur.execute("SELECT waterproof_intake_costfunctionsprocess.id, waterproof_intake_costfunctionsprocess.sub_proceso,  waterproof_intake_processefficiencies.categorys,  waterproof_intake_costfunctionsprocess.function_name, waterproof_intake_costfunctionsprocess.function_value, waterproof_intake_costfunctionsprocess.default_function, waterproof_intake_processefficiencies.predefined_nitrogen_perc, waterproof_intake_processefficiencies.predefined_phosphorus_perc, waterproof_intake_processefficiencies.predefined_sediment_perc, waterproof_intake_processefficiencies.predefined_transp_water_perc FROM waterproof_intake_processefficiencies LEFT JOIN  waterproof_intake_costfunctionsprocess ON (waterproof_intake_processefficiencies.id = waterproof_intake_costfunctionsprocess.proceso_efeciente_id) WHERE waterproof_intake_processefficiencies.normalized_category LIKE '%" + request.query_params.get('plantElement') + "%' ORDER BY waterproof_intake_costfunctionsprocess.sub_proceso, waterproof_intake_processefficiencies.categorys")
			rows = cur.fetchall()
			con.commit()
			cur.close()
			objects_list = []
			for row in rows:
				objects_list.append({
					"idSubprocess":row[0],
					"subprocess":row[1],
					"subprocessAddId":row[1],
					"technology":row[2],
					"technologyAddId":str(row[0]) + row[2],
					"costFunction":row[3],
					"function":row[4],
					"default":row[5],
					"transportedWater":row[6],
					"sedimentsRetained":row[7],
					"nitrogenRetained":row[8],
					"phosphorusRetained":row[9],
					"currency": "COP",
					"factor": "0.251"
				})
			return JsonResponse(objects_list, safe=False)

@api_view(['PUT','DELETE'])
def setHeaderPlant(request):
	if request.method == 'PUT':
		if request.user.is_authenticated:
			con = psycopg2.connect(settings.DATABASE_URL)
			cur = con.cursor()
			cur.execute("DELETE FROM waterproof_treatment_plants_header WHERE plant_id = " + request.data.get('header').get('plantId'))
			cur.execute("DELETE FROM waterproof_treatment_plants_csinfra WHERE csinfra_plant_id = " + request.data.get('header').get('plantId'))
			cur.execute("DELETE FROM waterproof_treatment_plants_element WHERE element_plant_id = " + request.data.get('header').get('plantId'))
			cur.execute("DELETE FROM waterproof_treatment_plants_function WHERE function_plant_id = " + request.data.get('header').get('plantId'))

			queryStr = "INSERT INTO waterproof_treatment_plants_header(plant_name, plant_description, plant_suggest, plant_user, plant_date_create) VALUES (%s, %s, %s, %s, now()) RETURNING plant_id;";
			cur.execute(queryStr, (request.data.get('header').get('plantName'),
				request.data.get('header').get('plantDescription'),
				request.data.get('header').get('plantSuggest'),
				request.user.username))
			plantId = cur.fetchone()[0]
			for row in request.data.get('header').get('element'):
				queryStrElement = "INSERT INTO waterproof_treatment_plants_element (element_normalize_category, element_plant_id, element_graph_id, element_on_off, element_q_l, element_awy, element_cn_mg_l, element_cp_mg_l, element_csed_mg_l, element_wn_kg, element_wn_rent_kg, element_wp_rent_ton, element_wsed_tom, element_wp_kg, element_user, element_date_create) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, now()) RETURNING element_id;";
				cur.execute(queryStrElement, (row.get('normalizeCategory'),
					plantId, 
					row.get('graphId'),
					row.get('onOff'),
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					request.user.username))

			for row in request.data.get('header').get('function'):
				queryStrFunction = "INSERT INTO waterproof_treatment_plants_function (function_plant_id, function_technology, function_name, function_value, function_currency, function_factor, function_id_sub_process, function_user, function_date_create, function_transported_water, function_sediments_retained, function_nitrogen_retained, function_phosphorus_retained) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, now(), %s, %s, %s, %s) RETURNING function_id;";
				cur.execute(queryStrFunction, (plantId,
					row.get('technology'),
					row.get('nameFunction'),
					row.get('functionValue'),
					row.get('currency'),
					row.get('factor'),
					row.get('idSubprocess'),
					request.user.username,
					100,
					row.get('sedimentsRetained'),
					row.get('nitrogenRetained'),
					row.get('phosphorusRetained')))

			for row in request.data.get('header').get('csinfra'):
				queryStrFunction = "INSERT INTO waterproof_treatment_plants_csinfra (csinfra_plant_id, csinfra_name, csinfra_graph_id, csinfra_code, csinfra_user, csinfra_date_create) VALUES (%s, %s, %s, %s, %s, now()) RETURNING csinfra_id;";
				cur.execute(queryStrFunction, (plantId,
					row.get('name'),
					row.get('graphId'),
					row.get('csinfra'),
					request.user.username))

			jsonObject = [{	'plant_id' : plantId}]
			con.commit()
			cur.close()
			return JsonResponse(jsonObject, safe=False)
	if request.method == 'DELETE':
		if request.user.is_authenticated:
			con = psycopg2.connect(settings.DATABASE_URL)
			cur = con.cursor()
			cur.execute("DELETE FROM waterproof_treatment_plants_header WHERE plant_id = " + request.data.get('plantId'))
			cur.execute("DELETE FROM waterproof_treatment_plants_csinfra WHERE csinfra_plant_id = " + request.data.get('plantId'))
			cur.execute("DELETE FROM waterproof_treatment_plants_element WHERE element_plant_id = " + request.data.get('plantId'))
			cur.execute("DELETE FROM waterproof_treatment_plants_function WHERE function_plant_id = " + request.data.get('plantId'))

			jsonObject = [{	'plant_id' : request.data.get('plantId')}]
			con.commit()
			cur.close()
			return JsonResponse(jsonObject, safe=False)

@api_view(['GET'])
def getTreatmentPlant(request):
	if request.method == 'GET':
		con = psycopg2.connect(settings.DATABASE_URL)
		cur = con.cursor()
		cur.execute("SELECT plant_id, plant_name, plant_description, plant_suggest FROM waterproof_treatment_plants_header WHERE plant_id = '" + request.query_params.get('plantId') + "'")
		rows = cur.fetchall()
		objectPlant = []
		for row in rows:
			objectPlant.append({
				"plant_id": row[0],
				"plantName": row[1],
				"plantDescription": row[2],
				"plantSuggest": row[3]
			})

		cur.execute("SELECT csinfra_id, csinfra_name, csinfra_graph_id, csinfra_code FROM waterproof_treatment_plants_csinfra WHERE csinfra_plant_id = '" + request.query_params.get('plantId') + "'")
		rows = cur.fetchall()
		objectCsinfra = []
		for row in rows:
			objectCsinfra.append({
				"csinfraId": row[0],
				"csinfraName": row[1],
				"csinfraGraphId": row[2],
				"csinfraCode": row[3]
			})

		cur.execute("SELECT element_id, element_normalize_category, element_on_off, element_graph_id FROM waterproof_treatment_plants_element WHERE element_plant_id = '" + request.query_params.get('plantId') + "'")
		rows = cur.fetchall()
		objectElement = []
		for row in rows:
			objectElement.append({
				"elementId": row[0],
				"elementNormalizeCategory": row[1],
				"elementOnOff": row[2],
				"elementGraphId": row[3]
			})

		cur.execute("SELECT function_id, function_name, function_value, function_currency, function_factor, function_id_sub_process, function_sediments_retained, function_nitrogen_retained, function_phosphorus_retained, function_technology FROM waterproof_treatment_plants_function WHERE function_plant_id = '" + request.query_params.get('plantId') + "'")
		rows = cur.fetchall()
		objectFunction = []
		for row in rows:
			objectFunction.append({
				"functionId": row[0],
				"functionName": row[1],
				"functionValue": row[2],
				"functionCurrency": row[3],
				"functionFactor": row[4],
				"functionIdSubProcess": row[5],
				"functionSedimentsRetained": row[6],
				"functionNitrogenRetained": row[7],
				"functionPhosphorusRetained": row[8],
				"functionTechnology": row[9]
			})

		response = {
			'plant' : objectPlant,
			'csinfra' : objectCsinfra,
			'element' : objectElement,
			'function' : objectFunction
		}

		con.commit()
		cur.close()
		return JsonResponse(response, safe=False)