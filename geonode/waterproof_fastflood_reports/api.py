from glob import glob
import os
from django.http import HttpResponse
from django.http.response import JsonResponse
from geonode.waterproof_fastflood.models import Watershed, StudyCases, Polygon
from rest_framework.decorators import api_view
from django.conf import settings
from django.contrib.auth.models import User
from random import randrange, choice
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import DateTimeField
import requests
import psycopg2
import json
import csv
import logging
import re

logger = logging.getLogger(__name__)

BASE_PATH_FASTFLOOD = '/app/outputs/fastflood'

@api_view(['GET'])
def getSensibilityAnalysisCost(request):
	"""Returns the list of treatment plants

	Find all the stored treatment plants that have
	the minimum characteristics stored in all components

	Parameters:
	Study case id (int)

	Exceptions:
	If it does not have data in the minimal relations of the model it does not deliver
	information about the treatment plant
	"""
	if request.method == 'GET':
		try:
			con = psycopg2.connect(settings.DATABASE_URL)
			cur = con.cursor()
			sql ="SELECT * FROM __get_report_analisys_sensitivy_cost_fastflood(%s)" % int(request.query_params.get('studyCase'))
			cur.execute(sql)
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
		except Exception as e:
			return JsonResponse({"error": 'invalid id'})

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
		try:
			con = psycopg2.connect(settings.DATABASE_URL)
			cur = con.cursor()
			sql = "SELECT * FROM __get_report_analisys_sensitivy_benefits_fastflood(%s)" % int(request.query_params.get('studyCase'))
			cur.execute(sql)
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
		except Exception as e:
			return JsonResponse({"error": 'invalid id'})

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
		try:
			con = psycopg2.connect(settings.DATABASE_URL)
			cur = con.cursor()
			sql = "SELECT * FROM __get_report_graph_cost_vs_benefit_fastflood(%s)" % int(request.query_params.get('studyCase'))
			cur.execute(sql)
			rows = cur.fetchall()
			objects_list = []
			for row in rows:
				objects_list.append({
					"totalMinimumR":row[0],
					"totalMediumR":row[1],
					"totalMaximumR":row[2],
					"titleR":row[3],
					"porcen_discount_rateR":row[4],
					"porcen_discount_rate_minimumR":row[5],
					"porcen_discount_rate_maximumR":row[6],
				})
			return JsonResponse(objects_list, safe=False)
		except Exception as e:
			return JsonResponse({"error": 'invalid id'})

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
		try:
			con = psycopg2.connect(settings.DATABASE_URL)
			cur = con.cursor()
			sql = "SELECT * FROM __get_report_graph_return_of_invest_roi_fastflood(%s)" % int(request.query_params.get('studyCase'))
			cur.execute(sql)
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
		except Exception as e:
			return JsonResponse({"error": 'invalid id'})

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
		try:
			con = psycopg2.connect(settings.DATABASE_URL)
			cur = con.cursor()
			sql = "SELECT * FROM __get_report_graph_vpn_fastflood(%s)" % int(request.query_params.get('studyCase'))
			cur.execute(sql)
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
		except Exception as e:
			return JsonResponse({"error": 'invalid id'})

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
		try:
			con = psycopg2.connect(settings.DATABASE_URL)
			cur = con.cursor()
			sql = "SELECT * FROM __get_report_graph_cost_bene_fastflood(%s)" % int(request.query_params.get('studyCase'))
			cur.execute(sql)
			rows = cur.fetchall()
			objects_list = []
			for row in rows:
				objects_list.append({
					"currencyr":row[0],
					"costr":row[1],
					"benefift":row[2]
				})
			return JsonResponse(objects_list, safe=False)
		except Exception as e:
			return JsonResponse({"error": 'invalid id'})

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
		try:
			con = psycopg2.connect(settings.DATABASE_URL)
			cur = con.cursor()
			sql = "SELECT * FROM __get_report_total_benefits_for_milion(%s)" % int(request.query_params.get('studyCase'))
			cur.execute(sql)
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
		except Exception as e:
			return JsonResponse({"error": 'invalid id'})

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
		try:
			con = psycopg2.connect(settings.DATABASE_URL)
			cur = con.cursor()
			sql = "SELECT * FROM __get_report_costs_analysis_roi_fastflood(%s)" % int(request.query_params.get('studyCase'))	
			cur.execute(sql)
			rows = cur.fetchall()
			objects_list = []
			for row in rows:
				objects_list.append({
					"record":row[0],
					"money":row[1],
					"date":row[2],
					"totalCost":row[4],
					"totalDiscountedCost":row[6],
					"totalBenefits":row[3],
					"totalDiscountedBenefits":row[5]
				})
			return JsonResponse(objects_list, safe=False)
		except Exception as e:
			return JsonResponse({"error": 'invalid id'})

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
		try:
			con = psycopg2.connect(settings.DATABASE_URL)
			cur = con.cursor()
			sql = "SELECT * FROM __get_report_costs_analysis_filter_fastflood(%s)" % int(request.query_params.get('studyCase'))
			cur.execute(sql)
			rows = cur.fetchall()
			objects_list = []
			for row in rows:
				objects_list.append({
					"name":row[0],
					"subName":row[2],
					"nameSubName":row[0]+row[2],
					"totalCost":row[3],
					"totalDiscountedCost":row[6],
					"totalBenefits":row[5],
					"totalDiscountedBenefits":row[4],
					"year": row[1]
				})
			order_register = sorted(objects_list, key=lambda tree : tree['nameSubName'])
			return JsonResponse(order_register, safe=False)
		except Exception as e:
			return JsonResponse({"error": 'invalid id'})

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
		try:
			con = psycopg2.connect(settings.DATABASE_URL)
			cur = con.cursor()
			sql = "SELECT * FROM __get_report_analysis_benefits_filter_fastflood(%s)" % int(request.query_params.get('studyCase'))
			cur.execute(sql)
			rows = cur.fetchall()
			objects_list = []
			for row in rows:
				objects_list.append({
					"name":row[2],
					"subName":row[2],
					"subCategory":row[3],
					"subNameCategory":str(row[2]) + str(row[3]),
					"totalBenefits":row[4],
					"totalBenefitsDiscount":row[5],
					"year": row[1]
				})
			order_register = sorted(objects_list, key=lambda tree : tree['subNameCategory'])
			return JsonResponse(order_register, safe=False)
		except Exception as e:
			return JsonResponse({"error": 'invalid id'})


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
		try:
			con = psycopg2.connect(settings.DATABASE_URL)
			cur = con.cursor()
			sql = "SELECT typer, round(cast(SUM(medbenefitr) as numeric),2)::double precision AS sum_filter FROM __get_report_costs_analysis_filter_fastflood(%s) GROUP BY  typer ORDER BY typer" % int(request.query_params.get('studyCase'))
			cur.execute(sql)
			rows = cur.fetchall()
			objects_list = []
			for row in rows:
				objects_list.append({
					"typer":row[0],
					"sumFilter":row[1]
				})
			return JsonResponse(objects_list, safe=False)
		except Exception as e:
			return JsonResponse({"error": 'invalid id'})


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
		try:
			con = psycopg2.connect(settings.DATABASE_URL)
			cur = con.cursor()
			sql = "select typer as cost_idr, medbenefitr AS sum_filter from __get_report_costs_analysis_filterBgraph_fastflood(%s)" % int(request.query_params.get('studyCase'))
			cur.execute(sql)
			rows = cur.fetchall()
			objects_list = []
			for row in rows:
				objects_list.append({
					"costIdr":row[0],
					"sumFilter":row[1]
				})
			return JsonResponse(objects_list, safe=False)
		except Exception as e:
			return JsonResponse({"error": 'invalid id'})

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
		try:
			con = psycopg2.connect(settings.DATABASE_URL)
			cur = con.cursor()
			sql = "SELECT case when typer='CARBONO' then 'CARBON' else typer end as typer,round(cast(SUM(vpn_med_benefitr) as numeric),2)::double precision AS vpn_med_benefitr FROM __get_report_analysis_benefits_filter_fastflood(%s) GROUP BY typer" % int(request.query_params.get('studyCase'))
			cur.execute(sql)
			rows = cur.fetchall()
			objects_list = []
			for row in rows:
				objects_list.append({
					"typer":row[0],
					"vpnMedBenefitr":row[1]
				})
			return JsonResponse(objects_list, safe=False)
		except Exception as e:
			return JsonResponse({"error": 'invalid id'})

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
		try:
			con = psycopg2.connect(settings.DATABASE_URL)
			cur = con.cursor()
			sql = "select element_normalize_categorya as element_id,type_ida as type_id, vpn_med_benefita as vpn_med_benefit from __get_report_incicator_benefist_graphA(%s)" % int(request.query_params.get('studyCase'))
			cur.execute(sql)

			rows = cur.fetchall()
			objects_list = []
			for row in rows:
				objects_list.append({
					"elementId":row[0],
					"typeId":row[1],
					"typeElementId":str(row[1]) + str(row[0]),
					"vpnMedBenefit":row[2]
				})

			order_register = sorted(objects_list, key=lambda tree : tree['typeElementId'])
			return JsonResponse(order_register, safe=False)
		except Exception as e:
			return JsonResponse({"error": 'invalid id'})

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
		try:
			con = psycopg2.connect(settings.DATABASE_URL)
			cur = con.cursor()
			sql = "SELECT * FROM __get_report_oportunity_result_indicators_fastflood(%s)"	% int(request.query_params.get('studyCase'))
			cur.execute(sql)
			rows = cur.fetchall()
			objects_list = []
			for row in rows:
				objects_list.append({
					"currency":row[0],
					"value":row[1],
					"description":row[2]
				})
			return JsonResponse(objects_list, safe=False)
		except Exception as e:
			return JsonResponse({"error": 'invalid id'})

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
	print("getReportAnalisysBenefics")
	if request.method == 'GET':
		try:
			con = psycopg2.connect(settings.DATABASE_URL)
			cur = con.cursor()
			print (request.query_params.get('studyCase'))			
			sql = "SELECT * FROM __get_report_analisys_benefics_fastflood(%s)" % int(request.query_params.get('studyCase'))
			cur.execute(sql)
			rows = cur.fetchall()
			objects_list = []
			for row in rows:
				objects_list.append({
					"nameIndicator":row[0],
					"value":row[1],
					"color":row[2],
					"description":row[3],
					"intakeId":row[4]
				})
			return JsonResponse(objects_list, safe=False)
		except Exception as e:
			return JsonResponse({"error": 'invalid id'})

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
		try:
			con = psycopg2.connect(settings.DATABASE_URL)
			cur = con.cursor()
			sql = "SELECT * FROM __get_report_analisys_beneficsB_fastflood(%s)" % int(request.query_params.get('studyCase'))
			cur.execute(sql)
			rows = cur.fetchall()
			objects_list = []
			for row in rows:
				objects_list.append({
					"changeInVolumeOfWater":row[0],
					"changeInBaseFlow":row[1],
					"changeIntotalSediments":row[2],
					"changeInNitrogenLoad":row[3],
					"changeInPhosphorus":row[4],
					"changeInCarbonStorage":row[5],
					"time":row[6],
					"currency":row[7],
					"roi":row[8],
					"result":row[9],
					"transactionCost":row[10]
				})
			return JsonResponse(objects_list, safe=False)
		except Exception as e:
			return JsonResponse({"error": 'invalid id'})

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
		try:
			con = psycopg2.connect(settings.DATABASE_URL)
			cur = con.cursor()
			sql = "SELECT * FROM __get_report_analisys_beneficsC_fastflood(%s) ORDER BY intake_idf" % int(request.query_params.get('studyCase'))
			cur.execute(sql)

			rows = cur.fetchall()
			objects_list = []
			for row in rows:
				objects_list.append({
					"sbnf":row[0],
					"costPerHectarea":row[1],
					"recomendedIntervetion":row[2],
					"intakeId":row[3],
					"name":row[4]
				})

			return JsonResponse(objects_list, safe=False)
		except Exception as e:
			return JsonResponse({"error": 'invalid id'})

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
		try:
			study_case_id = int(request.query_params.get('studyCase'))
			con = psycopg2.connect(settings.DATABASE_URL)
			cur = con.cursor()
			sql = "select * from public.__get_wp_report_ppalselect(%s)" % study_case_id
			cur.execute(sql)
			rows = cur.fetchall()
			objects_list = []
			for row in rows:
				objects_list.append({
					"selector":row[0],
					"intakeId":row[1],				
					"center" : row[2],
					"studyCasesId":row[3],
					"studyCasesName":row[4],				
				})
			return JsonResponse(objects_list, safe=False)
		except Exception as e:
			return JsonResponse({"error": 'invalid id'})


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
		try:
			con = psycopg2.connect(settings.DATABASE_URL)
			cur = con.cursor()
			sql = "SELECT COUNT(*) as number_study_case FROM public.waterproof_study_cases_studycases_intakes si INNER JOIN public.waterproof_intake_intake ii  ON (si.intake_id=ii.id) inner join public.waterproof_intake_polygon ip on (ii.id=ip.intake_id) WHERE studycases_id = %s" % int(request.query_params.get('studyCase'))
			cur.execute(sql)
			rows = cur.fetchall()
			objects_list = []
			for row in rows:
				objects_list.append({
					"numberStudyCase":row[0],
				})
			return JsonResponse(objects_list, safe=False)
		except Exception as e:
			return JsonResponse({"error": 'invalid id'})

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
		try:
			con = psycopg2.connect(settings.DATABASE_URL)
			cur = con.cursor()
			sql = "SELECT DISTINCT result_grouperr FROM public.__get_wp_aqueduct_indicator_graph(%s) ORDER BY result_grouperr" % int(request.query_params.get('studyCase'))
			cur.execute(sql)
			rows = cur.fetchall()
			objects_list = []
			for row in rows:
				objects_list.append({
					"resultGrouperr":row[0],
				})
			return JsonResponse(objects_list, safe=False)
		except Exception as e:
			return JsonResponse({"error": 'invalid id'})

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
		try:
			con = psycopg2.connect(settings.DATABASE_URL)
			cur = con.cursor()
			sql = "SELECT * FROM public.__get_wp_aqueduct_indicator_graph(%s) ORDER BY indicatorr, inteker" % int(request.query_params.get('studyCase'))
			cur.execute(sql)
			rows = cur.fetchall()
			objects_list = []
			for row in rows:
				objects_list.append({
					"indicator":row[1],
					"sigla":row[2],
					"valueIndicator":row[3],
					"description":row[4],
					"intake":row[5],
					"name":row[6],
					"valueGraT":row[7]
				})
			return JsonResponse(objects_list, safe=False)
		except Exception as e:
			return JsonResponse({"error": 'invalid id'})

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
		try:
			objects_list = []
			csId = int(request.query_params.get('studyCase'))
			studyCase = StudyCases.objects.get(id=csId) 
			for ws in studyCase.watershed.all():
				watershed = Watershed.objects.get(id=ws.id)
				polygon = Polygon.objects.get(watershed=watershed.id)  
				objects_list.append({
					"name": watershed.name,
					"watershedId": watershed.id,
					"studyCaseId": csId,
					"studyCaseName": studyCase.name,
					"polygon": str(polygon.geom.wkt)
				})
			# watershed = Watershed.objects.get(id=studyCase.watershed.watershed_id)
			# polygon = Polygon.objects.get(watershed=watershed.id)  
			# objects_list.append({
			# 	# "name": watershed.name,
			# 	# "watershedId": watershed.id,
			# 	"studyCaseId": csId,
			# 	"studyCaseName": studyCase.name,
			# 	# "polygon": polygon.geom,
			# })
			return JsonResponse(objects_list, safe=False)
		except Exception as e:
			return JsonResponse({"error": str(e)})
	# if request.method == 'GET':
	# 	try:
	# 		con = psycopg2.connect(settings.DATABASE_URL)
	# 		cur = con.cursor()
	# 		sql = "SELECT * FROM __get_report_oportunity_result_maps(%s)" % int(request.query_params.get('studyCase'))
	# 		cur.execute(sql)
	# 		rows = cur.fetchall()
	# 		objects_list = []
	# 		for row in rows:
	# 			objects_list.append({
	# 				"name":row[0],
	# 				"polygon": row[1]
	# 			})
	# 		return JsonResponse(objects_list, safe=False)
	# 	except Exception as e:
	# 		return JsonResponse({"error": 'invalid id'})

