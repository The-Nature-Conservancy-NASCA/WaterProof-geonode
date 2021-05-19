from django.http import HttpResponse
from django.http.response import JsonResponse
from rest_framework.decorators import api_view
from django.conf import settings
from django.contrib.auth.models import User
from random import randrange, choice
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
		
