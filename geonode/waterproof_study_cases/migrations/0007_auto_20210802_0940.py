# Generated by Django 2.2.16 on 2021-08-02 14:40

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('waterproof_intake', '0003_auto_20210802_0940'),
        ('waterproof_parameters', '0008_merge_20210512_1117'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('waterproof_study_cases', '0006_auto_20210707_0230'),
    ]

    operations = [
        # migrations.AddField(
        #     model_name='studycases',
        #     name='cost_functions',
        #     field=models.TextField(blank=True, null=True, verbose_name='Cost_function'),
        # ),
        # migrations.AlterField(
        #     model_name='studycases_currency',
        #     name='value',
        #     field=models.DecimalField(blank=True, decimal_places=15, max_digits=20, null=True),
        # ),
        # migrations.CreateModel(
        #     name='CostFunctions',
        #     fields=[
        #         ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
        #         ('name', models.TextField(blank=True, null=True, verbose_name='Name')),
        #         ('description', models.TextField(blank=True, null=True, verbose_name='Description')),
        #         ('function', models.TextField(blank=True, null=True, verbose_name='Function')),
        #         ('csinfra_graph_id', models.IntegerField(default=-1, verbose_name='CSInfra_graph_Id')),
        #         ('factor', models.FloatField(blank=True, default=1.0, null=True, verbose_name='Factor')),
        #         ('created_at', models.DateTimeField(auto_now_add=True)),
        #         ('updated_at', models.DateTimeField(auto_now=True)),
        #         ('currency', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='waterproof_parameters.Countries')),
        #         ('element_system', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='waterproof_intake.ElementSystem')),
        #         ('studycase', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='waterproof_study_cases.StudyCases')),
        #         ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
        #     ],
        # ),
    ]
