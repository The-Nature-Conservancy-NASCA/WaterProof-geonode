# -*- coding: utf-8 -*-
#########################################################################
#
# Copyright (C) 2020 WFApp
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


"""Models for the ``reports`` app."""

from django.db import models
from django.conf import settings
from django.urls import reverse
from django.utils.translation import ugettext_lazy as _
from geonode.waterproof_treatment_plants.models import Header , function
from geonode.waterproof_parameters.models import Countries , Cities , Climate_value
from geonode.waterproof_study_cases.models import studycases
from geonode.waterproof_intake.models import ElementSystem 
from django.db.models.query import QuerySet


class wb_Ptap(models.Model):
    # Create your models here.
    study_case_id = models.ForeignKey(studycases, on_delete=models.CASCADE) #Hace referencia al caso de estudio que originó la ejecución del análisis 
    stage = models.CharField(max_length=10) #Almacena el escenario para el cual se generaron las variables
    funtion_plant_id = models.ForeignKey(function, on_delete=models.CASCADE)#hace referencia al elemento del diagrama.
    function_graph_id = models.IntegerField(verbose_name=_('Graph Id Function'))
    year = models.IntegerField(verbose_name=_('Year')) 
    user_id = models.ForeignKey( settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    awy = models.FloatField(null=True, blank=True, default=None, verbose_name=_('Awy'))
    q_l_s = models.FloatField(null=True, blank=True, default=None, verbose_name=_('Qls'))
    cn_mg_l = models.FloatField(null=True, blank=True, default=None, verbose_name=_('Cn'))
    cp_mg_l = models.FloatField(null=True, blank=True, default=None, verbose_name=_('CpMgl'))
    csed_mg_l = models.FloatField(null=True, blank=True, default=None, verbose_name=_('CsedMgL'))
    wn_kg = models.FloatField(null=True, blank=True, default=None, verbose_name=_('WnKg'))
    wp_kg = models.FloatField(null=True, blank=True, default=None, verbose_name=_('WpKg'))
    wsed_ton = models.FloatField(null=True, blank=True, default=None, verbose_name=_('WsedTon'))
    wn_ret_kg = models.FloatField(null=True, blank=True, default=None, verbose_name=_('WnRetKg'))
    wp_ret_ton = models.FloatField(null=True, blank=True, default=None, verbose_name=_('WpRetTon'))
    wsed_ret_ton = models.FloatField(null=True, blank=True, default=None, verbose_name=_('WsedRetTon'))

    def __str__(self):
        return "%s" % self.name

class wb_intake(models.Model):
    # Create your models here.
    study_case_id = models.ForeignKey(studycases, on_delete=models.CASCADE) #Hace referencia al caso de estudio que originó la ejecución del análisis 
    stage = models.CharField(max_length=10) #Almacena el escenario para el cual se generaron las variables
    water_intake_id =models.IntegerField(verbose_name=_('Water intake id')) #hace referencia al elemento del diagrama.
    element_id = models.IntegerField(verbose_name=_('Element Id'))
    year = models.IntegerField(verbose_name=_('Year')) 
    user_id = models.ForeignKey( settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    awy = models.FloatField(null=True, blank=True, default=None, verbose_name=_('Awy'))
    q_l_s = models.FloatField(null=True, blank=True, default=None, verbose_name=_('Qls'))
    cn_mg_l = models.FloatField(null=True, blank=True, default=None, verbose_name=_('Cn'))
    cp_mg_l = models.FloatField(null=True, blank=True, default=None, verbose_name=_('CpMgl'))
    csed_mg_l = models.FloatField(null=True, blank=True, default=None, verbose_name=_('CsedMgL'))
    wn_kg = models.FloatField(null=True, blank=True, default=None, verbose_name=_('WnKg'))
    wp_kg = models.FloatField(null=True, blank=True, default=None, verbose_name=_('WpKg'))
    wsed_ton = models.FloatField(null=True, blank=True, default=None, verbose_name=_('WsedTon'))
    wn_ret_kg = models.FloatField(null=True, blank=True, default=None, verbose_name=_('WnRetKg'))
    wp_ret_ton = models.FloatField(null=True, blank=True, default=None, verbose_name=_('WpRetTon'))
    wsed_ret_ton = models.FloatField(null=True, blank=True, default=None, verbose_name=_('WsedRetTon'))

    def __str__(self):
        return "%s" % self.name

class calculate_Function_cost_intake(models.Model):
    # Create your models here.
    study_case_id = models.ForeignKey(studycases, on_delete=models.CASCADE)
    stage = models.CharField(max_length=10)	
    water_intake_id =models.IntegerField(verbose_name=_('Water intake id')) #hace referencia al elemento del diagrama.
    element_id = models.IntegerField(verbose_name=_('Element Id'))
    user_id = models.ForeignKey( settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)	
    year = models.IntegerField(verbose_name=_('Year'))	
    value_calculate = models.FloaField(null=True, blank=True, default=0, verbose_name=_('Value calculate'))	
    Function_cost_id = models.IntegerField(verbose_name=_('Graph Id Function'))	
    currency_function = models.CharField(max_length=4, blank=True, null=True)
    date_excution = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return "%s" % self.name

class calculate_Function_cost_Ptap(models.Model):
    # Create your models here.
    study_case_id = models.ForeignKey(studycases, on_delete=models.CASCADE)
    stage = models.CharField(max_length=10)	
    funtion_plant_id = models.ForeignKey(function, on_delete=models.CASCADE)#hace referencia al elemento del diagrama.
    function_graph_id = models.IntegerField(verbose_name=_('Graph Id Function'))
    user_id = models.ForeignKey( settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)	
    year = models.IntegerField(verbose_name=_('Year'))	
    value_calculate = models.FloaField(null=True, blank=True, default=0, verbose_name=_('Value calculate'))	
    Function_cost_id = models.IntegerField(verbose_name=_('Graph Id Function'))	
    currency_function = models.CharField(max_length=4, blank=True, null=True)
    date_excution = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return "%s" % self.name


