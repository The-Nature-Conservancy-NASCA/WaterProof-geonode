# Generated by Django 2.2.16 on 2020-12-07 21:09

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('waterproof_nbs_ca', '0016_auto_20201204_2135'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='riostransition',
            name='area',
        ),
    ]