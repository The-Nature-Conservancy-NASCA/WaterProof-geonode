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
from django.utils.translation import ugettext_lazy as _
from geonode.waterproof_treatment_plants.models import Header, Function
from geonode.waterproof_parameters.models import Countries, Cities , Climate_value
from geonode.waterproof_study_cases.models import StudyCases
from geonode.waterproof_intake.models import ElementSystem 


class wbPtap(models.Model):
    # Create your models here.
    studycase = models.ForeignKey(StudyCases, on_delete=models.CASCADE) #Hace referencia al caso de estudio que originó la ejecución del análisis 
    stage = models.CharField(max_length=10) #Almacena el escenario para el cual se generaron las variables
    function_plant = models.ForeignKey(Function, on_delete=models.CASCADE)#hace referencia al elemento del diagrama.
    function_graph = models.IntegerField(verbose_name=_('Graph Id Function'))
    year = models.IntegerField(verbose_name=_('Year')) 
    user = models.ForeignKey( settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.CASCADE)
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


class wbIntake(models.Model):
    # Create your models here.
    studycase = models.ForeignKey(StudyCases, on_delete=models.CASCADE) #Hace referencia al caso de estudio que originó la ejecución del análisis 
    stage = models.CharField(max_length=10) #Almacena el escenario para el cual se generaron las variables
    water_intake =models.IntegerField(verbose_name=_('Water intake id')) #hace referencia al elemento del diagrama.
    element = models.IntegerField(verbose_name=_('Element Id'))
    year = models.IntegerField(verbose_name=_('Year')) 
    user = models.ForeignKey( settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.CASCADE)
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


class calculateCostFunctionIntake(models.Model):
    # Create your models here.
    study_case = models.ForeignKey(StudyCases, on_delete=models.CASCADE)
    stage = models.CharField(max_length=10)	
    water_intake =models.IntegerField(verbose_name=_('Water intake id')) #hace referencia al elemento del diagrama.
    element = models.IntegerField(verbose_name=_('Element Id'))
    user = models.ForeignKey( settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.CASCADE)	
    year = models.IntegerField(verbose_name=_('Year'))	
    value_calculate = models.FloatField(null=True, blank=True, default=0, verbose_name=_('Value calculate'))	
    cost_function = models.IntegerField(verbose_name=_('Graph Id Function'))	
    currency_function = models.CharField(max_length=4, blank=True, null=True)
    date_excution = models.DateTimeField(blank=True, null=True)


class calculateCostFunctionPtap(models.Model):
    # Create your models here.
    study_case = models.ForeignKey(StudyCases, on_delete=models.CASCADE)
    stage = models.CharField(max_length=10)	
    function_plant = models.ForeignKey(Function, on_delete=models.CASCADE)#hace referencia al elemento del diagrama.
    function_graph = models.IntegerField(verbose_name=_('Graph Id Function'))
    user = models.ForeignKey( settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.CASCADE)	
    year = models.IntegerField(verbose_name=_('Year'))	
    value_calculate = models.FloatField(null=True, blank=True, default=0, verbose_name=_('Value calculate'))	
    cost_function = models.IntegerField(verbose_name=_('Graph Id Function'))	
    currency_function = models.CharField(max_length=4, blank=True, null=True)
    date_excution = models.DateTimeField(blank=True, null=True)

class investIndicators(models.Model):
    study_case = models.ForeignKey(StudyCases, on_delete=models.CASCADE)
    user = models.ForeignKey( settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.CASCADE)	
    name = models.CharField(max_length=10)
    type = models.CharField(max_length=10)
    path = models.CharField(max_length=10)
    value = models.FloatField(null=True, blank=True, default=None, verbose_name=_('value'))
    date = models.DateField()
