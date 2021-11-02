from datetime import datetime, date, timedelta
from copy import deepcopy
import json
import requests
import traceback
import xlwt

from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django import core
from django.forms.models import model_to_dict
from django.urls import reverse
from django.http import HttpResponse
from django.shortcuts import render
from django.db import transaction, IntegrityError
from django.db.models import Q, Sum
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ObjectDoesNotExist
from django.conf import settings

from phone_field.phone_number import PhoneNumber
from rest_registration.decorators import (
    api_view_serializer_class,
    api_view_serializer_class_getter
)
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.authentication import JWTAuthentication

from rest_registration import signals
from rest_registration.settings import registration_settings
from rest_registration.api.serializers import DefaultRegisterUserSerializer
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from drf_extra_fields.fields import Base64ImageField

from .json_helpers import *
from .models import StudentDetails, Template, Attendance


def catchall(request):
    context = {}
    return render(request, 'index.html', context)


def write_row(row_list, sheet, row=0, start_col=0):
    font_style = xlwt.XFStyle()
    for column, heading in enumerate(row_list, start_col):
        sheet.write(row, column, heading, font_style)


def student_report(request):
    request_data = request.GET.copy()
    grade = request_data.get('class')
    response = HttpResponse(content_type='application/ms-excel')
    response['Content-Disposition'] = 'attachment; filename="students.xls"'
    wb = xlwt.Workbook(encoding='utf-8')
    ws = wb.add_sheet("sheet1")
    row_num = 0
    font_style = xlwt.XFStyle()
    font_style.font.bold = True
    columns = StudentDetails.get_all_fields()
    for col_num in range(len(columns)):
        ws.write(row_num, col_num, columns[col_num], font_style)
    font_style = xlwt.XFStyle()

    if grade:
        all_students = StudentDetails.objects.filter(
            current_islamic_grade=grade).values_list()
    else:
        all_students = StudentDetails.objects.all().values_list()
    for student in all_students:
        row_num = row_num + 1
        for index, value in enumerate(student):
            ws.write(row_num, index, str(value), font_style)
    wb.save(response)
    return response


def attendance_report(request, grade):
    today = date.today()
    sundays, sundays_str = get_all_sundays(today)
    students = StudentDetails.objects.filter(current_islamic_grade=grade)
    response = HttpResponse(content_type='application/ms-excel')
    response[
        'Content-Disposition'] = 'attachment; filename="attendance_for_grade_{}.xls"'.format(
        grade)
    wb = xlwt.Workbook(encoding='utf-8')
    ws = wb.add_sheet("sheet1")
    row_num = 0
    font_style = xlwt.XFStyle()
    font_style.font.bold = True
    columns = ["S.No", "Grade", "First Name", "Last Name"]
    columns.extend(sundays_str)
    for col_num in range(len(columns)):
        ws.write(row_num, col_num, columns[col_num], font_style)
    font_style = xlwt.XFStyle()

    for index, student in enumerate(students):
        row_num = row_num + 1
        row = [index + 1, grade, student.first_name, student.last_name]
        for dt in sundays:
            try:
                attendance = student.attendances.filter(date=dt)
                attendance = attendance[0]
                if attendance.is_present:
                    row.append('Present')
                else:
                    row.append('Absent')
            except IndexError:  # no record found
                row.append('Absent')

        write_row(row, ws, row_num)
        # ws.write(row_num, index, str(value), font_style)
    wb.save(response)
    return response


# Create your views here.
class RegisterSerializer(DefaultRegisterUserSerializer):

    username = serializers.EmailField(required=True)
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)

    @property
    def has_password_confirm(self):
        return False

    def create(self, validated_data):
        data = validated_data.copy()
        data['email'] = data['username']
        return self.Meta.model.objects.create_user(**data)


