"""
Views for the ``Study Cases Comparison`` module

"""

from django.shortcuts import render
from geonode.waterproof_study_cases.models import StudyCases
from geonode.waterproof_parameters.models import Cities, Countries, Regions
from geonode.waterproof_reports.models import reportsVpn
import json

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
                
                study_cases_private = StudyCases.objects.filter(is_public=False, is_complete=True,added_by=request.user)
                study_cases_public = StudyCases.objects.filter(is_public=True, is_complete=True)
                study_cases = study_cases_private | study_cases_public
                filter_sc_by_npv = reportsVpn.objects.filter(study_case__in=study_cases)
                pks = []
                for f in filter_sc_by_npv:
                    pks.append(f.study_case_id)
                studyCases = study_cases.filter(id__in=pks)
                intake_geoms = get_geoms_intakes(studyCases)
                
                city = Cities.objects.get(id=1)
                return render(
                    request,
                    'waterproof_study_cases_comparison/studycases_list.html',
                    {
                        'casesList': studyCases,
                        'city': city,
                        'userCountry': userCountry,
                        'region': region,
                        'intakes': json.dumps(intake_geoms)
                    }
                )

            if (request.user.professional_role == 'ANALYS'):
                study_cases_private = StudyCases.objects.filter(is_public=False, is_complete=True,added_by=request.user)
                study_cases_public = StudyCases.objects.filter(is_public=True, is_complete=True)
                study_cases = study_cases_private | study_cases_public

                filter_sc_by_npv = reportsVpn.objects.filter(study_case__in=study_cases)
                pks = []
                for f in filter_sc_by_npv:
                    pks.append(f.study_case_id)
                studyCases = study_cases.filter(id__in=pks)

                userCountry = Countries.objects.get(iso3=request.user.country)
                region = Regions.objects.get(id=userCountry.region_id)
                city = Cities.objects.all()
                intake_geoms = get_geoms_intakes(studyCases)

                return render(
                    request,
                    'waterproof_study_cases_comparison/studycases_list.html',
                    {
                        'casesList': studyCases,
                        'city': city,
                        'userCountry': userCountry,
                        'region': region,
                        'intakes': json.dumps(intake_geoms)
                    }
                )
        else:
            studyCases = StudyCases.objects.filter(is_public=True)
            userCountry = Countries.objects.get(iso3='COL')
            region = Regions.objects.get(id=userCountry.region_id)
            city = Cities.objects.all()
            return render(
                request,
                'waterproof_study_cases_comparison/studycases_list.html',
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
                study_cases = StudyCases.objects.filter(added_by=request.user)
                city = Cities.objects.get(id=1)

                filter_sc_by_npv = reportsVpn.objects.filter(study_case__in=study_cases)
                pks = []
                for f in filter_sc_by_npv:
                    pks.append(f.study_case_id)
                studyCases = study_cases.filter(id__in=pks)

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
                    'waterproof_study_cases_comparison/studycases_list_user.html',
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
                'waterproof_study_cases_comparison/studycases_list_user.html',
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

def get_geoms_intakes(studyCases):
    intake_geoms = []
    for sc in studyCases:
        intakes = sc.intakes.all()
        for intake in intakes:
            ig = dict()
            ig['study_case_id'] = sc.pk
            ig['study_case_name'] = sc.name
            ig['intake_id'] = intake.pk
            ig['geom'] = intake.polygon_set.first().geom.geojson
            ig['intake_name'] = intake.name
            intake_geoms.append(ig)
    return intake_geoms