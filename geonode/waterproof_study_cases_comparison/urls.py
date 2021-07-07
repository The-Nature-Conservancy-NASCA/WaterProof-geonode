"""URLs for the ``Study Cases Comparison`` module."""
from django.conf.urls import url
from django.urls import path
from . import views,api


urlpatterns = [
    # Default view, list all views
    path('', views.list, name='comparison_list'),
    path('doAnalysis/',views.doAnalysis,name='do_analysis'),
    path('getInvestIndicator/',api.getInvestIndicators,name='getInvestIndicators')
]
