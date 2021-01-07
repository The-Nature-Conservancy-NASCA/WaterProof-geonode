# Generated by Django 2.2.16 on 2020-12-22 12:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('people', '0036_profile_agree_conditions'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='professional_role',
            field=models.CharField(blank=True, choices=[('ADMIN', 'Administrator'), ('ANAL', 'Analyst'), ('COPART', 'Corporate partner'), ('ACDMC', 'Academic'), ('SCADM', 'Service company administrator'), ('MCOMC', 'Manager that carries out monitoring and control'), ('CITIZN', 'Citizen'), ('REPECS', 'Representative of an economic sector'), ('OTHER', 'Other')], help_text='Professional or Academic user role', max_length=6, null=True, verbose_name='ProfessionalRole'),
        ),
    ]