@api_view(['GET'])
def getSizeRecomendedIntervention(request):
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
		try:
			con = psycopg2.connect(settings.DATABASE_URL)
			cur = con.cursor()
			sql = "select porcentajeIpler from __get_size_recomended_intervention(%s)" % int(request.query_params.get('studyCase'))
			cur.execute(sql)
			rows = cur.fetchall()
			objects_list = []
			for row in rows:
				objects_list.append({
					"sizeRecomendedIntervention":row[0],
				})
			return JsonResponse(objects_list, safe=False)
		except Exception as e:
			return JsonResponse({"error": 'invalid id'})

@api_view(['GET'])
def getNameWaterproofIntakeIntake(request):
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
		try:
			con = psycopg2.connect(settings.DATABASE_URL)
			cur = con.cursor()
			sql = "SELECT distinct ii.name, ii.id FROM public.waterproof_intake_intake ii INNER JOIN public.waterproof_reports_rios_ipa si ON (ii.id=si.intake_id) WHERE si.study_case_id= %s" % int(request.query_params.get('studyCase'))
			cur.execute(sql)
			rows = cur.fetchall()
			objects_list = []
			for row in rows:
				objects_list.append({
					"name":row[0],
					"id":row[1]
				})
			return JsonResponse(objects_list, safe=False)
		except Exception as e:
			return JsonResponse({"error": 'invalid id'})

