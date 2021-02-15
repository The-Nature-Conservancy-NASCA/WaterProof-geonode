"""URLs for the ``Study Cases`` module."""
from django.conf.urls import url
from django.urls import path
from . import views


urlpatterns = [

    # Default view, list all views
    path('', views.listStudyCases, name='study-cases-list'),
    # Create Study Cases
    path('create/', views.create, name='create'),
    path('intakescinfralist/<int:id_intake>/', views.getIntakeSCInfraList, name='intake-scinfra'),
    
]
