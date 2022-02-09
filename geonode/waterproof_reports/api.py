from django.http import HttpResponse
from django.http.response import JsonResponse
from rest_framework.decorators import api_view
from django.conf import settings
from django.contrib.auth.models import User
from random import randrange, choice
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import DateTimeField
from geonode.waterproof_study_cases.models import StudyCases
import requests
import psycopg2
import json

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
			sql ="SELECT * FROM __get_report_analisys_sensitivy_cost(%s)" % int(request.query_params.get('studyCase'))
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
			sql = "SELECT * FROM __get_report_analisys_sensitivy_benefits(%s)" % int(request.query_params.get('studyCase'))
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
			sql = "SELECT * FROM __get_report_graph_cost_vs_benefit(%s)" % int(request.query_params.get('studyCase'))
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
			sql = "SELECT * FROM __get_report_graph_return_of_invest_roi(%s)" % int(request.query_params.get('studyCase'))
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
			sql = "SELECT * FROM __get_report_graph_vpn(%s)" % int(request.query_params.get('studyCase'))
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
			sql = "SELECT * FROM __get_report_graph_cost_bene(%s)" % int(request.query_params.get('studyCase'))
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
			sql = "SELECT * FROM __get_report_costs_analysis_roi(%s)" % int(request.query_params.get('studyCase'))	
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
			sql = "SELECT * FROM __get_report_costs_analysis_filter(%s)" % int(request.query_params.get('studyCase'))
			cur.execute(sql)
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
			sql = "SELECT * FROM __get_report_analysis_benefits_filter(%s)" % int(request.query_params.get('studyCase'))
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
					"totalBenefitsDiscount":row[5]
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
			sql = "SELECT typer, round(cast(SUM(medbenefitr) as numeric),2)::double precision AS sum_filter FROM __get_report_costs_analysis_filter(%s) GROUP BY  typer ORDER BY typer" % int(request.query_params.get('studyCase'))
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
			sql = "select typer as cost_idr, medbenefitr AS sum_filter from __get_report_costs_analysis_filterBgraph(%s)" % int(request.query_params.get('studyCase'))
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
			sql = "SELECT case when typer='CARBONO' then 'CARBON' else typer end as typer,round(cast(SUM(vpn_med_benefitr) as numeric),2)::double precision AS vpn_med_benefitr FROM __get_report_analysis_benefits_filter(%s) GROUP BY typer" % int(request.query_params.get('studyCase'))
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
			sql = "SELECT * FROM __get_report_oportunity_result_indicators(%s)"	% int(request.query_params.get('studyCase'))
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
			sql = "SELECT * FROM __get_report_analisys_benefics(%s)" % int(request.query_params.get('studyCase'))
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
			sql = "SELECT * FROM __get_report_analisys_beneficsB(%s)" % int(request.query_params.get('studyCase'))
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
			sql = "SELECT * FROM __get_report_analisys_beneficsC(%s) ORDER BY intake_idf" % int(request.query_params.get('studyCase'))
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
			con = psycopg2.connect(settings.DATABASE_URL)
			cur = con.cursor()
			sql = "SELECT * FROM __get_report_oportunity_result_maps(%s)" % int(request.query_params.get('studyCase'))
			cur.execute(sql)
			rows = cur.fetchall()
			objects_list = []
			for row in rows:
				objects_list.append({
					"name":row[0],
					"polygon": row[1]
				})
			return JsonResponse(objects_list, safe=False)
		except Exception as e:
			return JsonResponse({"error": 'invalid id'})

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
					"description":row[1]
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
			sql = "SELECT * FROM __get_conservation_activities_pdf(sql)" % int(request.query_params.get('studyCase'))
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
			sql = "SELECT * FROM public.__get_reports_compare_maps(%s)" % int(request.query_params.get('studyCase'))
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

		return JsonResponse({"name": name, "city": city_name, "country": country_name, "region": region_name})
	except Exception as e:
		return JsonResponse({"error": 'invalid id'})
	