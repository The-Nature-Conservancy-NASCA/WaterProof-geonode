from .models import Category, Article

def get_categrias (request):
    idsArt = Article.objects.filter(publico=True).values_list('categories', flat=True)
    print("idsArt: "+str(idsArt))
    categorias_ = Category.objects.filter(id__in=idsArt).values_list('id', 'nombre')
    print("categorias_: "+str(categorias_))
    
    return {
        'categorias':categorias_, 
        'ids':idsArt
    }