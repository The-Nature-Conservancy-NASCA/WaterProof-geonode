from django.http import HttpResponse
from django.http.response import JsonResponse
from django.shortcuts import render
from django.conf import settings
import requests

country = ""

def loadGlobalVariable(request):
	if request.method == 'GET':
		global country
		response = requests.get(settings.SITE_HOST_API + 'treatment_plants/getEnviroment/')
		country = response.json()

def treatmentPlantsList(request):
	if request.method == 'GET':
		global country
		loadGlobalVariable(request)
		response = requests.get(settings.SITE_HOST_API + 'treatment_plants/getTreatmentPlantsList/')
		return render(
			request,
			'waterproof_treatment_plants/treatment_plants_list.html',
			{
				'country': country[0],
				'treatmentPlantsList': response.json()
			}
		)

def editTreatmentPlants(request):
	if request.method == 'GET':
		global country
		loadGlobalVariable(request)
		response = requests.get(settings.SITE_HOST_API + 'treatment_plants/getIntakeList/')
		return render(
			request,
			'waterproof_treatment_plants/treatment_plants_edit.html',
			{
				'country': country[0],
				'intakeList': response.json()
			}
		)

def newTreatmentPlants(request, userCountryId):
	if request.method == 'GET':
		global country

		loadGlobalVariable(request)
		response = requests.get(settings.SITE_HOST_API + 'treatment_plants/getIntakeList/')
		return render(
			request,
			'waterproof_treatment_plants/treatment_plants_edit.html',
			{
				'country': country[0],
				'intakeList': response.json()
			}
		)