@api_view_serializer_class_getter(
    lambda: registration_settings.REGISTER_SERIALIZER_CLASS)
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    '''
    Register new user.
    '''
    serializer_class = RegisterSerializer
    serializer = serializer_class(
        data=request.data,
        context={'request': request},
    )
    serializer.is_valid(raise_exception=True)

    with transaction.atomic():
        try:
            user = serializer.save()
        except IntegrityError:
            return JsonResponseNotAcceptable("User already exists")
    signals.user_registered.send(sender=None, user=user, request=request)
    output_serializer_class = registration_settings.REGISTER_OUTPUT_SERIALIZER_CLASS
    output_serializer = output_serializer_class(
        instance=user,
        context={'request': request},
    )
    user_data = output_serializer.data
    return Response(user_data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def resetpassword_request(request):
    UserModel = get_user_model()
    try:
        user = UserModel._default_manager.get(username=request.data["email"])
    except UserModel.DoesNotExist:
        return JsonResponseNotFound('the user not found')
    else:
        uid = urlsafe_base64_encode(force_bytes(user.email))
        token = default_token_generator.make_token(user)

        reset_link = request.scheme + '://' + \
            'www.atalki.com/reset-password/{}/{}/' .format(uid, token)
        try:
            send_password_reset_mailer(user.email, reset_link)
        except:
            return JsonError("Error while sending mailer", 500)
        return JsonResponse(
            {'message': 'password reset mailer sent successfully',
             'reset_link': reset_link})


@api_view(['POST'])
def resetpassword(request, uid64, token):
    UserModel = get_user_model()
    try:
        decoded_email = urlsafe_base64_decode(uid64).decode("utf-8")
        user = UserModel._default_manager.get(email=decoded_email)
    except (TypeError, ValueError, OverflowError, UserModel.DoesNotExist):
        user = None
        return JsonResponseNotFound('the user not found')
    if user and default_token_generator.check_token(user, token):
        new_password = request.data['new_password']
        user.set_password(new_password)
        user.save()
        return JsonResponse({'message': 'password resetted successfully'})

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):
        data = super().validate(attrs)
        data['email'] = self.user.email
        return data


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class StudentDetailSerializer(serializers.ModelSerializer):
    profile_photo = Base64ImageField(required=False)
    islamic_studies_grade_prev_year = serializers.IntegerField(required=False)
    iqra_grade_prev_year = serializers.IntegerField(required=False)
    enrolment_for_year = serializers.IntegerField(required=False)
    grade_in_school = serializers.IntegerField(required=False)
    referee_name = serializers.CharField(required=False, allow_blank=True)
    referee_email_address = serializers.CharField(
        required=False, allow_blank=True)
    referee_phone_number = serializers.CharField(
        required=False, allow_blank=True)
    ambulance_membership_number = serializers.CharField(
        required=False, allow_blank=True)
    mother_contact_number = serializers.CharField(
        required=False, allow_blank=True)
    mother_email = serializers.CharField(required=False, allow_blank=True)
    mother_name = serializers.CharField(required=False, allow_blank=True)
    father_email = serializers.CharField(required=False, allow_blank=True)
    father_name = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        FIELD_REQUIRED = "This field is required"
        errors = {}
        if not data['is_previous_student']:
            if not data['referee_name']:
                errors['referee_name'] = FIELD_REQUIRED
            if not data['referee_email_address']:
                errors['referee_email_address'] = FIELD_REQUIRED
            if not data['referee_phone_number']:
                errors['referee_phone_number'] = FIELD_REQUIRED
        if data['ambulance_cover']:
            if not data['ambulance_membership_number']:
                errors['ambulance_membership_number'] = FIELD_REQUIRED
        if errors:
            raise serializers.ValidationError(errors)
        return data

    def create(self):
        # student_id = StudentDetails.generate_student_id()
        # self.validated_data['student_id'] = student_id
        return StudentDetails(**self.validated_data)

    class Meta:
        model = StudentDetails
        fields = '__all__'


class StudentDetailGETSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentDetails
        fields = '__all__'


class TemplateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Template
        fields = '__all__'


