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
from django.contrib.gis.db import models
from django.urls import reverse
from django.utils.translation import ugettext_lazy as _
from django.db.models import Manager
from django.db.models.query import QuerySet
from geonode.waterproof_parameters.models import Regions,Countries


class CaseInsensitiveQuerySet(QuerySet):
    def _filter_or_exclude(self, mapper, *args, **kwargs):
        # 'name' is a field in your Model whose lookups you want case-insensitive by default
        if 'name' in kwargs:
            kwargs['name__iexact'] = kwargs['name']
            del kwargs['name']
        return super(CaseInsensitiveQuerySet, self)._filter_or_exclude(mapper, *args, **kwargs)

# custom manager that overrides the initial query set


class WaterproofNbsCaManager(Manager):
    def get_queryset(self):
        return CaseInsensitiveQuerySet(self.model)


class ActivityShapefile(models.Model):
    activity = models.CharField(max_length=255)
    action = models.CharField(max_length=255)
    area = models.MultiPolygonField()


class RiosTransition(models.Model):
    name = models.CharField(
        max_length=100,
        verbose_name=_('Name'),
    )
    description = models.CharField(
        max_length=1024,
        verbose_name=_('Description'),
    )

    def __str__(self):
        return "%s" % self.name


class RiosActivity(models.Model):
    transition = models.ForeignKey(RiosTransition, on_delete=models.CASCADE)
    name = models.CharField(
        max_length=100,
        verbose_name=_('Name'),
    )
    description = models.CharField(
        max_length=1024,
        verbose_name=_('Description'),
    )

    def __str__(self):
        return "%s" % self.name


class RiosTransformation(models.Model):
    activity = models.ForeignKey(RiosActivity, on_delete=models.CASCADE)

    name = models.CharField(
        max_length=100,
        verbose_name=_('Name'),
    )
    description = models.CharField(
        max_length=1024,
        verbose_name=_('Description'),
    )
    unique_id = models.CharField(
        max_length=1024,
        verbose_name=_('Unique_id'),
    )

    def __str__(self):
        return "%s" % self.name


class WaterproofNbsCa(models.Model):
    """
    Model to Waterproof.

    :name: Waterproof Name.

    """
    country = models.ForeignKey(Countries, on_delete=models.CASCADE,related_name='countryField')

    currency = models.ForeignKey(Countries, on_delete=models.CASCADE,related_name='currencyField')

    name = models.CharField(
        max_length=100,
        unique=True,
        verbose_name=_('Name'),
    )

    slug = models.CharField(
        max_length=100,
        unique=True,
        verbose_name=_('slug'),
    )

    description = models.CharField(
        max_length=2048,
        verbose_name=_('Description'),
    )

    max_benefit_req_time = models.IntegerField(
        default=0,
        verbose_name=_('Time maximum benefit'),
    )

    profit_pct_time_inter_assoc = models.DecimalField(
        decimal_places=2,
        max_digits=10,
        verbose_name=_('Percentage of benefit associated with interventions at time t=0'),
    )

    unit_implementation_cost = models.DecimalField(
        decimal_places=2,
        max_digits=14,
        verbose_name=_('Unit implementation costs (US $/ha)'),
    )

    unit_maintenance_cost = models.DecimalField(
        decimal_places=2,
        max_digits=14,
        verbose_name=_('Unit maintenance costs (US $/ha)'),
    )

    periodicity_maitenance = models.IntegerField(
        default=0,
        verbose_name=_('Periodicity of maintenance (year)'),
    )

    unit_oportunity_cost = models.DecimalField(
        decimal_places=2,
        max_digits=14,
        verbose_name=_('Unit oportunity costs (US $/ha)'),
    )

    rios_transformations = models.ManyToManyField(
        RiosTransformation,
    )

    activity_shapefile = models.ForeignKey(
        ActivityShapefile,
        null=True,
        on_delete=models.CASCADE
    )

    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )
    objects = WaterproofNbsCaManager()

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name', 'description']

    def get_entries(self):
        return self.entries.filter(published=True).annotate(
            null_position=models.Count('fixed_position')).order_by(
            '-null_position', 'fixed_position', '-amount_of_views')
