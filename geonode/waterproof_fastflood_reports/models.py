from django.db import models
from geonode.waterproof_fastflood.models import StudyCases
from django.utils.translation import ugettext_lazy as _

class zip(models.Model):
    study_case = models.ForeignKey(StudyCases, on_delete=models.CASCADE)
    link = models.CharField(max_length=200, null = True, blank=False)
    link_log = models.CharField(max_length=250, null = True, blank=True)

    class Meta:
        db_table = 'waterproof_fastflood_reports_zip'

class log_fastflood(models.Model):    
    study_case = models.ForeignKey(StudyCases, on_delete=models.CASCADE)
    step_id = models.IntegerField()
    step = models.CharField(max_length=100)
    description = models.CharField(max_length=1024)
    status = models.BooleanField(verbose_name=_('Status'))

    class Meta:
        db_table = 'waterproof_reports_log_fastflood'