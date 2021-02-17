from django.http import HttpResponse
from django.http.response import JsonResponse
from rest_framework.decorators import api_view
from django.conf import settings
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

@api_view(['PUT'])
def setHeaderPlant(request):
	if request.method == 'PUT':
		con = psycopg2.connect(settings.DATABASE_URL)
		cur = con.cursor()
		queryStr = "INSERT INTO waterproof_treatment_plants_header(plant_name, plant_description, plant_suggest) VALUES (%s, %s, %s) RETURNING plant_id;";
		cur.execute(queryStr, (request.data.get('header').get('plantName'),
			request.data.get('header').get('plantDescription'),
			request.data.get('header').get('plantSuggest')))
		plantId = cur.fetchone()[0]
		for row in request.data.get('header').get('element'):
			print("........")
			print(row)
			print()
			print("........")
			queryStrElement = "INSERT INTO waterproof_treatment_plants_element (element_normalize_category, element_transported_water, element_sediments_retained, element_nitrogen_retained, element_phosphorus_retained, element_planta_id, element_graph_id, element_on_off, element_q_l, element_awy, element_cn_mg_l, element_cp_mg_l, element_csed_mg_l, element_wn_kg, element_wn_rent_kg, element_wp_rent_ton, element_wsed_tom, element_wp_kg ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING element_id;";
			cur.execute(queryStrElement, (row.get('normalizeCategory'),
				100,
				row.get('sedimentsRetained'),
				row.get('nitrogenRetained'),
				row.get('phosphorusRetained'),
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
				0))
		jsonObject = [{	'plant_id' : plantId}]
		con.commit()
		cur.close()
		return JsonResponse(jsonObject, safe=False)



