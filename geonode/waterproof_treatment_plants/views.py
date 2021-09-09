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
		try:            
			city_id = request.GET['city']
		except:
			city_id = ''
		response = requests.get(settings.SITE_HOST_API + 'treatment_plants/getTreatmentPlantsList/?city='+city_id,verify=False)
		return render(
			request,
			'waterproof_treatment_plants/treatment_plants_list.html',
			{
				'treatmentPlantsList': response.json()
			}
		)

def newTreatmentPlants(request):
	if request.method == 'GET':
		currencies = Countries.objects.values('currency', 'name', 'iso3').distinct().exclude(currency='').order_by('currency')
		return render(
			request,
			'waterproof_treatment_plants/treatment_plants_edit.html',
			context = {
				'currencies': currencies
			}
		)