# -*- coding: utf-8 -*-
#########################################################################
#
# Copyright (C) 2018 OSGeo
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <http://www.gnu.org/licenses/>.
#
#########################################################################

import django
from django.urls import path, re_path, include
from django.conf.urls import include, url
from django.conf import settings
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.conf.urls.static import static
from geonode.sitemap import LayerSitemap, MapSitemap
from django.views.generic import TemplateView
from django.contrib import admin
from django.conf.urls.i18n import i18n_patterns
from django.views.i18n import JavaScriptCatalog
from django.contrib.sitemaps.views import sitemap

import geonode.proxy.urls
from . import views
from . import version

from geonode.api.urls import api, router
from geonode.api.views import verify_token, user_info, roles, users, admin_role
from geonode.base.views import thumbnail_upload

from geonode import geoserver
from geonode.utils import check_ogc_backend
from geonode.monitoring import register_url_event
from geonode.messaging.urls import urlpatterns as msg_urls
from .people.views import CustomSignupView
from .waterproof_intake.views import viewDiagram
from wagtail.admin import urls as wagtailadmin_urls
from wagtail.core import urls as wagtail_urls
from wagtail.documents import urls as wagtaildocs_urls

admin.autodiscover()

js_info_dict = {
    'domain': 'djangojs',
    'packages': 'geonode'
}

sitemaps = {
    "layer": LayerSitemap,
    "map": MapSitemap
}

admin.site.site_header="water-proof.org"
admin.site.site_title="WaterProof Administration Panel"
admin.site.index_title="WaterProof Administration Panel"

homepage = register_url_event()(TemplateView.as_view(template_name='index.html'))

urlpatterns = [
    url(r'^$',
        homepage,
        name='home'),
    url(r'^help/$',
        TemplateView.as_view(template_name='help.html'),
        name='help'),
    url(r'^developer/$',
        TemplateView.as_view(
            template_name='developer.html'),
        name='developer'),
    url(r'^about/$',
        TemplateView.as_view(template_name='about.html'),
        name='about'),
     url(r'^about_models/$',
        TemplateView.as_view(template_name='about_models.html'),
        name='models'),
	url(r'^terms_of_use/$',
        TemplateView.as_view(template_name='terms_of_use.html'),
        name='terms_of_use'),	
    url(r'^terms_of_use_flat/$',
        TemplateView.as_view(template_name='terms_of_use_flat.html'),
        name='terms_of_use_flat'),	
	url(r'^privacy_policy/$',
        TemplateView.as_view(template_name='Private_policy.html'),
        name='privacy-policy'),
    url(r'^privacy_cookies/$',
        TemplateView.as_view(template_name='privacy-cookies.html'),
        name='privacy-cookies'),
    url(r'^collaborators/$',
        TemplateView.as_view(template_name='collaborators.html'),
        name='collaborators'),
	url(r'^take-action/$',
        TemplateView.as_view(template_name='take_action.html'),
        name='take-action'),
    url(r'^do-it-now/$',
        TemplateView.as_view(template_name='do-it-now.html'),
        name='do-it-now'),
    url(r'^who-can-help/$',
        TemplateView.as_view(template_name='who-can-help.html'),
        name='who-can-help'),
    url(r'^how-does-waterproof-work/$',
        TemplateView.as_view(template_name='how-does-waterproof-work.html'),
        name='how-does-waterproof-work'),	
	url(r'^nbs_active_restoration/$',
        TemplateView.as_view(template_name='nbs_active_restoration.html'),
        name='nbs_active_restoration'),	
	url(r'^nbs_conservation/$',
        TemplateView.as_view(template_name='nbs_conservation.html'),
        name='nbs_conservation'),	
	url(r'^nbs_forestal_activity/$',
        TemplateView.as_view(template_name='nbs_forestal_activity.html'),
        name='nbs_forestal_activity'),	
	url(r'^nbs_pasive_restoration/$',
        TemplateView.as_view(template_name='nbs_pasive_restoration.html'),
        name='nbs_pasive_restoration'),	
	url(r'^system_instruction/$',
        TemplateView.as_view(template_name='system_instruction.html'),
        name='system_instruction'),	
        
    # Meta
    url(r'^sitemap\.xml$', sitemap, {'sitemaps': sitemaps},
        name='sitemap'),
    url(r'^robots\.txt$', TemplateView.as_view(
        template_name='robots.txt'), name='robots'),
    url(r'(.*version\.txt)$', version.version, name='version'),
    url(r'^messages/', include(msg_urls))

]

