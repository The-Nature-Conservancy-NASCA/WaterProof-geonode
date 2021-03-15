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


"""Models for the ``WaterProof NBS CA`` app."""

from django.conf import settings
from django.db import models
from django.urls import reverse
from django.utils.translation import ugettext_lazy as _
from django.db.models import Manager
from django.db.models.query import QuerySet


class Regions(models.Model):
    name = models.CharField(
        max_length=100,
        verbose_name=_('Name'),
    )

    def __str__(self):
        return "%s" % self.name


class Countries(models.Model):
    name = models.CharField(max_length=100)
    iso3 = models.CharField(max_length=3, blank=True, null=True)
    iso2 = models.CharField(max_length=2, blank=True, null=True)
    phonecode = models.CharField(max_length=255, blank=True, null=True)
    capital = models.CharField(max_length=255, blank=True, null=True)
    currency = models.CharField(max_length=255)
    currency_symbol = models.CharField(max_length=255)
    native = models.CharField(max_length=255, blank=True, null=True)
    region = models.CharField(max_length=255, blank=True, null=True)
    region = models.ForeignKey(Regions, on_delete=models.CASCADE)
    subregion = models.CharField(max_length=255, blank=True, null=True)
    timezones = models.TextField(blank=True, null=True)
    translations = models.TextField(blank=True, null=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=8, blank=True, null=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, blank=True, null=True)
    emoji = models.CharField(max_length=191, blank=True, null=True)
    emojiu = models.CharField(db_column='emojiU', max_length=191, blank=True, null=True)  # Field name made lowercase.
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    flag = models.BooleanField()
    # Field name made lowercase.
    wikidataid = models.CharField(db_column='wikiDataId', max_length=255, blank=True, null=True)
    global_multiplier_factor = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True)
    description_standard_spanish = models.CharField(max_length=255, blank=True, null=True)
    description_standard_english = models.CharField(max_length=255, blank=True, null=True)
    standard_region_tnc = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return "%s" % self.name


class Cities(models.Model):
    name = models.CharField(max_length=255)
    state_id = models.IntegerField()
    state_code = models.CharField(max_length=255)
    country = models.ForeignKey(Countries, on_delete=models.CASCADE)
    country_code = models.CharField(max_length=2)
    latitude = models.DecimalField(max_digits=10, decimal_places=8)
    longitude = models.DecimalField(max_digits=11, decimal_places=8)
    created_at = models.DateTimeField()
    updated_on = models.DateTimeField()
    flag = models.BooleanField()
    # Field name made lowercase.
    wikidataid = models.CharField(db_column='wikiDataId', max_length=255, blank=True, null=True)
    standard_name_spanish = models.CharField(max_length=255)
    standard_name_english = models.CharField(max_length=255)

    def __str__(self):
        return "%s" % self.name

class ManagmentCosts_Discount(models.Model):
    country = models.ForeignKey(Countries, on_delete=models.CASCADE)
    Program_Director_USD_YEAR = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    Implementation_Manager_USD_YEAR = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    Monitoring_and_Evaluation_Manager_USD_YEAR = models.DecimalField(
        max_digits=10, decimal_places=2, blank=True, null=True)
    Finance_Manager_USD_YEAR = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    Administrative_Assistant_USD_YEAR = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    Office_Costs_USD_YEAR = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    Overhead_USD_YEAR = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    Equipment_Purchased_In_Year_1_USD = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    Vehicles_Purchased_In_Year_1_USD = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    Equipment_Maintenance_USD_YEAR = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    Vehicle_Maintenance_USD_YEAR = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    drt_discount_rate_medium = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True)
    drt_discount_rate_upper_limit = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True)
    drt_discount_rate_lower_limit = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True)
    Transaction_cost = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True)

    def _str_(self):
        return "%s" % self.name
