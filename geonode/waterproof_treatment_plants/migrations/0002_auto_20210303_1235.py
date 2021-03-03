# Generated by Django 2.2.16 on 2021-03-03 12:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('waterproof_treatment_plants', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='element',
            options={},
        ),
        migrations.AlterModelOptions(
            name='header',
            options={},
        ),
        migrations.AlterField(
            model_name='element',
            name='element_id',
            field=models.IntegerField(auto_created=True, primary_key=True, serialize=False, verbose_name='Id Element'),
        ),
        migrations.AlterField(
            model_name='header',
            name='plant_id',
            field=models.IntegerField(auto_created=True, primary_key=True, serialize=False, verbose_name='Id Plant'),
        ),
    ]