urlpatterns += [

    # View Diagram
    path('ShowDiagram/<int:idx>', viewDiagram, name='diagram-intake'),
    path('cms/', include(wagtailadmin_urls)),
    path('docs/', include(wagtaildocs_urls)),
    path('pages/', include(wagtail_urls)),

    # ResourceBase views
    url(r'^base/', include('geonode.base.urls')),

    # Layer views
    url(r'^layers/', include('geonode.layers.urls')),

    # Remote Services views
    url(r'^services/', include('geonode.services.urls')),

    # Map views
    url(r'^maps/', include('geonode.maps.urls')),

    # Documents views
    url(r'^documents/', include('geonode.documents.urls')),

    # Apps views
    url(r'^apps/', include('geonode.geoapps.urls')),

    # Catalogue views
    url(r'^catalogue/', include('geonode.catalogue.urls')),

    # Group Profiles views
    url(r'^groups/', include('geonode.groups.urls')),

    # ident
    url(r'^ident.json$',
        views.ident_json,
        name='ident_json'),

    # h keywords
    url(r'^h_keywords_api$',
        views.h_keywords,
        name='h_keywords_api'),

    # Search views
    url(r'^search/$',
        TemplateView.as_view(template_name='search/search.html'),
        name='search'),

    # Social views
    url(r'^account/signup/', CustomSignupView.as_view(), name='account_signup'),
    url(r"^account/", include("allauth.urls")),
    url(r'^invitations/', include(
        'geonode.invitations.urls', namespace='geonode.invitations')),
    url(r'^people/', include('geonode.people.urls')),
    url(r'^avatar/', include('avatar.urls')),
    url(r'^comments/', include('dialogos.urls')),
    url(r'^ratings/', include('pinax.ratings.urls', namespace='pinax_ratings')),
    url(r'^activity/', include('actstream.urls')),
    url(r'^announcements/', include('announcements.urls')),
    url(r'^messages/', include('user_messages.urls')),
    url(r'^social/', include('geonode.social.urls')),
    url(r'^security/', include('geonode.security.urls')),

    # Accounts
    url(r'^account/ajax_login$',
        geonode.views.ajax_login,
        name='account_ajax_login'),
    url(r'^account/ajax_lookup$',
        geonode.views.ajax_lookup,
        name='account_ajax_lookup'),
    url(
        r'^account/moderation_sent/(?P<inactive_user>[^/]*)$',
        geonode.views.moderator_contacted,
        name='moderator_contacted'),

    # OAuth Provider
    url(r'^o/',
        include('oauth2_provider.urls',
                namespace='oauth2_provider')),

    # Api Views
    url(r'^api/o/v4/tokeninfo',
        verify_token, name='tokeninfo'),
    url(r'^api/o/v4/userinfo',
        user_info, name='userinfo'),
    url(r'^api/roles', roles, name='roles'),
    url(r'^api/adminRole', admin_role, name='adminRole'),
    url(r'^api/users', users, name='users'),
    url(r'^api/v2/', include(router.urls)),
    url(r'^api/v2/', include('geonode.api.urls')),
    url(r'^api/v2/api-auth/', include('rest_framework.urls', namespace='geonode_rest_framework')),
    url(r'', include(api.urls)),

    # Curated Thumbnail
    url(r'^base/(?P<res_id>[^/]+)/thumbnail_upload$', thumbnail_upload,
        name='thumbnail_upload'),

    # tinymce WYSIWYG HTML Editor
    url(r'^tinymce/', include('tinymce.urls')),
]

urlpatterns += i18n_patterns(
    url(r'^grappelli/', include('grappelli.urls')),
    url(r'^admin/', admin.site.urls, name="admin"),
    url(r'admin/doc/', include('django.contrib.admindocs.urls')),
)

# Internationalization Javascript
urlpatterns += [
    url(r'i18n/', include('django_translation_flags.urls')),
    url(r'^jsi18n/$', JavaScriptCatalog.as_view(), js_info_dict, name='javascript-catalog')
]

urlpatterns += [  # '',
    url(r'^showmetadata/',
        include('geonode.catalogue.metadataxsl.urls')), 
]

