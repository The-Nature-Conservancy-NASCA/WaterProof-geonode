# Generated by Django 2.2.16 on 2020-11-14 21:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('waterproof_nbs_ca', '0005_auto_20201114_2035'),
    ]

    operations = [
        migrations.AlterField(
            model_name='waterproofnbsca',
            name='land_cover_def',
            field=models.CharField(choices=[('Forest', 'Forest'), ('Grassland', 'Grassland'), ('Shrubland', 'Shrubland'), ('Sparse vegetation', 'Sparse vegetation')], default='', max_length=32),
        ),
    ]