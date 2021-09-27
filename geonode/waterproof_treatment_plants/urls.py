from django.conf.urls import url, include
from django.views.i18n import JavaScriptCatalog
from django.urls import path
from . import views
from . import api

js_info_dict = {
    'domain': 'djangojs',
    'packages': 'geonode.waterproof_treatment_plants'
}

urlpatterns = [
	url(r'^jsi18n/$', JavaScriptCatalog.as_view(), js_info_dict, name='javascript-catalog-treatment'),
	path('', views.treatmentPlantsList, name='treatment-plants-list'),
	path('getTreatmentPlantsList/', api.getTreatmentPlantsList, name='treatment-plants'),
	path('getIntakeList/', api.getIntakeList, name='treatment-intake'),
	path('getTypePtap/', api.getTypePtap, name='treatment-type-ptap'),
	path('getInfoTree/', api.getInfoTree, name='treatment-info-tree'),
	path('getInfoTreeMany/', api.getInfoTreeMany, name='treatment-info-tree-many'),
	path('getTreatmentPlant/', api.getTreatmentPlant, name='treatment-find_plant'),
	path('setHeaderPlant/', api.setHeaderPlant, name='treatment-set-header'),
	path('create/', views.newTreatmentPlants, name='create-treatment-plants'),
	path('update/<int:idx>', views.updateTreatmentPlants, name='edit-treatment-plants'),
	path('clone/<int:idx>', views.cloneTreatmentPlants, name='clone-treatment-plants'),
	path('view/<int:idx>', views.viewTreatmentPlants, name='view-treatment-plants'),
]