# Generated by Django 5.1.1 on 2024-09-30 13:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('todo', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='todo',
            name='is_completed',
            field=models.BooleanField(),
        ),
    ]
