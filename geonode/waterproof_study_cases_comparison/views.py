"""
Views for the ``Study Cases Comparison`` module

"""

from django.shortcuts import render
from geonode.waterproof_study_cases.models import StudyCases
from geonode.waterproof_parameters.models import Cities, Countries, Regions

"""
View listing study cases by
city, to be selected for comparison
"""


def list(request):
    if request.method == 'GET':
        if request.user.is_authenticated:
            if (request.user.professional_role == 'ADMIN'):
                userCountry = Countries.objects.get(iso3=request.user.country)
                region = Regions.objects.get(id=userCountry.region_id)
                studyCases = StudyCases.objects.filter(is_public=True,added_by=request.user)
                city = Cities.objects.get(id=1)
                return render(
                    request,
                    'waterproof_study_cases_comparison/studycases_list.html',
                    {
                        'casesList': studyCases,
                        'city': city,
                        'userCountry': userCountry,
                        'region': region,
                    }
                )

            if (request.user.professional_role == 'ANALYS'):
                studyCases = StudyCases.objects.filter(is_public=True,added_by=request.user)
                userCountry = Countries.objects.get(iso3=request.user.country)
                region = Regions.objects.get(id=userCountry.region_id)
                city = Cities.objects.all()
                return render(
                    request,
                    'waterproof_study_cases/studycases_list.html',
                    {
                        'casesList': studyCases,
                        'city': city,
                        'userCountry': userCountry,
                        'region': region,
                    }
                )
        else:
            studyCases = StudyCases.objects.filter(is_public=True)
            userCountry = Countries.objects.get(iso3='COL')
            region = Regions.objects.get(id=userCountry.region_id)
            city = Cities.objects.all()
            return render(
                request,
                'waterproof_study_cases/studycases_list.html',
                {
                    'casesList': studyCases,
                    'city': city,
                }
            )

def listOnlyUser(request):
    if request.method == 'GET':
        if request.user.is_authenticated:
            if (request.user.professional_role == 'ADMIN'):
                userCountry = Countries.objects.get(iso3=request.user.country)
                region = Regions.objects.get(id=userCountry.region_id)
                studyCases = StudyCases.objects.filter(added_by=request.user)
                city = Cities.objects.get(id=1)
                return render(
                    request,
                    'waterproof_study_cases_comparison/studycases_list_user.html',
                    {
                        'casesList': studyCases,
                        'city': city,
                        'userCountry': userCountry,
                        'region': region,
                    }
                )

            if (request.user.professional_role == 'ANALYS'):
                studyCases = StudyCases.objects.filter(added_by=request.user)
                userCountry = Countries.objects.get(iso3=request.user.country)
                region = Regions.objects.get(id=userCountry.region_id)
                city = Cities.objects.all()
                return render(
                    request,
                    'waterproof_study_cases/studycases_list_user.html',
                    {
                        'casesList': studyCases,
                        'city': city,
                        'userCountry': userCountry,
                        'region': region,
                    }
                )
        else:
            studyCases = StudyCases.objects.filter(is_public=True)
            userCountry = Countries.objects.get(iso3='COL')
            region = Regions.objects.get(id=userCountry.region_id)
            city = Cities.objects.all()
            return render(
                request,
                'waterproof_study_cases/studycases_list_user.html',
                {
                    'casesList': studyCases,
                    'city': city,
                }
            )


def doAnalysis(request):
    if request.method == 'GET':
        if request.user.is_authenticated:
            userCountry = Countries.objects.get(iso3=request.user.country)
            region = Regions.objects.get(id=userCountry.region_id)
            studyCases = StudyCases.objects.all()
            city = Cities.objects.get(id=1)
            return render(
                request,
                'waterproof_study_cases_comparison/studycases_do_analysis.html',
                {
                    'casesList': studyCases,
                    'city': city,
                    'userCountry': userCountry,
                    'region': region,
                }
            )
