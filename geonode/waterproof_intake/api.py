from django.http import HttpResponse
from django.http.response import JsonResponse
from rest_framework.decorators import api_view
from django.conf import settings
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
import requests
import json
from pytexit import py2tex


@api_view(['GET'])
def validatePyExpression(request):
	"""Validate Python Expression

	
	"""
	if request.method == 'GET':
		exp = request.GET['expression']
		latex = py2tex(exp)
		return JsonResponse(latex, safe=False)

