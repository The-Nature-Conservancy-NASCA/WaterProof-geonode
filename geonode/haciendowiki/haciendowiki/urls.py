"""haciendowiki URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf.urls import url
from django.contrib import admin
from seccioneswiki import views
from django.urls import path
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.listar_articulos, name="listar_articulos"),
   
    path('articulos/', views.listar_articulos, name="listar_articulos"),
    path('articulos-random/', views.listar_articulos_random, name="listar_articulos_random"),
    path('consultar-articulo/<int:id>', views.consultar_articulo, name="consultar_articulo"),
    path('categoria/<int:categoria_id>', views.consultar_categorias, name="consultar_categorias"),

    url(r'^buscar', views.listar_articulos_filtro, name="listar_articulos_filtro"),


]

#Configuracion para mostrar imagenes que se hayn subido
if settings.DEBUG:
    from django.conf.urls.static import static
    urlpatterns += static (settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)



