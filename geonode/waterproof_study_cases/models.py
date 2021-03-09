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


"""Models for the ``study_cases`` app."""
from django.conf import settings
from django.db import models
from django.urls import reverse
from django.utils.translation import ugettext_lazy as _
from geonode.waterproof_intake.models import ElementSystem
from geonode.waterproof_parameters.models import Countries , Cities
from geonode.waterproof_treatment_plants.models import Header

class ModelParameter(models.Model):
   

    description = models.CharField(
        max_length=500,
        verbose_name=_('Description')
    )

    lucode = models.IntegerField(verbose_name=_('Lucode'))
    
    lulc_veg = models.BooleanField(
        verbose_name=_('LULC_veg'),
        null=True
    )
    
    root_depth = models.DecimalField(verbose_name=_('root_depth'),max_digits=20, decimal_places=2, blank=True, null=True)
    
    kc = models.DecimalField(verbose_name=_('Kc'),max_digits=20, decimal_places=2, blank=True, null=True)

    def __str__(self):
        return "%s" % self.description
    

  

class Portfolio(models.Model):
    name = models.CharField(
        max_length=100,
        verbose_name=_('Name'),
    )

    description = models.CharField(
        max_length=500,
        verbose_name=_('Description'),
        null=True
    )

    default = models.BooleanField(
        verbose_name=_('Default')
    )

    def __str__(self):
        return "%s" % self.name
        
    
class StudyCases(models.Model):
    """
    Model to gather answers in topic groups.

    :name: Study Case Name.

    """
    name = models.CharField(max_length=100, blank=False, null=False)
    description = models.CharField(max_length=500, blank=False, null=False)
    analysis_period_value = models.IntegerField(blank=True, null=True)
    analysis_currency = models.CharField(max_length=10, blank=True, null=True)
    status = models.IntegerField(blank=True, null=True)
    usr_create = models.IntegerField(blank=True, null=True)
    create_date = models.DateTimeField(blank=True, null=True)
    edit_date = models.DateTimeField(blank=True, null=True)
    time_implement_portfolio = models.IntegerField(blank=True, null=True)
    climate_scenario_portfolio = models.CharField(max_length=100, blank=True, null=True)
    annual_investment_scenario = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    time_implement_investment_scenario = models.IntegerField(blank=True, null=True)
    climate_investment_scenario = models.CharField(max_length=100, blank=True, null=True)
    benefit_carbon_market = models.BooleanField(blank=True, null=True)
    rellocated_remainder = models.BooleanField(blank=True, null=True)
    intakes = models.ManyToManyField(ElementSystem)
    ptaps = models.ManyToManyField(Header)
    portfolios = models.ManyToManyField(Portfolio)
    cm_city = models.ForeignKey(Cities , on_delete=models.CASCADE, null=True)
    cm_value = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)

class Meta:
    managed = False
    db_table = 'waterproof_study_cases'
