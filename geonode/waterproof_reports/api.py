from django.http import HttpResponse
from django.http.response import JsonResponse
from rest_framework.decorators import api_view
from django.conf import settings
from django.contrib.auth.models import User
from random import randrange, choice
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import DateTimeField
import requests
import psycopg2
import json


@api_view(['GET'])
def getSensibilityAnalysisCost(request):
	"""Returns the list of treatment plants

	Find all the stored treatment plants that have
	the minimum characteristics stored in all components

	Parameters:
	without parameters

	Exceptions:
	If it does not have data in the minimal relations of the model it does not deliver
	information about the treatment plant
	"""
	if request.method == 'GET':
		con = psycopg2.connect(settings.DATABASE_URL)
		cur = con.cursor()
		cur.execute("SELECT * FROM __get_report_analisys_sensitivy_cost(" + request.query_params.get('studyCase') + ")")
		rows = cur.fetchall()
		objects_list = []
		for row in rows:
			objects_list.append({
				"timer":row[0],
				"totalMinCostR":row[1],
				"totalMedCostR":row[2],
				"totalMaxCostR":row[3],
			})

		return JsonResponse(objects_list, safe=False)

@api_view(['GET'])
def getSensibilityAnalysisBenefits(request):
	"""Returns the list of treatment plants

	Find all the stored treatment plants that have
	the minimum characteristics stored in all components

	Parameters:
	without parameters

	Exceptions:
	If it does not have data in the minimal relations of the model it does not deliver
	information about the treatment plant
	"""
	if request.method == 'GET':
		con = psycopg2.connect(settings.DATABASE_URL)
		cur = con.cursor()
		cur.execute("SELECT * FROM __get_report_analisys_sensitivy_benefits(" + request.query_params.get('studyCase') + ")")
		rows = cur.fetchall()
		objects_list = []
		for row in rows:
			objects_list.append({
				"timer":row[0],
				"totalMinBenefitR":row[1],
				"totalMedBenefitR":row[2],
				"totalMaxBenefittR":row[3],
			})

		return JsonResponse(objects_list, safe=False)

@api_view(['GET'])
def getSensibilityAnalysisCostVsBenefit(request):
	"""Returns the list of treatment plants

	Find all the stored treatment plants that have
	the minimum characteristics stored in all components

	Parameters:
	without parameters

	Exceptions:
	If it does not have data in the minimal relations of the model it does not deliver
	information about the treatment plant
	"""
	if request.method == 'GET':
		con = psycopg2.connect(settings.DATABASE_URL)
		cur = con.cursor()
		cur.execute("SELECT * FROM __get_report_graph_cost_vs_benefit(" + request.query_params.get('studyCase') + ")")
		rows = cur.fetchall()
		objects_list = []
		for row in rows:
			objects_list.append({
				"totalMinimumR":row[0],
				"totalMediumR":row[1],
				"totalMaximumR":row[2],
				"titleR":row[3],
			})

		return JsonResponse(objects_list, safe=False)

@api_view(['GET'])
def getSensibilityAnalysisReturnOfInvest(request):
	"""Returns the list of treatment plants

	Find all the stored treatment plants that have
	the minimum characteristics stored in all components

	Parameters:
	without parameters

	Exceptions:
	If it does not have data in the minimal relations of the model it does not deliver
	information about the treatment plant
	"""
	if request.method == 'GET':
		con = psycopg2.connect(settings.DATABASE_URL)
		cur = con.cursor()
		cur.execute("SELECT * FROM __get_report_graph_return_of_invest_roi(" + request.query_params.get('studyCase') + ")")
		rows = cur.fetchall()
		objects_list = []
		for row in rows:
			objects_list.append({
				"roiMediumR":row[0],
				"roiMaximumR":row[1],
				"roiMinimumR":row[2],
				"porcentDiscountRater":row[3],
				"porcentDiscountRaterMinimumR":row[3],
				"porcentDiscountRaterMaximumR":row[3],
			})

		return JsonResponse(objects_list, safe=False)
