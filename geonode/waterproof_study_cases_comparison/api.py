from django.contrib import messages
from django.conf import settings
from django.contrib.auth.models import User
from django.http import HttpResponse, Http404, HttpResponseRedirect, JsonResponse
from rest_framework.decorators import api_view
from geonode.waterproof_reports.models import investIndicators,resultRoi,reportsVpn

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

