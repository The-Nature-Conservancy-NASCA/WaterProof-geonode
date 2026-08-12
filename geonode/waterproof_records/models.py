from django.db import models
from django.conf import settings
from django.urls import reverse
from django.utils.translation import ugettext_lazy as _
from geonode.waterproof_intake.models import Intake, ElementSystem
from geonode.waterproof_parameters.models import Countries , Cities , Climate_value
from geonode.waterproof_treatment_plants.models import Header
from geonode.waterproof_nbs_ca.models import WaterproofNbsCa
# Create your models here.
