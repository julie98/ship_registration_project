# Generated by Django 3.1.3 on 2020-12-07 00:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('shipping_backend', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='registration',
            name='root_url',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
    ]