def fetch_prev_record(student_obj):
    """fetch previous record of student"""
    try:
        return StudentDetails.objects.get(
            first_name=student_obj.first_name,
            last_name=student_obj.last_name,
            dob=student_obj.dob,
            active=True)
    except ObjectDoesNotExist:
        return False


@csrf_exempt
@api_view(['POST'])
def createstudentpage(request):
    """
    Tim's new logic:
    - enrollment_for_year could be between 2021 and 2031

    - if not is_previous_student:
        iqra_grade_prev_year, islamic_studies_grade_prev_year and curr_iqra_grade should be blank

    - if is_previous_student and previous_year_record found:
        -- grade_in_school should be islamic_studies_grade_prev_year + 1
        -- deactivate the previous_year_record.

    - logic to find previous_year_record:
    firstname + lastname + dob should match.
    """
    serializer_class = StudentDetailSerializer
    serializer = serializer_class(
        data=request.data,
        context={'request': request},
    )
    serializer.is_valid(raise_exception=True)
    with transaction.atomic():
        try:
            student = serializer.create()
            if student.has_previous_entry:
                student.deactivate_previous_records()
            if student.is_previous_student:
                student.grade_in_school = student.islamic_studies_grade_prev_year + 1
            else:
                student.iqra_grade_prev_year = None
                student.islamic_studies_grade_prev_year = None
                student.curr_iqra_grade = None
            student.status = 'pending'
            student.save()
            student.activate()
        except:
            print(traceback.format_exc())
            return JsonResponseBadRequest('unexpected error occured. please try again')
    return JsonResponse({'message': 'student details saved successfully', 'id': student.student_id})


@api_view(['GET'])
def getstudentpage(request, doc_id):
    """
    in getstudents only return current year details exclude previous year details
    islamic_studies_grade_prev_year
    iqra_grade_prev_year
    return current iqra grade
    """
    try:
        doc = StudentDetails.objects.get(student_id=doc_id)
        if not doc.referee_phone_number:
            doc.referee_phone_number = ""
        if not doc.father_contact_number:
            doc.father_contact_number = ""
        if not doc.iqra_grade_prev_year:
            doc.iqra_grade_prev_year = 0
        if not doc.islamic_studies_grade_prev_year:
            doc.islamic_studies_grade_prev_year = 0
        if not doc.curr_iqra_grade:
            doc.curr_iqra_grade = 0
        serializer = StudentDetailGETSerializer(doc)
    except ObjectDoesNotExist:
        return JsonResponseNotFound('the document with id {} not found'.format(doc_id))
    return Response(serializer.data, status=status.HTTP_200_OK)


@token_required
@api_view(['POST'])
def approve_student(request, doc_id):
    try:
        student = StudentDetails.objects.get(student_id=doc_id)
        student.approve()
    except ObjectDoesNotExist:
        return JsonResponseNotFound('the document with id {} not found'.format(doc_id))
    return JsonResponse({'message': 'student approved successfully'})


@token_required
@api_view(['POST'])
def reject_student(request, doc_id):
    try:
        student = StudentDetails.objects.get(student_id=doc_id)
        student.reject()
    except ObjectDoesNotExist:
        return JsonResponseNotFound('the document with id {} not found'.format(doc_id))
    return JsonResponse({'message': 'student rejected successfully'})


@token_required
@api_view(['POST'])
def create_template(request):
    serializer_class = TemplateSerializer
    serializer = serializer_class(
        data=request.data,
        context={'request': request},
    )
    serializer.is_valid(raise_exception=True)
    with transaction.atomic():
        try:
            template = serializer.save()
        except:
            print(traceback.format_exc())
            return JsonResponseBadRequest('unexpected error occured. please try again')
    return JsonResponse(
        {'message': 'Template with id %s created successfully' % template.template_id})


