"""URLs for the ``Records`` module."""
from django.conf.urls import url
from django.urls import path
from . import views
from django.views.i18n import JavaScriptCatalog


js_info_dict = {
    'domain': 'djangojs',
    'packages': 'geonode.waterproof_records'
}

urlpatterns = [
    url(r'^jsi18n/$', JavaScriptCatalog.as_view(), js_info_dict, name='javascript-catalog-records'),
    # Default view, list all views
    path('', views.list, name='records_view'),
    path('search/<int:idx>/<int:idCountry>', views.searchByUser, name='records_search'),
]
