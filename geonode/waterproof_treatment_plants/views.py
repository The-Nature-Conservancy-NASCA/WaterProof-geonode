from django.http import HttpResponse
from django.http.response import JsonResponse
from django.shortcuts import render
from django.conf import settings
import requests


def treatmentPlantsList(request):
	if request.method == 'GET':
		response = requests.get(settings.SITE_HOST_API + 'treatment_plants/getTreatmentPlantsList/')
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