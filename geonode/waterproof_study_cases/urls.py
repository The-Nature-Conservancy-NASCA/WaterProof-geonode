"""URLs for the ``Study Cases`` module."""
from django.conf.urls import url
from django.urls import path
from . import views, api


urlpatterns = [

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
    
    path('currencys/<int:id>', api.getStudyCaseCurrencys, name='currencys-study-cases'),
    
    path('intakebyid/<int:id_intake>/', api.getIntakeByID, name='intake-id'),
    path('ptapbyid/<int:id_ptap>/', api.getPtapByID, name='ptap-id'),
    path('intakebycity/<str:name>/', api.getIntakeByCity, name='intake-city'),
    path('parametersbycountry/<str:name>/', api.getParameterByCountry, name='parameters-country'),
    path('intakebyptap/<int:id>/', api.getIntakeByPtap, name='intake-ptap'),
    path('ptapbycity/<str:name>/', api.getPtapByCity, name='ptap-city'),    
    path('save/', api.save, name='study_cases_save'),
    path('nbs/', api.getNBS, name='study_cases_nbs'),
    path('bio/', api.getBiophysical, name='study_cases_bio'),
    path('savebio/', api.saveBiophysicals, name='study_cases_bio_save'),
    
    
]
