from django.db import models
from django.conf import settings
from django.contrib.gis.db import models
from django.utils.translation import ugettext_lazy as _

class Header(models.Model):
    plant_id = models.IntegerField(verbose_name=_('Id Plant'))
    plant_name = models.CharField(max_length=100,verbose_name=_('Name Plant'))
    plant_description = models.CharField(max_length=300,verbose_name=_('Description Plant'))
    plant_suggest = models.CharField(max_length=1,verbose_name=_('Suggest Plant'))
