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
    path('getAwy/', api.getAwyIndicator, name='getAwy'),
    path('getBfm3/', api.getBfm3Indicator, name='getBfm3')
]
