"""URLs for the ``WaterProof NBS CA`` module."""
from django.conf.urls import url, include
from django.urls import path
from . import views
from django.views.i18n import JavaScriptCatalog
js_info_dict = {
    'domain': 'djangojs',
    'packages': 'geonode.waterproof_nbs_ca'
}
urlpatterns = [
    url(r'^jsi18n/$', JavaScriptCatalog.as_view(), js_info_dict, name='javascript-catalog-nbs'),
    # Create NBS
    path('create/', views.createNbs, name='create-nbs'),
    # Default view, list all views
    path('', views.listNbs, name='list-nbs'),
    # View NBS details
    path('view/<int:idx>', views.viewNbs, name='view-nbs'),
    # Edit NBS
    path('edit/<int:idx>', views.editNbs, name='edit-nbs'),
    # Clone NBS
    path('clone/<int:idx>', views.cloneNbs, name='clone-nbs'),
    # Delete NBS
    path('delete/<int:idx>', views.deleteNbs, name='delete-nbs'),
    # Load all RIOS transitions
    path('load-transitions/', views.loadAllTransitions, name='waterproof_load_transformations'),
    # Load activities by it's transition id
    path('load-activityByTransition/', views.loadActivityByTransition, name='waterproof_load_activities'),
    # Load transformations by it's activity id
    path('load-transformationByActivity/', views.loadTransformationbyActivity, name='waterproof_load_transformations')
]
