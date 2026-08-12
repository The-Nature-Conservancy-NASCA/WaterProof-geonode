"""
Views for the ``django-Records`` application.

"""

import logging
from django.conf import settings
from django.shortcuts import render
from django.utils.translation import ugettext as _
from django.http import JsonResponse
from ..waterproof_study_cases.models import StudyCases
from ..waterproof_fastflood.models import StudyCases as FastfloodStudyCases
from ..waterproof_reports.models import log, reportsVpn

logger = logging.getLogger(__name__)

def list(request):
    if request.method == 'GET':
        if request.user.is_authenticated:
            if (request.user.professional_role == 'ADMIN'):
                # No longer passing casesList, will be fetched via REST API
                return render(
                    request,
                    'waterproof_status/status_view.html',
                    {
                        'serverApi': settings.WATERPROOF_API_SERVER,
                        'servermodelApi': settings.WATERPROOF_MODELS_PY2_API,
                        'profile':request.user.professional_role,
                        'server':settings.SITE_HOST_API
                    }
                )
            if (request.user.professional_role != 'ADMIN'):
                return render(request, 'waterproof_status/status_login_error.html')
        else:
            return render(request, 'waterproof_status/status_login_error.html')


def searchById(request,idx):
    if request.method == 'GET':
        if request.user.is_authenticated:
            if (request.user.professional_role == 'ADMIN'):
                # allCountries = Countries.objects.all().order_by('id')
                allLog = log.objects.filter(study_case_id=idx).order_by('step_id')
                allStudyCases = StudyCases.objects.all().order_by('-id')
                study_case = StudyCases.objects.filter(id=idx)
                case_info = StudyCases.objects.get(pk=idx)             
                intakes = case_info.intakes.all().order_by('id')         
                plantas= case_info.ptaps.all().order_by('id')         
                npv = reportsVpn.objects.filter(study_case=idx)
                fecha = case_info.create_date.strftime("%Y_%m_%d").replace('-0', '-').replace('-0', '-')
                if npv.exists(): 
                    print(npv[0].date_execution)
                    date_exec = npv[0].date_execution.strftime("%Y-%m-%d").replace('-0', '-').replace('-0', '-')
                else:
                    date_exec = case_info.create_date.strftime("%Y-%m-%d").replace('-0', '-').replace('-0', '-')
                
                user = str(case_info.added_by.id)
                folder =  str(case_info.added_by.id)+"_"+str(case_info.id)+"_"+date_exec
                return render(
                    request, 'waterproof_status/status_search.html',
                    {
                        "serverApi": settings.WATERPROOF_API_SERVER,
                        "servermodelApi": settings.WATERPROOF_MODELS_PY2_API,
                        'profile':request.user.professional_role,
                        'casesList': study_case,
                        'id': idx,
                        'allCases': allStudyCases,
                        'logs': allLog,
                        'server':settings.SITE_HOST_API,
                        'folder':folder,
                        'fechaLog':date_exec,
                        'fecha':fecha,
                        'user':user,
                        'caseInfo': case_info,
                        'intakes': intakes,
                        'ptaps':plantas,
                        'npv':npv,
                        'auth':request.user.is_authenticated
                        }
                )
            if (request.user.professional_role != 'ADMIN'):
                return render(request, 'waterproof_status/status_login_error.html')
        else:
            return render(request, 'waterproof_status/status_login_error.html')


