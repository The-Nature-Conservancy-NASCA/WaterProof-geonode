from django.urls import path
from . import views

urlpatterns = [
      path('', views.treatmentPlantsList, name='treatment-plants-list'),
      path('getTreatmentPlantsList/', views.getTreatmentPlantsList, name='treatment-plants'),
      path('getIntakeList/', views.getIntakeList, name='treatment-intake'),
      path('getTypePtap/', views.getTypePtap, name='treatment-type-ptap'),
      path('edit/<int:idx>', views.editTreatmentPlants, name='edit-treatment-plants'),
      path('create/<int:userCountryId>', views.newTreatmentPlants, name='create-treatment-plants'),
]