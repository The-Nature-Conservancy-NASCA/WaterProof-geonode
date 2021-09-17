from django.db.models.fields.files import ImageField
from django.shortcuts import render, HttpResponse
from django.shortcuts import redirect, get_object_or_404
from django.core.paginator import EmptyPage, PageNotAnInteger, Paginator
from django.shortcuts import render 
from django.db.models import Q
from django.conf import settings
from .models import Article, Referencies, Links, Category
import random

def consultar_articulo(request, id=0):
    #print('--------consultar_articulo--------')
    try:
        articulos=Article.objects.get(pk=id)  
        referencias = None
        #print(f"---{Referencies.objects.filter(article=articulos.pk).exists()}") 
        if Referencies.objects.filter(article=articulos.pk).exists():
            referencias=Referencies.objects.filter(article=articulos.pk)      
        enlaces = None
        enlaces=Links.objects.filter(articulo=articulos.pk)
        #print(f"--------consultar_articulo-----enlaces---{enlaces}")       

    except Exception as e:
        print("El error es:", e)
        r="Articulo no encontrado"
        # print(f"--------*****")
    return render(request, 'waterproof_wiki/articulo_detalle.html', {
        'articulo':articulos,
        'referencias':referencias,
        'enlaces':enlaces      
    })

def consultar_categorias(request , categoria_id):
    categoria= get_object_or_404(Category, id=categoria_id)
    articulos_=Article.objects.filter(categories=categoria_id)
    return render (request, 'waterproof_wiki/categorias.html', {
        'categoria':categoria,
        'articulos':articulos_
    })


def listar_articulos(request):
    articulos=Article.objects.filter(publico='True')

    random_articles = random.sample(list(Article.objects.filter(publico='True').exclude(imagen='null')), 5)
    print (random_articles)

    paginator=Paginator(articulos,5)
    idPaginaPaginador=request.GET.get('page')
    #print(f"idPaginaPaginador:{idPaginaPaginador}")
    
    try:
        articulosDePagina = paginator.page(idPaginaPaginador)
    except PageNotAnInteger:
        articulosDePagina = paginator.page(1)
    except EmptyPage:
        articulosDePagina= paginator.page(paginator.num_pages)
    
    return render(request, 'waterproof_wiki/articulos.html', {
        'articulos':articulosDePagina,
        'random_articles':random_articles,
        'SITE_HOST_API' : settings.SITE_HOST_API
    })

def listar_articulos_random(request):
    articulos=Article.objects.filter(publico='True').exclude(imagen='null').order_by('?')
    
    return render(request, 'waterproof_wiki/carrusel.html', {
        'articulos':articulos, 
    })

def listar_articulos_filtro(request, p_titulo=""):
    q=request.GET.get('p_titulo')
    print(f"____________p_titulo:{q}")
    articulos=Article.objects.filter(Q(titulo__icontains=q) | Q(titulo_en__icontains=q)) #titulo__exacts  titulo__iexacts !Esto se llama Looups ! 
    
    paginator=Paginator(articulos,5)
    idPaginaPaginador=request.GET.get('page')
    print(f"idPaginaPaginador:{idPaginaPaginador}")
    
    try:
        articulosDePagina = paginator.page(idPaginaPaginador)
    except PageNotAnInteger:
        # If page is not an integer, deliver first page.
        articulosDePagina = paginator.page(1)
    except EmptyPage:
        # If page is out of range (e.g. 9999), deliver last page of results.
        articulosDePagina= paginator.page(paginator.num_pages)
    
    return render(request, 'waterproof_wiki/articulos.html', {
        'articulos':articulosDePagina, 
    })