@token_required
@api_view(['POST'])
def postattendance(request):
    errors = {}
    request_data = request.data.copy()
    if not request_data:
        errors['general'] = "Please send data"
    if request_data and not request_data.get('date'):
        errors['date'] = "This field is required"
    if request_data and request_data.get('grade') not in range(0, 13):
        errors['grade'] = "This field is required"
    if request_data and not request_data.get('students'):
        errors['students'] = "This fiend is required"

    attendance_date = datetime.strptime(
        request_data.get('date'), '%d-%m-%Y')
    grade = request_data.get('grade')
    students = request_data['students']
    for student in students:
        try:
            Attendance.objects.create(
                date=attendance_date,
                student_name=student['name'],
                student_id=student['id'],
                grade=grade,
                is_present=student['is_present']
            )
        except Exception as ex:
            errors['general'] = str(ex)

    if errors:
        raise serializers.ValidationError(errors)
    return JsonResponse(
        {'message': 'Attendance record created successfully'})


# student/searchforattendance/?grade=1&date=16-05-2021
@token_required
@api_view(['GET'])
def searchforattendance(request):
    try:
        request_data = request.GET.copy()
        dt = request_data['date']
        attendance_date = datetime.strptime(dt, "%d-%m-%Y")
        request_data['date'] = attendance_date
        response_dict = {
            'grade': int(request_data['grade']),
            'date': dt,
            'attendanceSubmitted': False,
            'students': []}
        current_year = date.today().year
        students = StudentDetails.objects.filter(
            grade_in_school=int(request_data['grade']),
            status='active',
            enrolment_for_year=current_year)

        submitted = False
        for student in students:
            name = student.first_name + ' ' + student.last_name
            a_dict = {'id': student.student_id,
                      'name': name,
                      'is_present': False,
                      'mobile': student.get_preferred_mobile()
                      }
            try:
                attendance = student.attendances.get(date=attendance_date)
                a_dict['is_present'] = attendance.is_present
                if not submitted:
                    submitted = True
            except ObjectDoesNotExist:
                pass

            response_dict['students'].append(a_dict)
        response_dict['attendanceSubmitted'] = submitted
        if response_dict['students']:
            return JsonResponse(response_dict)
        else:
            return JsonResponse(
                "No details found for date {dt} and grade {grade}".format(
                    grade=response_dict['grade'], dt=dt))
    except Exception as ex:
        raise serializers.ValidationError({"error": str(ex)})


@token_required
@api_view(['POST'])
def update_template(request, template_id):
    try:
        request_data = request.data.copy()
        template = Template.objects.get(template_id=template_id)
        if request_data.get('template_name'):
            template.template_name = request_data.get('template_name')
        if request_data.get('template_subject'):
            template.template_subject = request_data.get('template_subject')
        if request_data.get('template_body'):
            template.template_body = request_data.get('template_body')
        template.save()
    except ObjectDoesNotExist:
        return JsonResponseNotFound(
            'the template with id {} not found'.format(template_id))
    return JsonResponse({'message': 'Template updated successfully'})


@token_required
@api_view(['GET'])
def get_template(request, template_id):
    try:
        doc = Template.objects.get(template_id=template_id)
        serializer = TemplateSerializer(doc)
    except ObjectDoesNotExist:
        return JsonResponseNotFound(
            'the template with id {} not found'.format(template_id))
    return Response(serializer.data, status=status.HTTP_200_OK)


@token_required
@api_view(['GET'])
def get_all_template(request):
    try:
        doc = Template.objects.all()
        serializer = TemplateSerializer(doc, many=True)
    except ObjectDoesNotExist:
        return JsonResponseNotFound('the templates table is empty')
    return Response(serializer.data, status=status.HTTP_200_OK)


@token_required
@api_view(['GET'])
def get_all_student(request):
    try:
        doc = StudentDetails.objects.all()
        serializer = StudentDetailSerializer(doc, many=True)
    except ObjectDoesNotExist:
        return JsonResponseNotFound('students table is empty')
    return Response(serializer.data, status=status.HTTP_200_OK)


@token_required
@api_view(['POST'])
def delete_template(request, template_id):
    try:
        template = Template.objects.get(template_id=template_id)
        template.delete()
    except ObjectDoesNotExist:
        return JsonResponseNotFound(
            'the template with id {} not found'.format(template_id))
    return JsonResponse({'message': 'Template deleted successfully'})


