
from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.dashboard, name='dashboard'),
    path('', views.reportMenu, name='reports'),
    path('data', views.pivot_data, name='pivot_data'),
    path('physical/', views.physicalIndicators, name='physical'),
    path('financial/', views.financialIndicators, name='financial'),
]