@api_view(['GET'])
def getTotalSizeWaterproofIntakePolygon(request):
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
		try:
			con = psycopg2.connect(settings.DATABASE_URL)
			cur = con.cursor()
			sql = "SELECT SUM(area) as total_size FROM public.waterproof_intake_polygon ip INNER JOIN public.waterproof_study_cases_studycases_intakes si ON (ip.intake_id =si.intake_id) WHERE si.studycases_id = %s" % int(request.query_params.get('studyCase'))
			cur.execute(sql)
			rows = cur.fetchall()
			objects_list = []
			for row in rows:
				objects_list.append({
					"totalSize":row[0],
				})
			return JsonResponse(objects_list, safe=False)
		except Exception as e:
			return JsonResponse({"error": 'invalid id'})

@api_view(['GET'])
def getWaterproofReportsRiosIpa(request):
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
		try:
			con = psycopg2.connect(settings.DATABASE_URL)
			cur = con.cursor()
			sql = "SELECT sbnf AS sbn, costperhectaref AS actual_spent, recommendedinterventionf AS area_converted_ha, intake_idf FROM __get_report_analisys_beneficsc(%s)" % int(request.query_params.get('studyCase'))
			cur.execute(sql)
			rows = cur.fetchall()
			objects_list = []
			for row in rows:
				objects_list.append({
					"sbn":row[0],
					"actualSpent":row[1],
					"areaConvertedHa":row[2],
					"intakeId":row[3]
				})
			return JsonResponse(objects_list, safe=False)
		except Exception as e:
			return JsonResponse({"error": 'invalid id'})

