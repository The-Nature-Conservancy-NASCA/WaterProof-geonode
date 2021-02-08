"""URLs for the ``Study Cases`` module."""
from django.conf.urls import url
from django.urls import path
from . import views


urlpatterns = [

    # Default view, list all views
    path('', views.listStudyCases, name='study_cases_list'),
    # Create Study Cases
    path('create/', views.create, name='create'),
    
]
