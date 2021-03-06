# Generated by Django 2.2.16 on 2021-04-03 22:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('people', '0031_merge_20210205_0824'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='profile',
            name='delivery',
        ),
        migrations.RemoveField(
            model_name='profile',
            name='fax',
        ),
        migrations.RemoveField(
            model_name='profile',
            name='position',
        ),
        migrations.RemoveField(
            model_name='profile',
            name='voice',
        ),
        migrations.RemoveField(
            model_name='profile',
            name='zipcode',
        ),
        migrations.AddField(
            model_name='profile',
            name='agree_conditions',
            field=models.BooleanField(default=False, verbose_name='Agree Conditions'),
        ),
        migrations.AddField(
            model_name='profile',
            name='other_analysis',
            field=models.CharField(blank=True, help_text='Other Analysis', max_length=50, null=True, verbose_name='Other Analysis'),
        ),
        migrations.AddField(
            model_name='profile',
            name='other_role',
            field=models.CharField(blank=True, help_text='Other Role', max_length=50, null=True, verbose_name='OtherRole'),
        ),
        migrations.AddField(
            model_name='profile',
            name='professional_role',
            field=models.CharField(blank=True, choices=[('ADMIN', 'Administrator'), ('ANALYS', 'Analyst'), ('COPART', 'Corporate partner'), ('ACDMC', 'Academic'), ('SCADM', 'Service company administrator'), ('MCOMC', 'Manager that carries out monitoring and control'), ('CITIZN', 'Citizen'), ('REPECS', 'Representative of an economic sector'), ('OTHER', 'Other')], help_text='Professional or Academic user role', max_length=6, null=True, verbose_name='ProfessionalRole'),
        ),
        migrations.AddField(
            model_name='profile',
            name='use_analysis',
            field=models.CharField(blank=True, choices=[('ACDMC', 'Academic'), ('GNRL', 'General'), ('BSNSS', 'Business'), ('OTHER', 'Other')], help_text='Use Analysis', max_length=8, null=True, verbose_name='Use Analysis'),
        ),
    ]