@token_required
@api_view(['GET'])
def search(request):
    """
        1. Scan the whole student table with Grade = 1 for the column curr_iqra_grade.
        Lets presume you get 2 students. 2. Scan again the whole student table
        with Grade = 1 for the column grade_in_school. Lets presume you get 3 students.
        Add these 2 student groups . You get 5 students. Send this to front end.
    """
    request_data = request.GET.copy()
    student_list = StudentDetails.objects.filter(active=True)
    student_fname = student_lname = student_email = student_grade = StudentDetails.objects.none()
    if request_data.get('first_name'):
        student_fname = student_list.filter(
            first_name__contains=request_data.get('first_name'))
    if request_data.get('last_name'):
        student_lname = student_list.filter(
            last_name__contains=request_data.get('last_name'))
    if request_data.get('email_for_correspondence'):
        student_email = student_list.filter(
            email_for_correspondence__contains=request_data.get('email_for_correspondence'))
    if request_data.get('grade'):
        student_grade = student_list.filter(
            Q(curr_iqra_grade__contains=request_data.get('grade')) |
            Q(current_islamic_grade__contains=request_data.get('grade')) |
            Q(grade_in_school__contains=request_data.get('grade')))
    filtered_student_list = student_fname | student_lname | student_email | student_grade
    post_list = core.serializers.serialize('json', filtered_student_list)
    return JsonResponse(json.loads(post_list))


@token_required
@api_view(['POST'])
def search_for_email(request):
    student_list = StudentDetails.objects.filter(active=True)
    if request.data.get('grade'):
        student_list = student_list.filter(
            current_islamic_grade=request.data.get('grade'))
    student_name = request.data.get('name')
    name_split = student_name.split()
    if len(name_split) > 1:
        first_name = name_split[0]
        last_name = name_split[-1]
        student_list = student_list.filter(
            Q(first_name__icontains=first_name) | Q(
                last_name__icontains=last_name))
    else:
        student_list = student_list.filter(
            Q(first_name__icontains=student_name) | Q(
                last_name__icontains=student_name))
    emails = [student.email_for_correspondence for student in student_list]
    return JsonResponse(emails)


@token_required
@api_view(['POST'])
def update_student(request, doc_id):
    try:
        request_data = request.data.copy()
        foto = request_data.get('profile_photo')
        if type(foto) == str and 'attachments/' in foto:
            request_data.pop('profile_photo')
        student = StudentDetails.objects.get(student_id=doc_id)
        serializer = StudentDetailSerializer(
            student, data=request_data, partial=True)
        serializer.is_valid()
        serializer.save()
    except ObjectDoesNotExist:
        return JsonResponseNotFound(
            'the student with id {} not found'.format(doc_id))
    return JsonResponse({'message': 'Student updated successfully'})


@api_view(['POST'])
def payment(request):
    data = request.data.copy()
    if len(data.keys()) == 1:
        format_data = settings.PAYMENT_RQ_TEMPLATE
        format_data['Payment']['TotalAmount'] = data.get('TotalAmount')
        data = format_data
    resp = requests.post(settings.PAYMENT_URL,
                         json=data, auth=(
                             settings.AKEY, settings.APASS))
    return JsonResponse(resp.json())


@api_view(['POST'])
def validate_token(request):
    request_data = request.data.copy()
    auth_token = request_data.get('token')
    try:
        request_user = User.objects.get(username=request_data['username'])
    except ObjectDoesNotExist:
        return JsonResponse(False)
    request.META['HTTP_AUTHORIZATION'] = 'Bearer %s' % request_data['token']
    if not auth_token:
        return JsonResponseBadRequest("Please provide token to validate")
    try:
        jwt_auth = JWTAuthentication()
        user, token = jwt_auth.authenticate(request)
        if request_user != user:
            return JsonResponse(False)
    except:
        return JsonResponse(False)
    if not (user and token):
        return JsonResponse(False)
    if user and token:
        return JsonResponse(True)