@api_view(['GET'])
def getWaterproofReportsDesagregation(request):
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
		try:
			con = psycopg2.connect(settings.DATABASE_URL)
			cur = con.cursor()
			sql = "SELECT * FROM __get_report_temporalProjection(%s)" % int(request.query_params.get('studyCase'))
			cur.execute(sql)
			rows = cur.fetchall()
			objects_list = []
			for row in rows:
				objects_list.append({
					"time":row[0],
					"stageFilter":row[1],
					"volumeOfWaterYieldChangeInTime":row[2],
					"annualVolumeBaseFlowChangeInTime":row[3],
					"totalSedimentsChangeInTime":row[4],
					"nitrogenLoadChangeInTime":row[5],
					"phosphorusLoadChangeInTime":row[6],
					"carbonStorageChangeInTime":row[7],
					"stage":row[8],
					"intakeId":row[9],
					"name":row[10]
				})
			return JsonResponse(objects_list, safe=False)
		except Exception as e:
			return JsonResponse({"error": 'invalid id'})

@api_view(['GET'])
def getCaracteristicsCsIntakePdf(request):
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
		try:
			con = psycopg2.connect(settings.DATABASE_URL)
			cur = con.cursor()
			sql = "SELECT * FROM __get_caracteristics_cs_intake_pdf(%s)" % int(request.query_params.get('studyCase'))
			cur.execute(sql)
			rows = cur.fetchall()
			objects_list = []
			for row in rows:
				objects_list.append({
					"name":row[0],
					"intakeId":row[2],
					"description":row[1]
				})
			return JsonResponse(objects_list, safe=False)
		except Exception as e:
			return JsonResponse({"error": 'invalid id'})

