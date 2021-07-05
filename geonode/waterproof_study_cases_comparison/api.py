from django.contrib import messages
from django.conf import settings
from django.contrib.auth.models import User
from django.http import HttpResponse, Http404, HttpResponseRedirect, JsonResponse
from rest_framework.decorators import api_view
from geonode.waterproof_reports.models import investIndicators

@api_view(['GET'])
def getInvestIndicators(request):
    if request.method == 'GET':
        filterIndicators = investIndicators.objects.filter(study_case=request.GET.get('id_case')).values(
            "date", "awy","wn_kg","wp_kg","wsed_ton","bf_m3","wc_ton")
        data = list(filterIndicators)
        return JsonResponse(data, safe=False)