def searchByIdFastflood(request, idx):
    """
    Search and display fastflood study case by ID.
    Similar to searchById but for fastflood cases.
    """
    if request.method == 'GET':
        if request.user.is_authenticated:
            if (request.user.professional_role == 'ADMIN'):
                try:
                    allStudyCases = FastfloodStudyCases.objects.all().order_by('-id')
                    study_case = FastfloodStudyCases.objects.filter(id=idx)
                    case_info = FastfloodStudyCases.objects.get(pk=idx)

                    # Get watersheds related to this study case
                    watersheds = case_info.watershed.all().order_by('id')

                    # Get date information
                    fecha = case_info.create_date.strftime("%Y_%m_%d").replace('-0', '-').replace('-0', '-') if case_info.create_date else ''
                    date_exec = case_info.create_date.strftime("%Y-%m-%d").replace('-0', '-').replace('-0', '-') if case_info.create_date else ''

                    user = str(case_info.added_by.id) if case_info.added_by else ''
                    folder = str(case_info.added_by.id) + "_" + str(case_info.id) + "_" + date_exec if case_info.added_by else str(case_info.id) + "_" + date_exec

                    return render(
                        request, 'waterproof_status/status_search_fastflood.html',
                        {
                            "serverApi": settings.WATERPROOF_API_SERVER,
                            "servermodelApi": settings.WATERPROOF_MODELS_PY2_API,
                            'profile': request.user.professional_role,
                            'casesList': study_case,
                            'id': idx,
                            'allCases': allStudyCases,
                            'server': settings.SITE_HOST_API,
                            'folder': folder,
                            'fechaLog': date_exec,
                            'fecha': fecha,
                            'user': user,
                            'caseInfo': case_info,
                            'watersheds': watersheds,
                            'auth': request.user.is_authenticated,
                            'analysis_type': 'fastflood'
                        }
                    )
                except FastfloodStudyCases.DoesNotExist:
                    return render(request, 'waterproof_status/status_login_error.html', {'error': 'Study case not found'})
                except Exception as e:
                    logger.error(f"Error loading fastflood study case {idx}: {str(e)}")
                    return render(request, 'waterproof_status/status_login_error.html', {'error': str(e)})
            if (request.user.professional_role != 'ADMIN'):
                return render(request, 'waterproof_status/status_login_error.html')
        else:
            return render(request, 'waterproof_status/status_login_error.html')


def get_drinking_water_cases(request):
    """
    API endpoint to get drinking water study cases (from waterproof_study_cases).
    Returns JSON with study case data.
    """
    if request.method == 'GET':
        if request.user.is_authenticated and request.user.professional_role == 'ADMIN':
            try:
                studyCases = StudyCases.objects.all().select_related(
                    "city", "city__country", "added_by"
                ).order_by('-id')

                cases_data = []
                for case in studyCases:
                    cases_data.append({
                        'id': case.id,
                        'name': case.name,
                        'country': case.city.country.name if case.city and case.city.country else '',
                        'user': f"{case.added_by.first_name} {case.added_by.last_name}" if case.added_by else '',
                        'edit_date': case.edit_date.strftime('%Y-%m-%d') if case.edit_date else '',
                        'is_run_analysis': case.is_run_analysis,
                        'storage': float(case.storage / 1000000) if case.storage else 0,  # Convert to MB
                    })

                return JsonResponse({'success': True, 'data': cases_data})
            except Exception as e:
                logger.error(f"Error fetching drinking water cases: {str(e)}")
                return JsonResponse({'success': False, 'error': str(e)}, status=500)
        else:
            return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=403)

    return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)


def get_flood_mitigation_cases(request):
    """
    API endpoint to get flood mitigation study cases (from waterproof_fastflood).
    Returns JSON with study case data.
    """
    if request.method == 'GET':
        if request.user.is_authenticated and request.user.professional_role == 'ADMIN':
            try:
                studyCases = FastfloodStudyCases.objects.all().select_related(
                    "city", "city__country", "added_by"
                ).order_by('-id')

                cases_data = []
                for case in studyCases:
                    cases_data.append({
                        'id': case.id,
                        'name': case.name,
                        'country': case.city.country.name if case.city and case.city.country else '',
                        'user': f"{case.added_by.first_name} {case.added_by.last_name}" if case.added_by else '',
                        'edit_date': case.edit_date.strftime('%Y-%m-%d') if case.edit_date else '',
                        'is_run_analysis': case.is_run_analysis,
                        'storage': float(case.storage / 1000000) if case.storage else 0,  # Convert to MB
                    })

                return JsonResponse({'success': True, 'data': cases_data})
            except Exception as e:
                logger.error(f"Error fetching flood mitigation cases: {str(e)}")
                return JsonResponse({'success': False, 'error': str(e)}, status=500)
        else:
            return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=403)

    return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)
