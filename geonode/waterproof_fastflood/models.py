from django.db import models
from django.utils.translation import ugettext_lazy as _
from django.conf import settings
from geonode.waterproof_intake.models import Basins
from geonode.waterproof_nbs_ca.models import WaterproofNbsCa
from geonode.waterproof_parameters.models import Climate_value, Countries, Cities
from django.contrib.gis.db import models
from geonode.waterproof_study_cases.models import Portfolio

class Watershed(models.Model):
    """
    Model to Waterproof Fastflood Watershed.

    :name: Watershed Name.
    :description: Watershed Description.
    :city: Watershed City.
    :is_complete: Watershed Status.
    :creation_date: Watershed Creation Date.
    :updated_date: Watershed Update Date.
    :added_by: Watershed user .

    """

    name = models.CharField(
        max_length=100,
        verbose_name=_('Name'),
    )
    
    description = models.CharField(
        max_length=1024,
        verbose_name=_('Description'),
    )
    
    city = models.ForeignKey(Cities, on_delete=models.CASCADE)

    ws_area = models.FloatField(
        null=True,
        blank=True,
        default=None,
        verbose_name=_('Area')
    )
    
    is_complete = models.BooleanField(verbose_name=_('Is complete'), default=False)

    creation_date = models.DateField()

    updated_date = models.DateField(auto_now=True)
    
    demvalue = models.IntegerField(
        verbose_name=_('DEM value')
    )

    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )
    
    class Meta:
        db_table = 'waterproof_fastflood_watershed'  
    
class Polygon(models.Model):

    area = models.FloatField(
        null=True,
        blank=True,
        default=None,
        verbose_name=_('Area')
    )
    geom = models.PolygonField(verbose_name='geom', srid=4326, null=True, blank=True)

    geom_watershed = models.TextField(
        verbose_name=_('Geom watershed'),
        null=True,
        blank=True
    )

    delimitation_date = models.DateField(auto_now=True)
    watershed = models.ForeignKey(Watershed, on_delete=models.CASCADE)    
    bbox = models.TextField(
        verbose_name=_('Binding box coords')
    )   
    resolution = models.IntegerField(
        verbose_name=_('DEM resolution')
    )
    basin_id = models.IntegerField(
        verbose_name=_('basin_id'),
    )
    
    class Meta:
        db_table = 'waterproof_fastflood_polygon'


class StudyCases(models.Model):
    """
    Model to gather answers in topic groups.

    :name: Study Case Name.

    """
    name = models.CharField(max_length=100, blank=False, null=False)
    description = models.CharField(max_length=500, blank=False, null=False)
    city = models.ForeignKey(Cities, on_delete=models.CASCADE, related_name='study_case_city')
    studycase_type = models.CharField(max_length=200, blank=True, null=True)
    program_Director = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    implementation_Manager = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    monitoring_Manager= models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    finance_Manager = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    administrative_Assistant = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    office_Costs = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    overhead = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    equipment_Purchased = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
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
    is_run_analysis = models.BooleanField(verbose_name=_('Is run analysis'), default=False)
    is_public = models.BooleanField(verbose_name=_('Is public'), default=False)
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='study_case_added_by'
    )
    create_date = models.DateTimeField(blank=True, null=True)
    edit_date = models.DateTimeField(blank=True, null=True)
    time_implement = models.IntegerField(blank=True, null=True)
    climate_scenario_id = models.IntegerField(blank=True, null=True)
    annual_investment = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True, default=0)
    benefit_carbon_market = models.BooleanField(blank=True, null=True)
    rellocated_remainder = models.BooleanField(blank=True, null=True)
    financial_currency = models.CharField(max_length=4, blank=True, null=True)   
    watershed = models.ManyToManyField(Watershed) 
    portfolios = models.ManyToManyField(Portfolio, related_name='study_case_portfolios', blank=True)
    cm_currency = models.CharField(max_length=4, blank=True, null=True)
    cm_value = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    path_study_case_pdf = models.CharField(max_length=500, blank=False, null=True)
    path_study_case_error_log = models.CharField(max_length=500, blank=False, null=True)
    # cost_functions =  models.TextField(null=True,blank=True,verbose_name=_('Cost_function'))
    storage= models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True, default=0)
    ocean_elevation = models.DecimalField(max_digits=4, decimal_places=2, blank=True, null=True)
    commercial_value = models.IntegerField(blank=True, null=True)
    industrial_value = models.IntegerField(blank=True, null=True)
    change_year = models.IntegerField(blank=True, null=True)
    quantile = models.IntegerField(blank=True, null=True)
    design_storm_duration = models.IntegerField(blank=True, null=True)
    analysis_storm_duration= models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    damage_currency = models.CharField(max_length=4, blank=True, null=True)
    width_mul = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True, default=0.0)
    width_exp = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True, default=0.0)
    depth_mul = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True, default=0.0)
    depth_exp = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True, default=0.0)
    min_cross = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True, default=0.0)
    channel_manning = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True, default=0.0)
    folder_name = models.CharField(max_length=100, blank=True, null=True)
    damage_currency_exchange = models.DecimalField(max_digits=20, decimal_places=12, blank=True, null=True, default=1)
    exponential_parameters = models.IntegerField(blank=True, null=True)
    class Meta:
        db_table = 'waterproof_fastflood_studycases'
        
