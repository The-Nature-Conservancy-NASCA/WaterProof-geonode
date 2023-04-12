# Generated by Django 2.2.16 on 2020-12-09 22:55

import ckeditor.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('frequently', '0003_auto_20181220_0941'),
    ]

    operations = [
        migrations.AddField(
            model_name='entry',
            name='answer_es',
            field=ckeditor.fields.RichTextField(blank=True, verbose_name='Answer Spanish'),
        ),
        migrations.AddField(
            model_name='entry',
            name='question_es',
            field=models.CharField(blank=True, help_text='Question Spanish', max_length=100, null=True, verbose_name='Question Spanish'),
        ),
        migrations.AddField(
            model_name='entrycategory',
            name='name_es',
            field=models.CharField(blank=True, help_text='Nombre in spanish', max_length=100, null=True, verbose_name='Name in spanish'),
        ),
    ]
