# from django.contrib import admin
# from .models import Article, Category, Referencies, Links
# from .forms import *
# # Register your models here.

# class LinksInline(admin.TabularInline):
#     model = Links
    
# class ArticleAdmin(admin.ModelAdmin):
#     readonly_fields=('user',)
#     search_fields=('titulo', 'contenido')
#     list_display=('titulo', 'publico', 'user','created_at')
#     inlines=[LinksInline]
#     form = ArticleModelForm
#     def save_model(self, request, obj, form, change):
#         if not obj.user_id:
#             obj.user_id= request.user.id
#         obj.save()

# class LinksAdmin(admin.ModelAdmin):
#     search_fields=('url', 'descripcion')
#     list_display=('url', 'descripcion','created_at')

# class CategoryAdmin(admin.ModelAdmin):
#     form = CategoryModelForm
   

# admin.site.register(Article,ArticleAdmin)
# admin.site.register(Category, CategoryAdmin)
# admin.site.register(Referencies)
# admin.site.register(Links, LinksAdmin)