@api_view(['GET'])
def getCaracteristicsPtapDetailPdf(request):
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
		try:
			con = psycopg2.connect(settings.DATABASE_URL)
			cur = con.cursor()
			sql = "SELECT DISTINCT * FROM __get_caracteristics_ptap_detail_pdf(%s) ORDER BY 1" % int(request.query_params.get('studyCase'))
			cur.execute(sql)
			rows = cur.fetchall()
			objects_list = []
			for row in rows:
				objects_list.append({
					"name":row[0],
					"plantId":row[3],
					"description":row[1],
					"isUsed":row[4]
				})
			return JsonResponse(objects_list, safe=False)
		except Exception as e:
			return JsonResponse({"error": 'invalid id'})

@api_view(['GET'])
def getconservationActivitiesPdf(request):
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
		try:
			con = psycopg2.connect(settings.DATABASE_URL)
			cur = con.cursor()
			sql = "SELECT * FROM __get_conservation_activities_pdf(%s)" % int(request.query_params.get('studyCase'))
			cur.execute(sql)
			rows = cur.fetchall()
			objects_list = []
			for row in rows:
				objects_list.append({
					"name":row[0],
					"description":row[1],
					"benefit":row[2],
					"implementation":row[3],
					"maintenance":row[4],
					"periodicity":row[5],
					"oportunity":row[6],
					"profit_pct_time": row[7]
				})
			return JsonResponse(objects_list, safe=False)
		except Exception as e:
			return JsonResponse({"error": 'invalid id'})

@api_view(['GET'])
def getFinancialAnalysisPdfRunAnalisisPdf(request):
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
		try:
			con = psycopg2.connect(settings.DATABASE_URL)
			cur = con.cursor()
			sql = "SELECT * FROM __get_financial_analysis_pdf_runAnalisis_pdf(%s)" % int(request.query_params.get('studyCase'))
			cur.execute(sql)
			rows = cur.fetchall()
			objects_list = []
			for row in rows:
				objects_list.append({
					"platformCost":str(row[0]),
					"discountRate":str(row[1]),
					"discountRateMinimum":str(row[2]),
					"discountRateMaximum":str(row[3]),
					"fullPorfolio":str(row[4]),
					"fullRoi":str(row[5]),
					"fullScenario":str(row[6])
				})
			return JsonResponse(objects_list, safe=False)
		except Exception as e:
			return JsonResponse({"error": 'invalid id'})

