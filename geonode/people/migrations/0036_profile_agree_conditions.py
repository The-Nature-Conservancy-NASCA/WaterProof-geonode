# Generated by Django 2.2.16 on 2020-11-25 20:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('people', '0035_profile_professional_role'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='agree_conditions',
            field=models.BooleanField(default=False, verbose_name='Agree Conditions'),
        ),
    ]
