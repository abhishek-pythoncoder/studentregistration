# Generated by Django 3.1.7 on 2021-05-22 15:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('student_registration', '0011_studentdetails_updated_on'),
    ]

    operations = [
        migrations.AlterField(
            model_name='studentdetails',
            name='active_record',
            field=models.BooleanField(default=True),
        ),
    ]
