from django.contrib import messages
from django.conf import settings
from django.contrib.auth.models import User
from django.http import HttpResponse, Http404, HttpResponseRedirect, JsonResponse
from django.db import connection
from rest_framework.decorators import api_view
from geonode.waterproof_reports.models import investIndicators,resultRoi,reportsVpn
from geonode.waterproof_study_cases.models import StudyCases


@api_view(['GET'])
def getInvestIndicators(request):
    if request.method == 'GET':
        cases=request.GET.getlist('cases[]')
        fields=request.GET.getlist('fields[]')
        filterIndicators = investIndicators.objects.filter(study_case__in=cases,intake='-1').distinct('study_case').order_by('-study_case').values(*fields)
        data = list(filterIndicators)
        return JsonResponse(data, safe=False)

@api_view(['GET'])
def getRoiIndicators(request):
    if request.method == 'GET':
        cases=request.GET.getlist('cases[]')
        fields=request.GET.getlist('fields[]')
        filterIndicators = resultRoi.objects.filter(study_case__in=cases).distinct('study_case_id').order_by('-study_case_id').values(*fields)
        data = list(filterIndicators)
        return JsonResponse(data, safe=False)

@api_view(['GET'])
def getVpnIndicators(request):
    if request.method == 'GET':
        cases=request.GET.getlist('cases[]')
        fields=request.GET.getlist('fields[]')
        filterIndicators = reportsVpn.objects.filter(study_case__in=cases).distinct('study_case_id').order_by('-study_case_id').values(*fields)
        data = list(filterIndicators)
        return JsonResponse(data, safe=False)

@api_view(['GET'])
def getStudyCaseInfo(request):
    if request.method == 'GET':
        cases=request.GET.getlist('cases[]')
        fields=request.GET.getlist('fields[]')
        filterIndicators = StudyCases.objects.filter(id__in=cases).distinct('id').order_by('-id').values(*fields)
        filterRoiCase=resultRoi.objects.filter(study_case__in=cases).distinct('study_case_id').order_by('-study_case_id').values('roi_without_discount')
        dataRoi=list(filterRoiCase)
        data = list(filterIndicators)
        for idx, element in enumerate(data):
            element['roi_discount']=dataRoi[idx]['roi_without_discount']
        return JsonResponse(data, safe=False)

@api_view(['GET'])
def getInvestIndicatorsRaw(request):
    
    cases=request.GET.getlist('cases[]')
    fields=request.GET.getlist('fields[]')
    cursor = connection.cursor()
    max_min = {
        'awy': 'max(awy)',
        'wc_ton': 'max(wc_ton)',        
        'bf_m3': 'max(bf_m3)',        
        'wn_kg': 'min(wn_kg)',
        'wp_kg': 'min(wp_kg)',
        'wsed_ton': 'min(wsed_ton)',        
    }

    fields_sentence = ""
    for field in fields:
        if field in max_min:
            fields_sentence += max_min[field] + " as " + field + ","
        else:
            fields_sentence += field + ","
    fields_sentence = fields_sentence[:-1]    

    table_name = "public.waterproof_reports_investindicators"
    study_cases = ",".join(cases)
    sql = "select %s from %s where study_case_id in (%s) and intake_id = -1 group by (study_case_id) order by study_case_id desc" % (fields_sentence, table_name, study_cases)
    # print (sql)
    cursor.execute(sql)
    result = dictfetchall(cursor)
    print (result)
    return JsonResponse(list(result), safe=False)


def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [
        dict(zip(columns, row))
        for row in cursor.fetchall()
    ]