if settings.FAVORITE_ENABLED:
    urlpatterns += [  # '',
        url(r'^favorite/',
            include('geonode.favorite.urls')),
    ]

if check_ogc_backend(geoserver.BACKEND_PACKAGE):
    if settings.CREATE_LAYER:
        urlpatterns += [  # '',
            url(r'^createlayer/',
                include('geonode.geoserver.createlayer.urls')),
        ]

    from geonode.geoserver.views import get_capabilities
    # GeoServer Helper Views
    urlpatterns += [  # '',
        # Upload views
        url(r'^upload/', include('geonode.upload.urls')),
        # capabilities
        url(r'^capabilities/layer/(?P<layerid>\d+)/$',
            get_capabilities, name='capabilities_layer'),
        url(r'^capabilities/map/(?P<mapid>\d+)/$',
            get_capabilities, name='capabilities_map'),
        url(r'^capabilities/user/(?P<user>[\w.@+-]+)/$',
            get_capabilities, name='capabilities_user'),
        url(r'^capabilities/category/(?P<category>\w+)/$',
            get_capabilities, name='capabilities_category'),
        url(r'^gs/', include('geonode.geoserver.urls')),
    ]

if settings.NOTIFICATIONS_MODULE in settings.INSTALLED_APPS:
    notifications_urls = '{}.urls'.format(settings.NOTIFICATIONS_MODULE)
    urlpatterns += [  # '',
        url(r'^notifications/', include(notifications_urls)),
    ]
if "djmp" in settings.INSTALLED_APPS:
    urlpatterns += [  # '',
        url(r'^djmp/', include('djmp.urls')),
    ]

# Set up proxy
urlpatterns += geonode.proxy.urls.urlpatterns

# Serve static files
urlpatterns += staticfiles_urlpatterns()
urlpatterns += static(settings.LOCAL_MEDIA_URL,
                      document_root=settings.MEDIA_ROOT)
handler401 = 'geonode.views.err403'
handler403 = 'geonode.views.err403'
handler404 = 'geonode.views.handler404'
handler500 = 'geonode.views.handler500'

# Featured Maps Pattens
urlpatterns += [  # '',
    url(r'^featured/(?P<site>[A-Za-z0-9_\-]+)/$',
        geonode.maps.views.featured_map),
    url(r'^featured/(?P<site>[A-Za-z0-9_\-]+)/info$',
        geonode.maps.views.featured_map_info),
]

# FAQ
urlpatterns += [
    url(r'^faq/', include('geonode.frequently.urls'), name='faq'),
]

# Search City
urlpatterns += [
    url(r'^search_city/', 
    TemplateView.as_view(template_name='search_city.html'), name='search_city'),
]

# Study Cases
urlpatterns += [
    url(r'^study_cases/', include('geonode.waterproof_study_cases.urls'), name='study_cases'),
]

# Study Cases Comparison
urlpatterns += [
    url(r'^study_cases_comparison/', include('geonode.waterproof_study_cases_comparison.urls'), name='waterproof_study_cases_comparison'),
]

# waterproof_nbs_ca
urlpatterns += [
    url(r'^waterproof_nbs_ca/', include('geonode.waterproof_nbs_ca.urls'), name='waterproof_nbs_ca'),
]

# waterproof_intake
urlpatterns += [
    url(r'^intake/', include('geonode.waterproof_intake.urls'), name='waterproof_intake'),
]

# waterproof_treatment_plants
urlpatterns += [
    url(r'^treatment_plants/', include('geonode.waterproof_treatment_plants.urls'), name='waterproof_treatment_plants'),
]
# waterproof_parameters
urlpatterns += [
    url(r'^parameters/', include('geonode.waterproof_parameters.urls'), name='waterproof_parameters'),
]
if settings.MONITORING_ENABLED:
    urlpatterns += [url(r'^monitoring/',
                        include(('geonode.monitoring.urls', 'geonode.monitoring'),
                                namespace='monitoring'))]

# waterproof_reports
urlpatterns += [
    url(r'^reports/', include('geonode.waterproof_reports.urls'), name='waterproof_reports'),
]

# waterproof_cms
# urlpatterns += [
#     url(r'^cms/', include('geonode.waterproof_cms.urls'), name='waterproof_cms'),
# ]

# waterproof_wiki
urlpatterns += [
    url(r'^wiki/', include('geonode.waterproof_wiki.urls'), name='wiki'),
]
