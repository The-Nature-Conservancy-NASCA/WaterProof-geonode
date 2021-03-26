from django.urls import path
from . import views
from . import api

urlpatterns = [
      path('', views.treatmentPlantsList, name='treatment-plants-list'),
      path('getTreatmentPlantsList/', api.getTreatmentPlantsList, name='treatment-plants'),
      path('getIntakeList/', api.getIntakeList, name='treatment-intake'),
      path('getTypePtap/', api.getTypePtap, name='treatment-type-ptap'),
      path('getInfoTree/', api.getInfoTree, name='treatment-info-tree'),
      path('getTreatmentPlant/', api.getTreatmentPlant, name='treatment-find_plant'),
      path('setHeaderPlant/', api.setHeaderPlant, name='treatment-set-header'),
      path('create/', views.newTreatmentPlants, name='create-treatment-plants'),
]