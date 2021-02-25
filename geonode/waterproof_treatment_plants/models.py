from django.db import models
from django.conf import settings
from django.contrib.gis.db import models
from django.utils.translation import ugettext_lazy as _

class Header(models.Model):
    plant_id = models.IntegerField(auto_created=True, primary_key=True,verbose_name=_('Id Plant'))
    plant_name = models.CharField(max_length=100,verbose_name=_('Name Plant'))
    plant_description = models.CharField(max_length=300,verbose_name=_('Description Plant'))
    plant_suggest = models.CharField(max_length=1,verbose_name=_('Suggest Plant'))
    plant_user = models.CharField(max_length=100,verbose_name=_('User Plant'))
    plant_date_create = models.DateTimeField(auto_now=False,verbose_name=_('Date Create Plant'))
    plant_date_update = models.DateTimeField(auto_now=True,verbose_name=_('Date Update Plant'))

class Element(models.Model):
    element_id = models.IntegerField(auto_created=True, primary_key=True,verbose_name=_('Id Element'))
    element_normalize_category = models.CharField(max_length=100,verbose_name=_('Name Element'))
    element_transported_water = models.CharField(max_length=100,verbose_name=_('Water Transported'))
    element_sediments_retained = models.CharField(max_length=100,verbose_name=_('Retrainer Sediments'))
    element_nitrogen_retained = models.CharField(max_length=100,verbose_name=_('Retrainer Nitrogen'))
    element_phosphorus_retained = models.CharField(max_length=100,verbose_name=_('Retrainer Phosphorus'))
    element_plant_id = models.IntegerField(verbose_name=_('Id Plant'))
    element_graph_id = models.IntegerField(verbose_name=_('Id Graph'))
    element_on_off = models.BooleanField(default=False, verbose_name=_('On off Element'))
    element_q_l = models.IntegerField(verbose_name=_('Q L Element'))
    element_awy = models.IntegerField(verbose_name=_('Awy Element'))
    element_cn_mg_l = models.IntegerField(verbose_name=_('CN Mg L Element'))
    element_cp_mg_l = models.IntegerField(verbose_name=_('CP Mg L Element'))
    element_csed_mg_l = models.IntegerField(verbose_name=_('Mg L Csed Element'))
    element_wn_kg = models.IntegerField(verbose_name=_('Wn Kg Element'))
    element_wn_rent_kg = models.IntegerField(verbose_name=_('Wn Rent Kg Element'))
    element_wp_rent_ton = models.IntegerField(verbose_name=_('Wn Rent Ton Element'))
    element_wsed_tom = models.IntegerField(verbose_name=_('Wsed Ton Element'))
    element_wp_kg = models.IntegerField(verbose_name=_('Wp Kg Element'))
    element_user = models.CharField(max_length=100,verbose_name=_('User Element'))
    element_date_create = models.DateTimeField(auto_now=False,verbose_name=_('Date Create Element'))
    element_date_update = models.DateTimeField(auto_now=True,verbose_name=_('Date Update Element'))

