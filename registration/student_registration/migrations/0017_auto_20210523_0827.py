# Generated by Django 3.1.7 on 2021-05-23 08:27

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('student_registration', '0016_auto_20210523_0706'),
    ]

    operations = [
        migrations.RenameField(
            model_name='attendance',
            old_name='date_of_class',
            new_name='date',
        ),
    ]
