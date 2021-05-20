
from django.urls import path
from . import views
from . import api

urlpatterns = [
    path('dashboard/', views.dashboard, name='dashboard'),
    path('', views.reportMenu, name='reports'),
    path('data', views.pivot_data, name='pivot_data'),
    path('physical/', views.physicalIndicators, name='physical'),
    path('financial/', views.financialIndicators, name='financial'),
    path('getSensibilityAnalysisCost/', api.getSensibilityAnalysisCost, name='get-sensibility-analysis-cost'),
    path('getSensibilityAnalysisBenefits/', api.getSensibilityAnalysisBenefits, name='get-sensibility-analysis-benefits'),
    path('getSensibilityAnalysisCostVsBenefit/', api.getSensibilityAnalysisCostVsBenefit, name='get-sensibility-analysis-cost-vs-benefit'),
    path('getSensibilityAnalysisReturnOfInvest/', api.getSensibilityAnalysisReturnOfInvest, name='get-sensibility-analysis-return-of-invest'),
]