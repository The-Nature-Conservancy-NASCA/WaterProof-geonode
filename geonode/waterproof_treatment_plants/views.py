from django.http import HttpResponse
from django.http.response import JsonResponse
from django.shortcuts import render
from django.conf import settings
import requests


def treatmentPlantsList(request):
	"""Returns the list of treatment plants in view

	Call the api service that looks for the treatment plants and sends them to the treatment plants view

	Parameters:
	without parameters

	Exceptions:
	without Exceptions
	"""
	if request.method == 'GET':
		response = requests.get(settings.SITE_HOST_API + 'treatment_plants/getTreatmentPlantsList/', verify=False)
		return render(
			request,
			'waterproof_treatment_plants/treatment_plants_list.html',
			{
				'treatmentPlantsList': response.json()
			}
		)

def newTreatmentPlants(request):
	if request.method == 'GET':
			return render(
				request,
				'waterproof_treatment_plants/treatment_plants_edit.html',
				{}
			)