@api_view(['GET'])
def getObjetivesForPorfoliosPdf(request):
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
		sql = "SELECT * FROM __get_objetives_for_porfolios_pdf(%s)" % int(request.query_params.get('studyCase'))
		cur.execute(sql)
		rows = cur.fetchall()
		objects_list = []
		for row in rows:
			objects_list.append({
				"name":str(row[0])
			})
		return JsonResponse(objects_list, safe=False)

@api_view(['GET'])
def getWpcompareMapas(request):
	"""Returns the rute of folder for result maps

	Find the of results executed path  
	the minimum characteristics stored in all components

	Parameters:
	without parameters

	Exceptions:
	If it does not have data in the minimal relations of the model it does not deliver
	information about the treatment plant
	"""
	if request.method == 'GET':
		try:
			con = psycopg2.connect(settings.DATABASE_URL)
			cur = con.cursor()
			sql = "SELECT * FROM public.__get_reports_compare_maps_fastflood(%s)" % int(request.query_params.get('studyCase'))
			cur.execute(sql)
			rows = cur.fetchall()
			objects_list = []
			for row in rows:
				objects_list.append({
					"folder":row[0],
					"intake":row[4],
					"region":row[2],
					"year":row[3],
					"studycase":row[1],
					"center":row[5],
					"nameIntake":row[6]
				})
			return JsonResponse(objects_list, safe=False)
		except Exception as e:
			return JsonResponse({"error": 'invalid id'})


@api_view(['GET'])
def getStudyCaseInfo(request):
    try:
        study_case_id = int(request.query_params.get('studyCase'))
        study_case = StudyCases.objects.get(id=study_case_id)
        name = study_case.name
        city_name = study_case.city.name
        country_name = study_case.city.country.name
        region_name = study_case.city.country.region.name
        folder = study_case.folder_name
        watershed = study_case.watershed.first().id

        return JsonResponse({"name": name, "city": city_name, "country": country_name, "region": region_name, "watershed": watershed, "folder": folder})
    except Exception as e:
        return JsonResponse({"error": f'invalid id: {e}'}, status=400)

@api_view(['GET'])
def testApi(request):
	return JsonResponse({"message": "Test API is working"})

@api_view(['GET'])
def getFloodMitigation(request):

	if request.method == 'GET':
		try:
			api_server = settings.WATERPROOF_API_SERVER
			server = api_server.replace("/proxy/?url=","").replace("wf-models","")
			out_damage_path = "/ROI/out/6.0_Damage_Saves.csv"
			carbon_saves_file = "/ROI/out/7.0_Carbons_Saves.csv"
			
			case_folder = request.query_params.get('case_folder')
			complete_path = os.path.join(BASE_PATH_FASTFLOOD, case_folder) + out_damage_path
			carbon_saves_complete_path = os.path.join(BASE_PATH_FASTFLOOD, case_folder) + carbon_saves_file
			url_path = server + "outputs/fastflood/" + case_folder + out_damage_path
			url_path_carbon_saves = server + "outputs/fastflood/" + case_folder + carbon_saves_file
			data = []

			# Check if local file exists, otherwise use URL
			total_carbon = 0
			if os.path.exists(complete_path):
				# Read from local file
				with open(complete_path, newline='', encoding='utf-8') as csvfile:
					reader = csv.DictReader(csvfile)
					for row in reader:
						data.append(row)
				with open(carbon_saves_complete_path, newline='', encoding='utf-8') as csvfile:
					reader = csv.DictReader(csvfile)
					for row in reader:						
						total_carbon += float(row["Carbons"])
			else:
				# Read from URL
				logger.info(f"Local file not found: {complete_path}, trying URL: {url_path}")
				response = requests.get(url_path)
				response.raise_for_status()  # Raises an HTTPError for bad responses

				# Parse CSV from URL response
				csv_content = response.text
				reader = csv.DictReader(csv_content.splitlines())
				for row in reader:
					data.append(row)

				response = requests.get(url_path_carbon_saves)
				response.raise_for_status()  # Raises an HTTPError for bad responses
				csv_content = response.text
				reader = csv.DictReader(csv_content.splitlines())
				for row in reader:
					total_carbon += float(row["Carbons"])

			total_data = {"damage_saves": data, "total_carbon": total_carbon}
			return JsonResponse(total_data, safe=False)
		except requests.exceptions.RequestException as e:
			logger.error(f"Error fetching from URL {url_path}: {str(e)}")
			return JsonResponse({"error": f"Error al acceder al archivo desde URL: {str(e)}"}, status=500)
		except Exception as e:
			logger.error(f"Error reading flood mitigation file: {str(e)}")
			return JsonResponse({"error": f"Error al leer el archivo CSV: {str(e)}"}, status=500)

