from django.http import HttpResponse
from django.http.response import JsonResponse
from django.shortcuts import render
from django.conf import settings
import requests
from geonode.waterproof_parameters.models import Countries


def treatmentPlantsList(request):
	"""Returns the list of treatment plants in view

	Call the api service that looks for the treatment plants and sends them to the treatment plants view

	Parameters:
	without parameters

	Exceptions:
	without Exceptions
	"""
	if request.method == 'GET':
		user = -1
		city_id = ''
		try:            
			city_id = request.GET['city']

			if request.user.is_authenticated and request.user.professional_role != 'ADMIN':
				user = request.user.username
		except:
			print ("error!!")
			

		url = settings.SITE_HOST_API + 'treatment_plants/getTreatmentPlantsList/?city=%s&user=%s' % (city_id,user)
		#print (url)
		response = []
		
		try:
			response = requests.get(url,verify=False)
			response = response.json()
			
		except Exception as e:
			print ("must be anonymous user")
			# print (e)
		return render(
			request,
			'waterproof_treatment_plants/treatment_plants_list.html',
			{
				'treatmentPlantsList': response
			}
		)

def newTreatmentPlants(request):
	print("newTreatmentPlants")
	if request.method == 'GET':
		currencies = Countries.objects.values('pk', 'currency', 'name', 'iso3').distinct().exclude(currency='').order_by('currency')
		return render(
			request,
			'waterproof_treatment_plants/treatment_plants_edit.html',
			context = {
				'currencies': currencies,
				'mode': 'new',
				'plantId': '',
			}
		)

def updateTreatmentPlants(request, idx):
	print("updateTreatmentPlants")
	return manageTreatmentPlants(request, "edit", idx)

def cloneTreatmentPlants(request, idx):
	print("cloneTreatmentPlants")
	return manageTreatmentPlants(request, "clone", idx)

def viewTreatmentPlants(request, idx):
	print("viewTreatmentPlants")
	return manageTreatmentPlants(request, "view", idx)

def manageTreatmentPlants(request, mode, plantId):
	if request.method == 'GET':
		currencies = Countries.objects.values('pk', 'currency', 'name', 'iso3').distinct().exclude(currency='').order_by('currency')
		return render(
			request,
			'waterproof_treatment_plants/treatment_plants_edit.html',
			context = {
				'currencies': currencies,
				'mode': mode,
				'plantId': plantId,
			}
		)