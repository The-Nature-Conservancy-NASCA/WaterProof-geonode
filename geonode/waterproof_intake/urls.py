"""URLs for the ``WaterProof Intake`` module."""
from django.conf.urls import url, include
from django.urls import path
from . import views, api
from django.views.i18n import JavaScriptCatalog


js_info_dict = {
    'domain': 'djangojs',
    'packages': 'geonode.waterproof_intake'
}

urlpatterns = [
    url(r'^jsi18n/$', JavaScriptCatalog.as_view(), js_info_dict, name='javascript-catalog-intake'),
    # Create Water Intake
    path('create/', views.createIntake, name='create-intake'),
    # Default view, list all views
    path('', views.listIntake, name='list-intake'),
    # Edit Water Intake
    path('edit/<int:idx>', views.editIntake, name='edit-intake'),
    # View intake detail
    path('view/<int:idx>', views.viewIntake, name='view-intake'),
    # View intake demand
    path('viewDemand/<int:idx>', views.viewIntakeDemand, name='viewDemand-intake'),
    # Clone Water Intake
    path('clone/<int:idx>', views.cloneIntake, name='clone-intake'),
    # Clone Water Intake
    path('delete/<int:idx>', views.deleteIntake, name='delete-intake'),
    # Load process effciciency by ID
    path('loadProcess/<str:category>', views.loadProcessEfficiency, name='load-process'),
    # Load function cost by symbol
    path('loadFunctionBySymbol/<str:symbol>', views.loadCostFunctionsProcess, name='load-functionCost'),
    # Load process effciciency by ID
    path('validateGeometry/', views.validateGeometry, name='valid-geometry'),
    # validate python expression
    path('validatePyExpression/', api.validatePyExpression, name='validatePyExpression'),
    # Compare Maps
    path('compare-maps/', views.compareMaps, name='compare-maps'),
]
