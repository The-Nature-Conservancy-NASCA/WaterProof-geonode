from django.forms import ModelForm, Textarea
from .models import Category, Article

class CategoryModelForm(ModelForm):
    class Meta:
        model = Category
        fields = ('__all__')
        widgets = {
            'descripcion': Textarea(attrs={'cols': 80, 'rows': 2}),
            'descripcion_en': Textarea(attrs={'cols': 80, 'rows': 2}),
        }

class ArticleModelForm(ModelForm):
    class Meta:
        model = Article
        fields = ('__all__')
        widgets = {
            'resumen': Textarea(attrs={'cols': 80, 'rows': 2}),
            'resumen_en': Textarea(attrs={'cols': 80, 'rows': 2}),
            'metadato_imagen': Textarea(attrs={'cols': 80, 'rows': 2}),
            'metadato_imagen_en': Textarea(attrs={'cols': 80, 'rows': 2}),
            
        }