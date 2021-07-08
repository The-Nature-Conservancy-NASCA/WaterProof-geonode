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
def getReportCostsAnalysisFilterOne(request):
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
				"subName":row[2],
				"nameSubName":row[0]+row[2],
				"totalCost":row[3],
				"totalDiscountedCost":row[4],
				"totalBenefits":row[5],
				"totalDiscountedBenefits":row[6]
			})
		order_register = sorted(objects_list, key=lambda tree : tree['nameSubName'])
		return JsonResponse(order_register, safe=False)


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
				"name":row[2],
				"subName":row[2],
				"subCategory":row[3],
				"subNameCategory":row[2] + row[3],
				"totalCost":row[4],
				"totalBenefits":row[5]
			})

		order_register = sorted(objects_list, key=lambda tree : tree['subNameCategory'])
		return JsonResponse(order_register, safe=False)


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

@api_view(['GET'])
def getReportAnalisysBenefics(request):
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
		cur.execute("SELECT * FROM __get_report_analisys_benefics(" + request.query_params.get('studyCase') + ")")

		rows = cur.fetchall()
		objects_list = []
		for row in rows:
			objects_list.append({
				"nameIndicator":row[0],
				"value":row[1],
				"color":row[2],
				"description":row[3]
			})

		return JsonResponse(objects_list, safe=False)

@api_view(['GET'])
def getReportAnalisysBeneficsB(request):
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
		cur.execute("SELECT * FROM __get_report_analisys_beneficsB(" + request.query_params.get('studyCase') + ")")

		rows = cur.fetchall()
		objects_list = []
		for row in rows:
			objects_list.append({
				"changeInVolumeOfWater":row[0],
				"changeInBaseFlow":row[1],
				"changeIntotalSediments":row[2],
				"changeInNitrogenLoad":row[3],
				"changeInPhosphorus":row[4],
				"changeInCarbonStorage":row[5]
			})

		return JsonResponse(objects_list, safe=False)

@api_view(['GET'])
def getReportAnalisysBeneficsC(request):
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
		cur.execute("SELECT * FROM __get_report_analisys_beneficsC(" + request.query_params.get('studyCase') + ")")

		rows = cur.fetchall()
		objects_list = []
		for row in rows:
			objects_list.append({
				"sbnf":row[0],
				"costPerHectarea":row[1],
				"recomendedIntervetion":row[2]
			})

		return JsonResponse(objects_list, safe=False)

@api_view(['GET'])
def getSelectorStudyCasesId(request):
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
		cur.execute("SELECT ii.name AS selector, si.studycases_id FROM public.waterproof_study_cases_studycases SC INNER JOIN public.waterproof_study_cases_studycases_intakes SI ON (sc.id=si.studycases_id) INNER JOIN public.waterproof_intake_intake II ON (si.intake_id=ii.id) WHERE sc.id = '" + request.query_params.get('studyCase') + "'")

		rows = cur.fetchall()
		objects_list = []
		for row in rows:
			objects_list.append({
				"selector":row[0],
				"studyCasesId":row[1]
			})

		return JsonResponse(objects_list, safe=False)


@api_view(['GET'])
def getStudyCasesIntake(request):
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
		cur.execute("SELECT COUNT(*) as number_study_case FROM public.waterproof_study_cases_studycases_intakes si INNER JOIN public.waterproof_intake_intake ii  ON (si.intake_id=ii.id) inner join public.waterproof_intake_polygon ip on (ii.id=ip.intake_id) WHERE studycases_id = '" + request.query_params.get('studyCase') + "'")

		rows = cur.fetchall()
		objects_list = []
		for row in rows:
			objects_list.append({
				"numberStudyCase":row[0],
			})

		return JsonResponse(objects_list, safe=False)

@api_view(['GET'])
def getDistinctGroupErr(request):
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
		cur.execute("SELECT DISTINCT result_grouperr FROM  public.__get_wp_aqueduct_indicator_graph('" + request.query_params.get('studyCase') + "') ORDER BY result_grouperr")

		rows = cur.fetchall()
		objects_list = []
		for row in rows:
			objects_list.append({
				"resultGrouperr":row[0],
			})

		return JsonResponse(objects_list, safe=False)

@api_view(['GET'])
def getWpAqueductIndicatorGraph(request):
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
		cur.execute("SELECT * FROM public.__get_wp_aqueduct_indicator_graph('" + request.query_params.get('studyCase') + "') ORDER BY 2")

		rows = cur.fetchall()
		objects_list = []
		for row in rows:
			objects_list.append({
				"indicator":row[1],
				"valueIndicator":row[3],
				"description":row[4]
			})

		return JsonResponse(objects_list, safe=False)

@api_view(['GET'])
def getReportOportunityResultMaps(request):
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
		cur.execute("SELECT * FROM __get_report_oportunity_result_maps('" + request.query_params.get('studyCase') + "')")
		rows = cur.fetchall()
		objects_list = []
		for row in rows:
			objects_list.append({
				"name":row[0],
				"polygon": row[1]
			})
		"""
		"POLYGON ((-75.408333 4.716667, -75.408333 4.7, -75.433333 4.7, -75.433333 4.691667, -75.458333 4.691667, -75.458333 4.683333, -75.466667 4.683333, -75.466667 4.675, -75.47499999999999 4.675, -75.47499999999999 4.666667, -75.516667 4.666667, -75.516667 4.675, -75.533333 4.675, -75.533333 4.658333, -75.541667 4.658333, -75.541667 4.641667, -75.55 4.641667, -75.55 4.625, -75.541667 4.625, -75.541667 4.6, -75.533333 4.6, -75.533333 4.591667, -75.52500000000001 4.591667, -75.52500000000001 4.566667, -75.516667 4.566667, -75.516667 4.558333, -75.5 4.558333, -75.5 4.566667, -75.49166700000001 4.566667, -75.49166700000001 4.575, -75.483333 4.575, -75.483333 4.583333, -75.47499999999999 4.583333, -75.47499999999999 4.591667, -75.466667 4.591667, -75.466667 4.6, -75.445391 4.610647, -75.425 4.616667, -75.416667 4.616667, -75.416667 4.633333, -75.425 4.633333, -75.425 4.658333, -75.416667 4.658333, -75.416667 4.666667, -75.40000000000001 4.666667, -75.40000000000001 4.691667, -75.391667 4.691667, -75.391667 4.7, -75.38333299999999 4.7, -75.38333299999999 4.716667, -75.408333 4.716667))"
		[[-77.983333,0.941667],[-77.983333,0.933333],[-77.991667,0.933333],[-77.991667,0.925],[-78.016667,0.925],[-78.016667,0.916667],[-78.025,0.916667],[-78.025,0.908333],[-78.033333,0.908333],[-78.033333,0.875],[-78.016667,0.875],[-78.016667,0.866667],[-78.008333,0.866667],[-78.008333,0.858333],[-77.991667,0.858333],[-77.991667,0.85],[-77.983333,0.85],[-77.983333,0.841667],[-77.975,0.841667],[-77.975,0.833333],[-77.966667,0.833333],[-77.966667,0.825],[-77.95,0.825],[-77.95,0.816667],[-77.925,0.816667],[-77.925,0.841667],[-77.916667,0.841667],[-77.916667,0.883333],[-77.925,0.883333],[-77.925,0.908333],[-77.933333,0.908333],[-77.933333,0.916667],[-77.941667,0.916667],[-77.941667,0.925],[-77.95,0.925],[-77.95,0.933333],[-77.958333,0.933333],[-77.958333,0.941667],[-77.983333,0.941667]]
		"""
		return JsonResponse(objects_list, safe=False)