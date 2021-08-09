"""URLs for the ``Study Cases`` module."""
from django.conf.urls import url
from django.urls import path
from . import views, api
from django.views.i18n import JavaScriptCatalog

js_info_dict = {
    'domain': 'djangojs',
    'packages': 'geonode.waterproof_study_cases'
}


urlpatterns = [
    url(r'^jsi18n/$', JavaScriptCatalog.as_view(), js_info_dict, name='javascript-catalog-study-cases'),
    # Default view, list all views
    path('', views.list, name='study_cases_list'),
    # Create Study Cases
    path('create/', views.create, name='create-study-cases'),
    # Edit Study Cases
    path('edit/<int:idx>', views.edit, name='edit-study-cases'),
    # Clone Study Cases
    path('clone/<int:idx>', views.clone, name='clone-study-cases'),
     # View Study Cases
    path('view/<int:idx>', views.view, name='edit-study-cases'),
    # Delete Study Cases
    path('delete/<int:idx>', api.delete, name='delete-study-cases'),
     # Public Study Cases
    path('public/<int:idx>', api.public, name='public-study-cases'),
     # Private Study Cases
    path('private/<int:idx>', api.private, name='private-study-cases'),
    
    # Report Study Cases
    path('report/<int:idx>', views.report, name='delete-study-cases'),

    path('currencys/', api.getStudyCaseCurrencys, name='currencys-study-cases'),
    
    path('intakebyid/<int:id_intake>/', api.getIntakeByID, name='intake-id'),
    path('ptapbyid/<int:id_ptap>/', api.getPtapByID, name='ptap-id'),
    path('intakebycity/<int:id_city>/', api.getIntakeByCity, name='intake-city'),
    path('parametersbycountry/<int:id_city>/', api.getParameterByCountry, name='parameters-country'),
    path('intakebyptap/<int:id>/', api.getIntakeByPtap, name='intake-ptap'),
    path('ptapbycity/<int:id_city>/', api.getPtapByCity, name='ptap-city'),    
    path('save/', api.save, name='study_cases_save'),
    path('run/', api.run, name='study_cases_run'),
    path('nbs/', api.getNBS, name='study_cases_nbs'),
    path('bio/', api.getBiophysical, name='study_cases_bio'),
    path('savebio/', api.saveBiophysicals, name='study_cases_bio_save'),
    
    
]
