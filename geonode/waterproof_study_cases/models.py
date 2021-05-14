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
from geonode.waterproof_intake.models import Intake
from geonode.waterproof_parameters.models import Countries , Cities , Climate_value
from geonode.waterproof_treatment_plants.models import Header
from geonode.waterproof_nbs_ca.models import WaterproofNbsCa

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
    city = models.ForeignKey(Cities, on_delete=models.CASCADE)
    studycase_type = models.CharField(max_length=20, blank=True, null=True)
    program_Director = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    implementation_Manager = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    monitoring_Manager= models.DecimalField(
        max_digits=20, decimal_places=2, blank=True, null=True)
    finance_Manager = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    administrative_Assistant = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    office_Costs = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    overhead = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    equipment_Purchased = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    vehicles_Purchased = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    equipment_Maintenance = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    vehicle_Maintenance = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    discount_rate = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    discount_rate_maximum = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    discount_rate_minimunm= models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    transaction_cost = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    others = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    travel = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    contracts = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    analysis_type = models.CharField(max_length=20, blank=True, null=True)
    analysis_period_value = models.IntegerField(blank=True, null=True)
    analysis_currency = models.CharField(max_length=4, blank=True, null=True)
    is_complete = models.BooleanField(verbose_name=_('Is complete'), default=False)
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )
    create_date = models.DateTimeField(blank=True, null=True)
    edit_date = models.DateTimeField(blank=True, null=True)
    time_implement = models.IntegerField(blank=True, null=True)
    climate_scenario = models.ForeignKey(Climate_value, blank=True, null=True, on_delete=models.CASCADE)
    annual_investment = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    benefit_carbon_market = models.BooleanField(blank=True, null=True)
    rellocated_remainder = models.BooleanField(blank=True, null=True)
    financial_currency = models.CharField(max_length=4, blank=True, null=True)
    intakes = models.ManyToManyField(Intake)
    ptaps = models.ManyToManyField(Header)
    portfolios = models.ManyToManyField(Portfolio)
    cm_currency = models.CharField(max_length=4, blank=True, null=True)
    cm_value = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)

class StudyCases_NBS(models.Model):
    studycase = models.ForeignKey(StudyCases, on_delete=models.CASCADE)
    nbs = models.ForeignKey(WaterproofNbsCa, on_delete=models.CASCADE)
    value = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)

class Meta:
    managed = False
    db_table = 'waterproof_study_cases'
