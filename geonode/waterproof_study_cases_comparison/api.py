from django.contrib import messages
from django.conf import settings
from django.contrib.auth.models import User
from django.http import HttpResponse, Http404, HttpResponseRedirect, JsonResponse
from rest_framework.decorators import api_view
from geonode.waterproof_reports.models import investIndicators

@api_view(['GET'])
def getInvestIndicators(request):
    if request.method == 'GET':
        cases=request.GET.getlist('cases[]')
        fields=request.GET.getlist('fields[]')
        filterIndicators = investIndicators.objects.filter(study_case__in=cases,intake='-1').distinct('study_case').order_by('-study_case').values(*fields)
        data = list(filterIndicators)
        return JsonResponse(data, safe=False)

@api_view(['GET'])
def getBfm3Indicator(request):
    if request.method == 'GET':
        cases=request.GET.get('cases')
        filterIndicators = investIndicators.objects.filter(study_case__in=[4,141],intake='-1').distinct('study_case').order_by('-study_case').values(
            "study_case","time","date", "bf_m3")
        data = list(filterIndicators)
        return JsonResponse(data, safe=False)

