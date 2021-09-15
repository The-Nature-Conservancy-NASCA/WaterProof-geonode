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
			user = -1
			if not request.user.pk is None:
				user = request.user.pk
		except:
			city_id = ''

		print ("user: %s" % user)
		url = settings.SITE_HOST_API + 'treatment_plants/getTreatmentPlantsList/?city=%s&user=%s' % (city_id,user)
		response = []
		try:
			response = requests.get(url,verify=False)
			response = response.json()
		except:
			print ("must be anonymous user")
		return render(
			request,
			'waterproof_treatment_plants/treatment_plants_list.html',
			{
				'treatmentPlantsList': response
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