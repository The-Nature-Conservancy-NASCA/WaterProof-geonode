"""URLs for the ``Study Cases`` module."""
from django.conf.urls import url
from django.urls import path
from . import views, api


urlpatterns = [

    # Default view, list all views
    path('', views.listStudyCases, name='study_cases_list'),
    # Create Study Cases
    path('create/', views.create, name='create'),
    path('scinfra/<int:id_scinfra>/', api.getSCInfra, name='intake-scinfra'),
    path('save/', api.save, name='study_cases_save'),
    
]
