# Generated by Django 2.2.16 on 2020-11-13 04:43

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='StudyCases',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, verbose_name='Name')),
                ('description', models.CharField(max_length=1024, verbose_name='Description')),
                ('treatment_plants', models.CharField(max_length=255, verbose_name='Treatment Plants')),
                ('water_intakes', models.CharField(max_length=255, verbose_name='Water Intakes')),
                ('with_carbon_markets', models.BooleanField(default=False, verbose_name='Carbon Markets')),
                ('erosion_control_drinking_water_qa', models.BooleanField(default=False, verbose_name='Erosion Control For Drinking Water Quality')),
                ('nutrient_retention_ph', models.BooleanField(default=False, verbose_name='Nutrient Retention - Phosphorus')),
                ('nutrient_retention_ni', models.BooleanField(default=False, verbose_name='Nutrient Retention - Nitrogen')),
                ('flood_mitigation', models.BooleanField(default=False, verbose_name='Flood Mitigation')),
                ('groundwater_recharge_enhancement', models.BooleanField(default=False, verbose_name='Groundwater Recharge Enhancement')),
                ('baseflow', models.BooleanField(default=False, verbose_name='Baseflow')),
                ('annual_water_yield', models.CharField(max_length=1024, verbose_name='Annual Water Yield')),
                ('sediment_delivery_ratio', models.CharField(max_length=1024, verbose_name='Sediment Delivery Radio')),
                ('nutrient_delivery', models.CharField(max_length=1024, verbose_name='Nutrient Delivery')),
                ('seasonal_water_yield', models.CharField(max_length=1024, verbose_name='Seasonal Water Yield')),
                ('carbon_storage', models.CharField(max_length=1024, verbose_name='Carbon Storage')),
                ('platform_cost_per_year', models.FloatField(default=0, verbose_name='Platform Cost Per Year')),
                ('personnel_salary_benefits', models.FloatField(default=0, verbose_name='Personal Salary and Benefits')),
                ('program_director', models.FloatField(default=0, verbose_name='Program Director')),
                ('monitoring_and_evaluation_mngr', models.FloatField(default=0, verbose_name='Monitoring And Evaluation Manager')),
                ('finance_and_admin', models.FloatField(default=0, verbose_name='Finance and Administrator')),
                ('implementation_manager', models.FloatField(default=0, verbose_name='Implementation Manager')),
                ('office_costs', models.FloatField(default=0, verbose_name='Office Costs')),
                ('travel', models.FloatField(default=0, verbose_name='Travel')),
                ('equipment', models.FloatField(default=0, verbose_name='Equipment')),
                ('contracts', models.FloatField(default=0, verbose_name='Contracts')),
                ('overhead', models.FloatField(default=0, verbose_name='Overhead')),
                ('others', models.FloatField(default=0, verbose_name='Others')),
                ('transaction_costs', models.FloatField(default=0, verbose_name='Transaction Cost')),
                ('discount_rate', models.FloatField(default=0, verbose_name='Discount Rate')),
                ('sensitive_analysis_min_disc_rate', models.FloatField(default=0, verbose_name='Sentivity Analysys - Min Discount Rate')),
                ('sensitive_analysis_max_disc_rate', models.FloatField(default=0, verbose_name='Sentivity Analysys - Max Discount Rate')),
                ('nbs_ca_conservation', models.BooleanField(default=False, verbose_name='Conservation')),
                ('nbs_ca_active_restoration', models.BooleanField(default=False, verbose_name='Active Restoration')),
                ('nbs_ca_passive_restoration', models.BooleanField(default=False, verbose_name='Passive Restoration')),
                ('nbs_ca_agroforestry', models.BooleanField(default=False, verbose_name='Agroforestry')),
                ('nbs_ca_silvopastoral', models.BooleanField(default=False, verbose_name='Silvopastoral')),
            ],
            options={
                'ordering': ['name', 'description'],
            },
        ),
    ]