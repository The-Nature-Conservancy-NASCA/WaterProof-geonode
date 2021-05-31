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
				"porcentDiscountRaterMinimumR":row[4],
				"porcentDiscountRaterMaximumR":row[5],
			})

		return JsonResponse(objects_list, safe=False)

@api_view(['GET'])
def getNetPresentValueSummary(request):
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
		cur.execute("SELECT * FROM __get_report_graph_vpn(" + request.query_params.get('studyCase') + ")")
		rows = cur.fetchall()
		objects_list = []
		for row in rows:
			objects_list.append({
				"currencyr":row[0],
				"implementationr":row[1],
				"maintenancer":row[2],
				"oportunityr":row[3],
				"transactionr":row[4],
				"platformr":row[5],
				"benefitr":row[6],
				"totalr":row[7],
			})

		return JsonResponse(objects_list, safe=False)

@api_view(['GET'])
def getCostAndBenefit(request):
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
		cur.execute("SELECT * FROM __get_report_graph_cost_bene(" + request.query_params.get('studyCase') + ")")
		rows = cur.fetchall()
		objects_list = []
		for row in rows:
			objects_list.append({
				"currencyr":row[0],
				"costr":row[1],
				"benefift":row[2]
			})

		return JsonResponse(objects_list, safe=False)

@api_view(['GET'])
def getTotalBenefitsForMilion(request):
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
		cur.execute("SELECT * FROM __get_report_total_benefits_for_milion(" + request.query_params.get('studyCase') + ")")
		rows = cur.fetchall()
		objects_list = []
		for row in rows:
			objects_list.append({
				"waterYear":row[0],
				"nitrogenLoad":row[1],
				"phosphorousLoad":row[2],
				"totalSediments":row[3],
				"baseFlow":row[4],
				"carbonStorage":row[5]
			})

		return JsonResponse(objects_list, safe=False)

@api_view(['GET'])
def getReportCostsAnalysisRoi(request):
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
		cur.execute("SELECT * FROM __get_report_costs_analysis_roi(" + request.query_params.get('studyCase') + ")")
		rows = cur.fetchall()
		objects_list = []
		for row in rows:
			objects_list.append({
				"record":row[0],
				"money":row[1],
				"date":row[2],
				"totalCost":row[3],
				"totalDiscountedCost":row[4],
				"totalBenefits":row[5],
				"totalDiscountedBenefits":row[6]
			})

		return JsonResponse(objects_list, safe=False)

@api_view(['GET'])
def getReportCostsAnalysisFilter(request):
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
		cur.execute("SELECT * FROM __get_report_costs_analysis_filter(" + request.query_params.get('studyCase') + ")")
		rows = cur.fetchall()
		objects_list = []
		for row in rows:
			objects_list.append({
				"name":row[0],
				"subName":row[1],
				"totalCost":row[2],
				"totalDiscountedCost":row[3],
				"totalBenefits":row[4],
				"totalDiscountedBenefits":row[5]
			})

		return JsonResponse(objects_list, safe=False)


@api_view(['GET'])
def getReportAnalysisBenefitsFilter(request):
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
		cur.execute("SELECT * FROM __get_report_analysis_benefits_filter(" + request.query_params.get('studyCase') + ")")
		rows = cur.fetchall()
		objects_list = []
		for row in rows:
			objects_list.append({
				"name":row[0],
				"subName":row[1],
				"subCategory":row[2],
				"totalCost":row[3],
				"totalBenefits":row[4]
			})

		return JsonResponse(objects_list, safe=False)


@api_view(['GET'])
def getReportCostsAnalysisFilter(request):
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
		cur.execute("SELECT typer, SUM(medbenefitr) AS sum_filter FROM __get_report_costs_analysis_filter(" + request.query_params.get('studyCase') + ") GROUP BY  typer ORDER BY typer")
		rows = cur.fetchall()
		objects_list = []
		for row in rows:
			objects_list.append({
				"typer":row[0],
				"sumFilter":row[1]
			})

		return JsonResponse(objects_list, safe=False)


@api_view(['GET'])
def getReportCostsAnalysisFilterNbs(request):
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
		cur.execute("SELECT cost_idr, SUM(medbenefitr) AS sum_filter FROM __get_report_costs_analysis_filter(" + request.query_params.get('studyCase') + ") WHERE cost_idr IN (SELECT DISTINCT cost_idr FROM __get_report_costs_analysis_filter(" + request.query_params.get('studyCase') + ") WHERE cost_idr LIKE '%NB%') GROUP BY cost_idr")

		rows = cur.fetchall()
		objects_list = []
		for row in rows:
			objects_list.append({
				"costIdr":row[0],
				"sumFilter":row[1]
			})

		return JsonResponse(objects_list, safe=False)


@api_view(['GET'])
def getReportAnalysisBenefitsFilterSum(request):
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
		cur.execute("SELECT typer ,SUM(vpn_med_benefitr) AS vpn_med_benefitr FROM __get_report_analysis_benefits_filter(" + request.query_params.get('studyCase') + ") GROUP BY typer")

		rows = cur.fetchall()
		objects_list = []
		for row in rows:
			objects_list.append({
				"typer":row[0],
				"vpnMedBenefitr":row[1]
			})

		return JsonResponse(objects_list, safe=False)


@api_view(['GET'])
def getWaterproofReportsAnalysisBenefits(request):
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
		cur.execute("SELECT element_id,type_id, SUM(vpn_med_benefit) AS vpn_med_benefit FROM waterproof_reports_analysis_benefits WHERE type_id<>'CARBONO' GROUP BY element_id, type_id")

		rows = cur.fetchall()
		objects_list = []
		for row in rows:
			objects_list.append({
				"elementId":row[0],
				"typeId":row[1],
				"vpnMedBenefit":row[2]
			})

		return JsonResponse(objects_list, safe=False)


@api_view(['GET'])
def getReportOportunityResultIndicators(request):
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
		cur.execute("SELECT * FROM __get_report_oportunity_result_indicators(" + request.query_params.get('studyCase') + ")")

		rows = cur.fetchall()
		objects_list = []
		for row in rows:
			objects_list.append({
				"currency":row[0],
				"value":row[1],
				"description":row[2]
			})

		return JsonResponse(objects_list, safe=False)