@api_view(['GET'])
def getHydrograph(request):
    if request.method == 'GET':
        try:
            api_server = settings.WATERPROOF_API_SERVER
            server = api_server.replace("/proxy/?url=","").replace("wf-models","")
            
            case_folder = request.query_params.get('case_folder')
            watershedId = request.query_params.get('watershedId')
            period = request.query_params.get('period', '2')

            target_dir = os.path.join(BASE_PATH_FASTFLOOD, case_folder, "WI_" + watershedId, "out", "06-FLOOD", "Discharge")
            file_pattern = os.path.join(target_dir, f"*{period}.csv")

            all_data = []

            # Check if local directory exists, otherwise use URL
            if os.path.exists(target_dir):
                # Read from local files
                files = glob(file_pattern)

                for file_path in files:
                    file_name = os.path.basename(file_path)
                    scenario_key = os.path.splitext(file_name)[0]

                    if "Current" in scenario_key:
                        scenario_key = "Q Current"
                    elif "BaU" in scenario_key:
                        scenario_key = "Q BaU"
                    elif "NbS" in scenario_key:
                        scenario_key = "Q NbS"

                    with open(file_path, newline='', encoding='utf-8') as csvfile:
                        reader = csv.DictReader(csvfile)
                        for row in reader:
                            formatted_row = {}
                            for key, value in row.items():
                                try:
                                    num = float(value)
                                    formatted_row[key] = format(num, '.20f')
                                except ValueError:
                                    formatted_row[key] = value
                            formatted_row["scenario"] = scenario_key
                            all_data.append(formatted_row)

            # Read display status file
            display_status = []
            diagnostic_dir = os.path.join(target_dir, "_diagnostics")

            if os.path.exists(diagnostic_dir):
                diagnostic_file = os.path.join(diagnostic_dir, "07_display_status.csv")
                if os.path.exists(diagnostic_file):
                    try:
                        with open(diagnostic_file, 'r', encoding='utf-8') as f:
                            reader = csv.DictReader(f)
                            for row in reader:
                                display_status.append({
                                    "TR": row.get("TR", ""),
                                    "mostrar": row.get("mostrar", "").strip().lower() == "true"
                                })
                    except Exception as e:
                        logger.warning(f"Error reading display status file: {str(e)}")
            else:
                # Read from URL
                logger.info(f"Local directory not found: {target_dir}, trying URL")
                url_base = server + "outputs/fastflood/" + case_folder + "/WI_" + watershedId + "/out/06-FLOOD/Discharge/"

                # Try to read display status from URL
                diagnostic_url = server + "outputs/fastflood/" + case_folder + "/WI_" + watershedId + "/out/06-FLOOD/Discharge/_diagnostics/07_display_status.csv"
                try:
                    response = requests.get(diagnostic_url)
                    response.raise_for_status()
                    csv_content = response.text
                    reader = csv.DictReader(csv_content.splitlines())
                    for row in reader:
                        display_status.append({
                            "TR": row.get("TR", ""),
                            "mostrar": row.get("mostrar", "").strip().lower() == "true"
                        })
                except requests.exceptions.RequestException as e:
                    logger.warning(f"Could not fetch display status from URL: {str(e)}")

                # Since we can't glob on remote URLs, we need to construct expected file names
                # Common scenario patterns for hydrograms
                scenarios = ['baseline', 'conservation', 'current']

                for scenario in scenarios:
                    file_name = f"{scenario}_{period}.csv"
                    url_path = url_base + file_name

                    try:
                        response = requests.get(url_path)
                        response.raise_for_status()

                        # Parse CSV from URL response
                        csv_content = response.text
                        reader = csv.DictReader(csv_content.splitlines())
                        scenario_key = os.path.splitext(file_name)[0]

                        if "Current" in scenario_key:
                            scenario_key = "Q Current"
                        elif "BaU" in scenario_key:
                            scenario_key = "Q BaU"
                        elif "NbS" in scenario_key:
                            scenario_key = "Q NbS"


                        for row in reader:
                            formatted_row = {}
                            for key, value in row.items():
                                try:
                                    num = float(value)
                                    formatted_row[key] = format(num, '.20f')
                                except ValueError:
                                    formatted_row[key] = value
                            formatted_row["scenario"] = scenario_key
                            all_data.append(formatted_row)
                    except requests.exceptions.RequestException as e:
                        # Log but continue trying other scenarios
                        logger.warning(f"Could not fetch {url_path}: {str(e)}")
                        continue

            # Return data with display status
            response_data = {
                "data": all_data,
                "display_status": display_status
            }

            return JsonResponse(response_data, safe=False)
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching hydrograms from URL: {str(e)}")
            return JsonResponse({"error": f"Error al acceder a los archivos desde URL: {str(e)}"}, status=500)
        except Exception as e:
            logger.error(f"Error loading hydrograms: {str(e)}")
            return JsonResponse({"error": f"Error loading hydrograms: {str(e)}"}, status=400)