class Damage(models.Model):
    iso = models.CharField(max_length=3, blank=True, null=False)
    country = models.CharField(max_length=50, blank=True, null=False)
    continent = models.CharField(max_length=5, blank=True, null=False)
    damage_class = models.CharField(max_length=50, blank=True, null=False)
    flood_depth = models.DecimalField(max_digits=6, decimal_places=3, blank=True, null=True)
    damage_factor = models.DecimalField(max_digits=4, decimal_places=2, blank=True, null=True)
    class Meta:
        db_table = 'waterproof_fastflood_damage'

class MaxDamageCost(models.Model):
    iso = models.CharField(max_length=3, blank=True, null=False)
    country = models.CharField(max_length=50, blank=True, null=False)
    continent = models.CharField(max_length=5, blank=True, null=False)
    damage_class = models.CharField(max_length=50, blank=True, null=False)
    max_damage_cost = models.DecimalField(max_digits=20, decimal_places=7, blank=True, null=True)    
    class Meta:
        db_table = 'waterproof_fastflood_max_damage_cost'
        
class StudyCases_NBS_Fastflood(models.Model):
    studycase = models.ForeignKey(StudyCases, on_delete=models.CASCADE)
    nbs = models.ForeignKey(WaterproofNbsCa, on_delete=models.CASCADE)
    value = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    class Meta:
        db_table = 'waterproof_fastflood_studycases_nbs'

class StudyCases_Currency_Fastflood(models.Model):
    studycase = models.ForeignKey(StudyCases, on_delete=models.CASCADE)
    currency = models.CharField(max_length=4, blank=True, null=True)
    value = models.DecimalField(max_digits=20, decimal_places=12, blank=True, null=True)
    class Meta:
        db_table = 'waterproof_fastflood_studycase_currency'
        
class StudyCases_Parameters_Bio(models.Model):
    lucode = models.IntegerField(blank=True, null=True)
    lulc_desc = models.TextField(blank=True, null=True)
    kc = models.FloatField(blank=True, null=True)
    root_depth = models.FloatField(blank=True, null=True)
    usle_c = models.FloatField(blank=True, null=True)
    usle_p = models.FloatField(blank=True, null=True)
    load_n = models.FloatField(blank=True, null=True)
    eff_n = models.FloatField(blank=True, null=True)
    load_p = models.FloatField(blank=True, null=True)
    eff_p = models.FloatField(blank=True, null=True)
    crit_len_n = models.IntegerField(blank=True, null=True)
    crit_len_p = models.IntegerField(blank=True, null=True)
    proportion_subsurface_n = models.FloatField(blank=True, null=True)
    cn_a = models.FloatField(blank=True, null=True)
    cn_b = models.FloatField(blank=True, null=True)
    cn_c = models.FloatField(blank=True, null=True)
    cn_d = models.FloatField(blank=True, null=True)
    kc_1 = models.FloatField(blank=True, null=True)
    kc_2 = models.FloatField(blank=True, null=True)
    kc_3 = models.FloatField(blank=True, null=True)
    kc_4 = models.FloatField(blank=True, null=True)
    kc_5 = models.FloatField(blank=True, null=True)
    kc_6 = models.FloatField(blank=True, null=True)
    kc_7 = models.FloatField(blank=True, null=True)
    kc_8 = models.FloatField(blank=True, null=True)
    kc_9 = models.FloatField(blank=True, null=True)
    kc_10 = models.FloatField(blank=True, null=True)
    kc_11 = models.FloatField(blank=True, null=True)
    kc_12 = models.FloatField(blank=True, null=True)
    c_above = models.FloatField(blank=True, null=True)
    c_below = models.FloatField(blank=True, null=True)
    c_soil = models.FloatField(blank=True, null=True)
    c_dead = models.FloatField(blank=True, null=True)
    sed_exp = models.FloatField(blank=True, null=True)
    sed_ret = models.FloatField(blank=True, null=True)
    rough_rank = models.FloatField(blank=True, null=True)
    cover_rank = models.FloatField(blank=True, null=True)
    p_ret = models.FloatField(blank=True, null=True)
    p_exp = models.FloatField(blank=True, null=True)
    n_ret = models.FloatField(blank=True, null=True)
    n_exp = models.FloatField(blank=True, null=True)
    native_veg = models.IntegerField(blank=True, null=True)
    lulc_veg = models.IntegerField(blank=True, null=True)
    macro_region = models.TextField(blank=True, null=True)
    user_id = models.TextField(blank=True, null=True)
    study_case = models.ForeignKey(StudyCases, on_delete=models.CASCADE)
    class Meta:
        db_table = 'waterproof_fastflood_parameters_biophysical'
        
class Fastflood_investment_scenario(models.Model):
    scenario = models.CharField(max_length=50, blank=True,null=False)
    code = models.CharField(max_length=50, blank=True,null=False)
    day = models.IntegerField(blank=True, null=False)
    class Meta:
        db_table = 'waterproof_fastflood_investment_scenario'
        
class StudyCase_damage_curve(models.Model):
    study_case = models.ForeignKey(StudyCases, on_delete=models.CASCADE)
    flood_depth = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    residential = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    commercial = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    industrial = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    infraroad = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    agriculture = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    class Meta:
        db_table = 'waterproof_fastflood_damage_curves'
        
class StudyCase_depth_damage(models.Model):
    study_case = models.OneToOneField(StudyCases, on_delete=models.CASCADE)
    residential = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    commercial = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    industrial = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    infraroad = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    agriculture = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    class Meta:
        db_table = 'waterproof_fastflood_depth_damages'
        
class Fastflood_json_params(models.Model):
    name = models.CharField(max_length=100, blank=True, null=True)
    value = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    type = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        db_table = 'waterproof_fastflood_json_params'