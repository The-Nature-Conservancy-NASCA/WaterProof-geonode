from django.http import JsonResponse
from django.shortcuts import render
from django.core import serializers
# from .models import HomePage


# def principalView(request):
#     richText = HomePage.content_panels
#     return render(request, 'waterproof_cms/cms_view.html', {
#         'richTextCms' : richText
#     })

def homeView(request):
    return render (request, 'waterproof_cms/home_page.html', {})