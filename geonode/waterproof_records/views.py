"""
Views for the ``django-Records`` application.

"""

import logging
from django.conf import settings
from django.shortcuts import render
from geonode.waterproof_parameters.models import Countries
from django.utils.translation import ugettext as _
import psutil
from ..waterproof_study_cases.models import StudyCases
from ..waterproof_reports.models import zip
from sys import platform

logger = logging.getLogger(__name__)

path_disk_usage = "/spcwaterproof"
if platform == "win32":
    path_disk_usage = "C:\\"
disk_usage = psutil.disk_usage(path_disk_usage) 
disk_percent = format((disk_usage.percent))

def to_gb(bytes):
# "Convierte bytes a gigabytes."
    return bytes / 1024**3    

disk_used = format(to_gb(disk_usage.used))
disk_free = format(to_gb(disk_usage.free))  
   
def getCityById(idx):
    countrySearch = Countries.objects.get(id=idx)
    idCountrySearch=countrySearch.pk
    return idCountrySearch

def list(request):
    if request.method == 'GET':
        if request.user.is_authenticated:
            if (request.user.professional_role == 'ADMIN'):
                studyCases = StudyCases.objects.all().select_related("city", "city__country", "added_by").order_by('id')
                return render(
                    request,
                    'waterproof_records/records_view.html',
                    {
                        'casesList': studyCases,
                        
                        'profile':request.user.professional_role,
                        'disk_percent':disk_percent,
                        'disk_free':disk_free,
                        'disk_used':disk_used,
                    }
                )
            if (request.user.professional_role != 'ADMIN'):    
                return render(request, 'waterproof_records/records_login_error.html')
        else:
            return render(request, 'waterproof_records/records_login_error.html')


def searchByUser(request,idx,idCountry):
    if not request.user.is_authenticated:
        return render(request, 'waterproof_records/records_login_error.html')
    else:
        if request.user.is_authenticated:
            # allCountries = Countries.objects.all().order_by('id')
            allStudyCases = StudyCases.objects.all().order_by('id')
            if idCountry !=0:
                countryId = getCityById(idCountry)
            else:
                countryId = 0
            if idx != 0:
                study_case = StudyCases.objects.filter(added_by_id=idx)                         
            else:
                study_case = StudyCases.objects.all().order_by('id')
            
            # scCountries = getCountryById(idx)
            return render(
                request, 'waterproof_records/records_search.html',
                {
                    "serverApi": settings.WATERPROOF_API_SERVER,
                    "servermodelApi": settings.WATERPROOF_MODELS_PY2_API,
                    'casesList': study_case,
                    'id': idx,
                    'country':countryId,
                    'disk_percent':disk_percent,
                    'disk_free':disk_free,
                    'disk_used':disk_used,
                    'allCases': allStudyCases,
                    # 'scCountries':scCountries
                    }
            )
        else:
            return render(request, 'waterproof_records/records_login_error.html')

   
    