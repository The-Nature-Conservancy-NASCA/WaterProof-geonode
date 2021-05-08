
from django.urls import path
from . import views
from wagtail.admin import urls as wagtailadmin_urls
from wagtail.core import urls as wagtail_urls
from django.conf.urls import include, url
from wagtail.documents import urls as wagtaildocs_urls

urlpatterns = [
    path('cmsView/', views.principalView, name='cmsView'),
    path('', include(wagtailadmin_urls), name = 'cmsPanel'),
    path('docs/', include(wagtaildocs_urls)),
    path('pages/', include(wagtail_urls)),
]