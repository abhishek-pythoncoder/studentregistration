# Generated by Django 3.1.7 on 2021-05-29 14:57

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('student_registration', '0020_auto_20210529_1450'),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name='studentdetails',
            name='student_unique',
        ),
    ]