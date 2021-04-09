"""
Views for the ``django-WaterproofNbsCa`` application.

"""

import logging

from math import fsum
from geonode.base.enumerations import PROFESSIONAL_ROLES
from django.contrib import messages
from django.contrib.auth.models import User
from django.http import HttpResponse, Http404
from django.template.response import TemplateResponse
from django.urls import reverse
from django.utils import timezone
from django.utils.translation import ugettext_lazy as _
from django.views.generic import CreateView, DetailView, ListView, UpdateView, DeleteView
from django_libs.views_mixins import AccessMixin
from django.shortcuts import render
from .models import Regions, Countries, Cities
from django.core import serializers
from django.views import View
from django import template
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from decimal import Decimal
import json
from shapely.geometry import shape, Point, Polygon
logger = logging.getLogger(__name__)
register = template.Library()


def loadCityByName(request):
    language = request.GET.get('lang')
    cityName = request.GET.get('city')
    if (language == 'es'):
        city = Cities.objects.filter(standard_name_spanish=cityName)
        city_serialized = serializers.serialize('json', city)
        return JsonResponse(city_serialized, safe=False)
    elif(language == 'en'):
        city = Cities.objects.filter(standard_name_english=cityName)
        city_serialized = serializers.serialize('json', city)
        return JsonResponse(city_serialized, safe=False)
    else:
        errorMessage = 'Wrong language argument'
        context = {
            'status': '400', 'message': str(errorMessage)
        }
        response = HttpResponse(json.dumps(context), content_type='application/json')
        response.status_code = 400
        return response

def loadCurrency(request):
    currency = request.GET.get('currency')
    currencies = Countries.objects.filter(id=currency)
    currencies_serialized = serializers.serialize('json', currencies)
    return JsonResponse(currencies_serialized, safe=False)


def loadCurrencyByCountry(request):
    country_id = request.GET.get('country')
    currency = Countries.objects.filter(id=country_id)
    currencies_serialized = serializers.serialize('json', currency)
    return JsonResponse(currencies_serialized, safe=False)


def loadAllCurrencies(request):
    currencies = Countries.objects.all()
    currencies_serialized = serializers.serialize('json', currencies)
    return JsonResponse(currencies_serialized, safe=False)


def loadCountry(request):
    country = request.GET.get('country')
    countries = Countries.objects.filter(id=country)
    countries_serialized = serializers.serialize('json', countries)
    return JsonResponse(countries_serialized, safe=False)


def loadCountryByCode(request):
    code = request.GET.get('code')
    countries = Countries.objects.filter(iso3=code)
    countries_serialized = serializers.serialize('json', countries)
    return JsonResponse(countries_serialized, safe=False)


def loadAllCountries(request):
    countries = Countries.objects.all()
    countries_serialized = serializers.serialize('json', countries)
    return JsonResponse(countries_serialized, safe=False)

def loadRegionByCountry(request):
    countryId = request.GET.get('country')
    country = Countries.objects.get(id=countryId)
    regionId = country.region_id
    region = Regions.objects.filter(id=regionId)
    region_serialized = serializers.serialize('json', region)
    return JsonResponse(region_serialized, safe=False)

def verCiudad(request):
                return render(
                    request,
                    'waterproof_parameters/verCiudad.html',
                    {})