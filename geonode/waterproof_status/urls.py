"""URLs for the ``Status`` module."""
from django.conf.urls import url
from django.urls import path
from . import views
from django.views.i18n import JavaScriptCatalog


js_info_dict = {
    'domain': 'djangojs',
    'packages': 'geonode.waterproof_status'
}

urlpatterns = [
    url(r'^jsi18n/$', JavaScriptCatalog.as_view(), js_info_dict, name='javascript-catalog-records'),
    # API endpoints
    path('api/drinking-water-cases/', views.get_drinking_water_cases, name='api_drinking_water_cases'),
    path('api/flood-mitigation-cases/', views.get_flood_mitigation_cases, name='api_flood_mitigation_cases'),
    # Default view, list all views
    path('', views.list, name='waterproof_status'),
    # Detail views for study cases
    path('drinking-water/<int:idx>/', views.searchById, name='waterproof_status_search_drinking_water'),
    path('fastflood/<int:idx>/', views.searchByIdFastflood, name='waterproof_status_search_fastflood'),
    # Legacy URL for backward compatibility (defaults to drinking water)
    path('<int:idx>/', views.searchById, name='waterproof_status_search'),
]
