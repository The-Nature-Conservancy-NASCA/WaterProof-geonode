from django.urls import path
from . import views
from . import api

urlpatterns = [
      path('', views.treatmentPlantsList, name='treatment-plants-list'),
      path('getTreatmentPlantsList/', api.getTreatmentPlantsList, name='treatment-plants'),
      path('getIntakeList/', api.getIntakeList, name='treatment-intake'),
      path('getTypePtap/', api.getTypePtap, name='treatment-type-ptap'),
      path('getEnviroment/', api.getEnviroment, name='treatment-enviroment'),
      path('getInfoTree/', api.getInfoTree, name='treatment-info-tree'),
      path('setHeaderPlant/', api.setHeaderPlant, name='treatment-set-header'),
      path('edit/<int:idx>', views.editTreatmentPlants, name='edit-treatment-plants'),
      path('create/<int:userCountryId>', views.newTreatmentPlants, name='create-treatment-plants'),
]