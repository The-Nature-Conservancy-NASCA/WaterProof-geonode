from django.http import JsonResponse
from django.shortcuts import render
from django.core import serializers
from geonode.waterproof_parameters.models import Countries, Regions, Cities
from .models import investIndicators


def dashboard(request):
    return render(request, 'waterproof_reports/dashboard.html', {})



def pivot_data(request):
    dataset = Countries.objects.all()
    data = serializers.serialize('json', dataset)
    return JsonResponse(data, safe=False)

def reportMenu(request):
                return render(
                    request,
                    'waterproof_reports/reports_menu.html',
                    {})

def physicalIndicators(request):

                Indicators = investIndicators.objects.all()
                return render(
                    request,
                    'waterproof_reports/physicalIndicators.html',
                    {
                        'Indicators': Indicators
                    })