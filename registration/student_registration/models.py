from datetime import date
from django.db import models
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.db.models import (CASCADE, CharField, DateTimeField, FileField,
                              ForeignKey, Model, BooleanField,
                              OneToOneField, ImageField,
                              BinaryField, DateField, IntegerField, TextField,
                              EmailField, AutoField)
from phone_field import PhoneField

# Create your models here.


def generate_student_id():
    details = StudentDetails.objects.order_by('-student_id')
    current_year = date.today().strftime('%y')
    if not details:
        return settings.STUDENT_ID_FORMAT.format(xxxx=f"{1:04}",
                                                 yy=current_year)
    else:
        latest_record = details[0]
        latest_id = latest_record.student_id
        inc = int(latest_id[1:5]) + 1
        inc_zfill = f'{inc:04}'
        return settings.STUDENT_ID_FORMAT.format(xxxx=inc_zfill,
                                                 yy=current_year)


class StudentDetails(Model):
    """Student model"""
    GENDER = (
        (None, 'Choose your gender'),
        ('male', 'male'),
        ('female', 'female'),
        ('Prefer Not To Say', 'Prefer Not To Say'),
    )

    STATUS = (
        (None, 'Choose status'),
        ('pending', 'pending'),
        ('approved', 'approved'),
        ('rejected', 'rejected'),
    )

    ENROLLMENT_YEAR = (
        (None, 'Choose Year'),
        (2021, 2021),
        (2022, 2022),
        (2023, 2023),
        (2024, 2024),
        (2025, 2025),
        (2026, 2026),
        (2027, 2027),
        (2028, 2028),
        (2029, 2029),
        (2030, 2030),
        (2031, 2031),
    )
    student_id = CharField(primary_key=True,
                           default=generate_student_id,
                           editable=False,
                           max_length=50)
    first_name = CharField(
        max_length=50, help_text="First Name", verbose_name="First Name")
    last_name = CharField(
        max_length=50, help_text="Last Name", verbose_name="Last Name")
    profile_photo = ImageField(
        upload_to='attachments/',
        storage=FileSystemStorage(
            location=settings.MEDIA_ROOT, base_url=settings.MEDIA_URL),
        null=True)
    gender = CharField(max_length=30, choices=GENDER, default=None)
    medical_condition = CharField(
        max_length=300, verbose_name="Medical Conditions")
    dob = DateField(verbose_name="Date of Birth")
    is_previous_student = BooleanField(default=False)
    islamic_studies_grade_prev_year = IntegerField(
        null=True, blank=True, default=None)
    current_islamic_grade = IntegerField(
        null=True, blank=True, default=None)
    iqra_grade_prev_year = IntegerField(null=True, blank=True, default=None)
    enrolment_for_year = IntegerField(choices=ENROLLMENT_YEAR, null=True)
    grade_in_school = IntegerField(null=True)
    curr_iqra_grade = IntegerField(null=True)
    referee_name = CharField(
        max_length=50, help_text="Referee Name",
        verbose_name="Referee Name", blank=True, null=True)
    referee_email_address = EmailField(max_length=250, blank=True, null=True)
    referee_phone_number = PhoneField(
        help_text="Referee Mobile Number", null=True, blank=True)
    father_name = CharField(
        max_length=100,
        blank=True,
        help_text="Father Name",
        verbose_name="Father Name")
    mother_name = CharField(
        max_length=100, help_text="Mother Name",
        verbose_name="Mother Name", blank=True)
    father_email = EmailField(max_length=250, blank=True)
    mother_email = EmailField(max_length=250, blank=True)
    father_contact_number = PhoneField(
        help_text="Father Mobile Number", blank=True)
    mother_contact_number = PhoneField(help_text="Mother Mobile Number",
                                       blank=True)
    ambulance_cover = BooleanField(default=False)
    ambulance_membership_number = CharField(
        max_length=100, null=True, blank=True)
    home_address = CharField(
        max_length=250, help_text="Home Address", verbose_name="Home Address")
    preferred_contact_for_correspondence = CharField(max_length=150)
    email_for_correspondence = EmailField(max_length=250, verbose_name='Email')
    fees_paid = BooleanField(default=False)
    status = CharField(choices=STATUS, max_length=100)
    active = BooleanField(default=True)
    updated_on = DateTimeField(auto_now_add=True)
    paid_amount = IntegerField(null=True)
    date_of_payment = DateField(verbose_name="Date of payment", null=True)

    def get_preferred_mobile(self):
        try:
            if self.preferred_contact_for_correspondence.lower() == 'father':
                return self.father_contact_number.raw_phone
            return self.mother_contact_number.raw_phone
        except:
            return None

    def activate(self):
        self.active = True
        self.save()

    def deactivate(self):
        self.active = False
        self.save()

    def approve(self):
        self.status = 'approved'
        self.save()

    def reject(self):
        self.status = 'rejected'
        self.save()

    def get_previous_records(self):
        return self.__class__.objects.filter(
            first_name=self.first_name,
            last_name=self.last_name,
            dob=self.dob,
            active=True)

    @property
    def has_previous_entry(self):
        """call this method only on unsaved objects"""
        entries = self.get_previous_records()
        return True if len(entries) else False

    def deactivate_previous_records(self):
        previous_entries = self.get_previous_records()
        for entry in previous_entries:
            entry.deactivate()

    @classmethod
    def get_all_fields(cls):
        exclude = ['attendances']
        return [field.name for field in cls._meta.fields if field.name not in exclude]

    class Meta:
        db_table = 'student_details'


class Template(Model):
    template_id = AutoField(primary_key=True)
    template_name = CharField(
        max_length=100, help_text="Template Name", verbose_name="Template Name")
    template_subject = CharField(
        max_length=100, help_text="Template Subject", verbose_name="Template Subject")
    template_body = TextField(
        help_text="Template Body", verbose_name="Template Body")

    class Meta:
        db_table = 'template'


class Attendance(Model):
    student = ForeignKey(
        StudentDetails,
        on_delete=CASCADE,
        related_name='%(class)ss',)
    student_name = CharField(
        max_length=100, help_text="Student Name", verbose_name="Student Name")
    date = DateField(verbose_name="Date of class")
    is_present = BooleanField(default=False)
    grade = IntegerField(null=True)

    class Meta:
        db_table = 'attendance'
        constraints = [
            models.UniqueConstraint(fields=['student', 'date'],
                                    name='name of constraint')
        ]