@api_view(['GET'])
def getDisplayStatus(request):
    """
    Returns the display status from 07_display_status.csv
    Indicates which return periods (TR) should be displayed in the UI
    """
    if request.method == 'GET':
        try:
            api_server = settings.WATERPROOF_API_SERVER
            server = api_server.replace("/proxy/?url=", "").replace("wf-models", "")

            case_folder = request.query_params.get('case_folder')
            watershedId = request.query_params.get('watershedId')

            target_dir = os.path.join(BASE_PATH_FASTFLOOD, case_folder, "WI_" + watershedId, "out", "06-FLOOD", "Discharge")
            display_status = []
            diagnostic_dir = os.path.join(target_dir, "_diagnostics")

            # Try to read from local file first
            if os.path.exists(diagnostic_dir):
                diagnostic_file = os.path.join(diagnostic_dir, "07_display_status.csv")
                if os.path.exists(diagnostic_file):
                    try:
                        with open(diagnostic_file, 'r', encoding='utf-8') as f:
                            reader = csv.DictReader(f)
                            for row in reader:
                                display_status.append({
                                    "TR": row.get("TR", ""),
                                    "mostrar": row.get("mostrar", "").strip().lower() == "true"
                                })
                    except Exception as e:
                        logger.warning(f"Error reading display status file: {str(e)}")
            else:
                # Try to read from URL
                diagnostic_url = server + "outputs/fastflood/" + case_folder + "/WI_" + watershedId + "/out/06-FLOOD/Discharge/_diagnostics/07_display_status.csv"
                try:
                    response = requests.get(diagnostic_url)
                    response.raise_for_status()
                    csv_content = response.text
                    reader = csv.DictReader(csv_content.splitlines())
                    for row in reader:
                        display_status.append({
                            "TR": row.get("TR", ""),
                            "mostrar": row.get("mostrar", "").strip().lower() == "true"
                        })
                except requests.exceptions.RequestException as e:
                    logger.warning(f"Could not fetch display status from URL: {str(e)}")

            return JsonResponse({"display_status": display_status}, safe=False)

        except Exception as e:
            logger.error(f"Error loading display status: {str(e)}")
            return JsonResponse({"error": f"Error loading display status: {str(e)}"}, status=400)


@api_view(['GET'])
def getIndicators(request):
	if request.method == 'GET':
		try:
			api_server = settings.WATERPROOF_API_SERVER
			server = api_server.replace("/proxy/?url=","").replace("wf-models","")
			out_indicators_path =  "/INDICATORS/out/OUTPUTS-Indicators.csv";
			
			case_folder = request.query_params.get('case_folder')
			complete_path = os.path.join(BASE_PATH_FASTFLOOD, case_folder) + out_indicators_path
			url_path = server + "outputs/fastflood/" + case_folder + out_indicators_path
			data = []
			
			# Check if local file exists, otherwise use URL
			if os.path.exists(complete_path):
				# Read from local file
				with open(complete_path, newline='', encoding='utf-8') as csvfile:
					reader = csv.DictReader(csvfile)
					for row in reader:
						data.append(row)
						new_row = {toCamelCase(k): v for k, v in row.items()}
						data.append(new_row)
			else:
				# Read from URL
				logger.info(f"Local file not found: {complete_path}, trying URL: {url_path}")
				response = requests.get(url_path)
				response.raise_for_status()  # Raises an HTTPError for bad responses
				
				# Parse CSV from URL response
				csv_content = response.text
				reader = csv.DictReader(csv_content.splitlines())
				for row in reader:
					#data.append(row)
					new_row = {toCamelCase(k): v for k, v in row.items()}
					data.append(new_row)
			
			return JsonResponse(data, safe=False)
		except requests.exceptions.RequestException as e:
			logger.error(f"Error fetching from URL {url_path}: {str(e)}")
			return JsonResponse({"error": f"Error al acceder al archivo desde URL: {str(e)}"}, status=500)
		except Exception as e:
			logger.error(f"Error reading indicators file: {str(e)}")
			return JsonResponse({"error": f"Error al leer el archivo CSV: {str(e)}"}, status=500)
		

def toCamelCase(s: str) -> str:
    s = re.sub(r'[^a-zA-Z0-9 ]', '', s)
    parts = s.strip().split()
    if not parts:
        return s
    return parts[0].lower() + ''.join(word.capitalize() for word in parts[1:])
