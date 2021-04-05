from django.conf import settings
from django.db import models
from django.contrib.gis.db import models
from django.utils.translation import ugettext_lazy as _
from geonode.waterproof_parameters.models import Countries, Cities
# Create your models here.

class WB_intakes(models.Model):

    element_id = models.IntegerField(
        max_length=100,
        verbose_name=_('element id')
    )

    intake_id = models.IntegerField(
        max_length=100,
        verbose_name=_('intake id')
    )

    year = models.IntegerField()

    user_id = models.IntegerField()

    awy = models.DecimalField(
        decimal_places=2,
        max_digits=14,
        verbose_name=_('awy')
    )

    Q = models.DecimalField(
        decimal_places=2,
        max_digits=14,
        verbose_name=_('Q')
    )

    cn_mg_l = models.DecimalField(
        decimal_places=2,
        max_digits=14,
        verbose_name=_('cn_mg_l')
    )

    cp_mg_l = models.DecimalField(
        decimal_places=2,
        max_digits=14,
        verbose_name=_('cp_mg_l')
    )

    csed_mg_l = models.DecimalField(
        decimal_places=2,
        max_digits=14,
        verbose_name=_('csed_mg_l')
    )

    wn_kg = models.DecimalField(
        decimal_places=2,
        max_digits=14,
        verbose_name=_('wn_kg')
    )

    wp_kg = models.DecimalField(
        decimal_places=2,
        max_digits=14,
        verbose_name=_('wp_kg')
    )

    wsed_ton = models.DecimalField(
        decimal_places=2,
        max_digits=14,
        verbose_name=_('wsed_ton')
    )

    wn_ret_kg = models.DecimalField(
        decimal_places=2,
        max_digits=14,
        verbose_name=_('wn_ret_kg')
    )

    wp_ret_kg = models.DecimalField(
        decimal_places=2,
        max_digits=14,
        verbose_name=_('wp_ret_kg')
    )

    wsed_ret_ton = models.DecimalField(
        decimal_places=2,
        max_digits=14,
        verbose_name=_('wsed_ret_ton')
    )

class WB_PTAP(models.Model):

    element_id = models.IntegerField(
        max_length=100,
        verbose_name=_('element id')
    )

    PTAP_id = models.IntegerField(
        max_length=100,
        verbose_name=_('PTAP_id')
    )

    year = models.IntegerField(
        max_length=100,
        verbose_name=_('year')
    )

    user_id = models.IntegerField(
        max_length=100,
        verbose_name=_('user id')
    )

    awy = models.DecimalField(
        decimal_places=2,
        max_digits=14,
        verbose_name=_('awy')
    )

    Q = models.DecimalField(
        decimal_places=2,
        max_digits=14,
        verbose_name=_('Q')
    )

    cn_mg_l = models.DecimalField(
        decimal_places=2,
        max_digits=14,
        verbose_name=_('cn_mg_l')
    )

    cp_mg_l = models.DecimalField(
        decimal_places=2,
        max_digits=14,
        verbose_name=_('cp_mg_l')
    )

    csed_mg_l = models.DecimalField(
        decimal_places=2,
        max_digits=14,
        verbose_name=_('csed_mg_l')
    )

    wn_kg = models.DecimalField(
        decimal_places=2,
        max_digits=14,
        verbose_name=_('wn_kg')
    )

    wp_kg = models.DecimalField(
        decimal_places=2,
        max_digits=14,
        verbose_name=_('wp_kg')
    )

    wsed_ton = models.DecimalField(
        decimal_places=2,
        max_digits=14,
        verbose_name=_('wsed_ton')
    )

    wn_ret_kg = models.DecimalField(
        decimal_places=2,
        max_digits=14,
        verbose_name=_('wn_ret_kg')
    )

    wp_ret_kg = models.DecimalField(
        decimal_places=2,
        max_digits=14,
        verbose_name=_('wp_ret_kg')
    )

    wsed_ret_ton = models.DecimalField(
        decimal_places=2,
        max_digits=14,
        verbose_name=_('wsed_ret_ton')
    )

class Invest_indicators(models.Model):

    name = models.CharField(
        max_length=250,
        verbose_name=_('name')
    )

    Type = models.CharField(
        max_length=250,
        verbose_name=_('type')
    )

    Path = models.CharField(
        max_length=250,
        verbose_name=_('Path')
    )

    value = models.DecimalField(
        decimal_places=2,
        max_digits=14,
        verbose_name=_('value')
    )

    user_id = models.IntegerField(
        max_length=100,
        verbose_name=_('user id')
    )

    study_case_id = models.IntegerField(
        max_length=100,
        verbose_name=_('study_case_id')
    )

    date = models.DateField()
