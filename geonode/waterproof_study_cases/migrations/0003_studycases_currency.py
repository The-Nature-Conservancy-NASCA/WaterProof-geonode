from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('waterproof_study_cases', '0002_auto_20210420_1327'),
    ]

    operations = [
        migrations.CreateModel(
            name='StudyCases_Currency',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('currency', models.CharField(blank=True, max_length=4, null=True)),
                ('description', models.CharField(max_length=500)),
                ('value', models.DecimalField(blank=True, decimal_places=3, max_digits=20, null=True)),
                ('studycase', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='waterproof_study_cases.StudyCases')),
            ],
        ),
    ]
