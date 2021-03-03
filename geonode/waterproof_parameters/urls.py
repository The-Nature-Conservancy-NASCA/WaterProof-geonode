"""URLs for the ``WaterProof NBS CA`` module."""
from django.conf.urls import url, include
from django.urls import path
from . import views

urlpatterns = [
    path('load-country/', views.loadCountry, name='load_country'),
    # Load a country by id
    path('load-countryByCode/', views.loadCountryByCode, name='load_countryByCode'),
    # Load all countries
    path('load-allCountries/', views.loadAllCountries, name='load_allCountries'),
    # Load currency by id
    path('load-currency/', views.loadCurrency, name='load_currency'),
    # Load currency by country id
    path('load-currencyByCountry/', views.loadCurrencyByCountry, name='load_currencyByCountry'),
    # Load region by country id
    path('load-regionByCountry/', views.loadRegionByCountry, name='load_regionByCountry'),
    # Load all currencies
    path('load-allCurrencies/', views.loadAllCurrencies, name='load_allCurrencies'),
    # Load city by standard name
    path('load-cityByName/', views.loadCityByName, name='load_cityByName')
]
