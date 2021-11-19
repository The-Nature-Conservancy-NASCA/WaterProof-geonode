from django.http import HttpResponse
from django.http.response import JsonResponse
from rest_framework.decorators import api_view
from django.conf import settings
from django.contrib.auth.models import User
from django.core import serializers
from random import randrange, choice
from .models import *
import requests
import psycopg2
import json

@api_view(['GET'])
def getClosetsCities(request):
    x = request.GET['x']
    y = request.GET['y']
    con = psycopg2.connect(settings.DATABASE_URL)
    cur = con.cursor()
    query = "SELECT * from __wp_get_closest_cities(%s,%s)" % (x,y)
    cur.execute(query)
    rows = cur.fetchall()
    return JsonResponse(rows, safe=False)

@api_view(['GET'])
def getCountryByIso2(request):
    code = request.GET['code'].upper()
    
    country = Countries.objects.filter(iso2=code).values_list('name','region__name','currency','currency_symbol', 'iso3')
    c = Countries.objects.filter(iso2=code).first()
    region = c.subregion
    if (hasattr(c, 'region')):
        region = c.region.name
    print ("%s - %s - %s" % (c.name, region, c.currency))
    #serialized = serializers.serialize('json', country)
    try:
        result = {'country': c.name, 
                'region': region, 
                'currencies': [{'name': c.currency, 'symbol': c.currency_symbol}],
                'alpha3Code': c.iso3
            }
    except:
        result = {'country': code, 
                'region': '', 
                'currencies': [{'name': '', 'symbol': ''}],            
                'alpha3Code': code
            }


    #return HttpResponse(result, content_type='application/json')
    return JsonResponse(result, safe=False)

