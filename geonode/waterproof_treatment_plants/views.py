from django.http import HttpResponse
from django.http.response import JsonResponse
from django.shortcuts import render
from geonode.waterproof_nbs_ca.models import Countries, Region, Currency
from geonode.waterproof_intake.models import City, Intake
from rest_framework.decorators import api_view
from django.conf import settings
from random import randrange, choice
import requests
import psycopg2


con = psycopg2.connect(settings.DATABASE_URL)
countryPlant = ""
region = ""
currency = ""
city = ""

def loadGlobalVariable(request):
	if request.method == 'GET':
		global countryPlant
		global region
		global currency
		global city
		countryPlant = Countries.objects.get(code=request.user.country)
		region = Region.objects.get(id=countryPlant.region_id)
		currency = Currency.objects.get(id=countryPlant.id)
		city = City.objects.get(id=1)

def treatmentPlantsList(request):
	if request.method == 'GET':
		global countryPlant
		global region
		global currency
		global city

		loadGlobalVariable(request)
		response = requests.get(settings.SITE_HOST_API + 'treatment_plants/getTreatmentPlantsList/')
		return render(
			request,
			'waterproof_treatment_plants/treatment_plants_list.html',
			{
				'city': city,
				'countryPlant': countryPlant,
				'region': region,
				'currency': currency,
				'treatmentPlantsList': response.json()
			}
		)

def editTreatmentPlants(request):
	if request.method == 'GET':
		global countryPlant
		global region
		global currency
		global city
		loadGlobalVariable(request)
		response = requests.get(settings.SITE_HOST_API + 'treatment_plants/getIntakeList/')
		print(response)
		return render(
			request,
			'waterproof_treatment_plants/treatment_plants_edit.html',
			{
				'city': city,
				'countryPlant': countryPlant,
				'region': region,
				'currency': currency,
				'intakeList': response.json()
			}
		)

def newTreatmentPlants(request, userCountryId):
	if request.method == 'GET':
		global countryPlant
		global region
		global currency
		global city

		loadGlobalVariable(request)
		response = requests.get(settings.SITE_HOST_API + 'treatment_plants/getIntakeList/')
		return render(
			request,
			'waterproof_treatment_plants/treatment_plants_edit.html',
			{
				'city': city,
				'countryPlant': countryPlant,
				'region': region,
				'currency': currency,
				'intakeList': response.json()
			}
		)

@api_view(['GET'])
def getTreatmentPlantsList(request):
	if request.method == 'GET':
		jsonObject = [
					{	
						'name' : 'treatment plant test one',
						'description': 'This is the first test, in the list',
						'catchment': 'there is no evidence'
					},
					{	
						'name' : 'treatment plant test two',
						'description': 'This is the second test, in the list',
						'catchment': 'there is no evidence'
					},
					{	
						'name' : 'treatment plant test three',
						'description': 'This is the third test, in the list',
						'catchment': 'there is no evidence'
					}
				]
		return JsonResponse(jsonObject, safe=False)

@api_view(['GET'])
def getIntakeList(request):
	if request.method == 'GET':
		cur = con.cursor()
		cur.execute("select a.id,a.\"name\" AS namea,b.\"name\" AS nameb ,b.\"graphId\", concat(a.\"name\",' - ',b.\"name\" ,' - ',b.\"graphId\" ) as nameIntake from public.waterproof_intake_intake a inner join public.waterproof_intake_elementsystem b on (a.id=b.intake_id) where b.normalized_category = 'CSINFRA'")
		rows = cur.fetchall()
		objects_list = []
		for row in rows:
			objects_list.append({"id":row[0],"name":row[1],"nameb":row[2],"graphId":row[3],"nameIntake":row[4]})
		return JsonResponse(objects_list, safe=False)

@api_view(['GET'])
def getTypePtap(request):
	if request.method == 'GET':
		jsonObject = {
						'estado' : True,
						'resultado' : {
							'ptap_type' : choice(["A", "B", "C", "D", "E", "F", "G"])
						}
					}
		return JsonResponse(jsonObject, safe=False)

		



