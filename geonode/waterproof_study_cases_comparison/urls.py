"""URLs for the ``Study Cases Comparison`` module."""
from django.conf.urls import url
from django.urls import path
from . import views, api
from django.views.i18n import JavaScriptCatalog

js_info_dict = {
    'domain': 'djangojs',
    'packages': 'geonode.waterproof_study_cases_comparison'
}

urlpatterns = [
    # Default view, list all views
    url(r'^jsi18n/$', JavaScriptCatalog.as_view(), js_info_dict, name='javascript-catalog-case-comparison'),
    path('', views.list, name='comparison_list'),
    path('doAnalysis/', views.doAnalysis, name='do_analysis'),
    path('getInvestIndicators/', api.getInvestIndicators, name='getInvestIndicators'),
    path('getRoiIndicators/', api.getRoiIndicators, name='getRoiIndicators'),
    path('getVpnIndicators/', api.getVpnIndicators, name='getVpnIndicators'),
    path('getStudyCaseInfo/', api.getStudyCaseInfo, name='getStudyCaseInfo')
]
