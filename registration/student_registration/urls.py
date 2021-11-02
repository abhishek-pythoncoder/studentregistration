from django.contrib import admin
from django.urls import path
from django.conf.urls.static import static
from django.conf import settings
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

from student_registration.json_helpers import token_required
from student_registration.views import *
from student_registration.models import StudentDetails

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView
)

from .views import *

urlpatterns = [
    path('register/', register),
    path('token/generate/', MyTokenObtainPairView.as_view(),
         name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('student/validatetoken/', validate_token, name='validate_token'),
    path('student/create/', token_required(createstudentpage), name='student_create'),
    path('student/create_noauth/', createstudentpage,
         name='student_create_noauth'),
    path('student/get/', get_all_student, name='get_all_student'),
    path('student/get/<str:doc_id>/', token_required(getstudentpage),
         name='student_get'),
    path('student/get_noauth/<str:doc_id>/', getstudentpage,
         name='student_get'),
    path('student/approve/<str:doc_id>/', approve_student, name='student_get'),
    path('student/reject/<str:doc_id>/', reject_student, name='student_get'),
    path('student/template/create/', create_template, name='create_template'),
    path('student/template/update/<str:template_id>/',
         update_template, name='update_template'),
    path('student/template/get/<str:template_id>/',
         get_template, name='get_template'),
    path('student/template/get/',
         get_all_template, name='get_all_template'),
    path('student/template/delete/<str:template_id>/',
         delete_template, name='delete_template'),
    path('student/search/', search, name='search_students'),
    path('student/update/<str:doc_id>/', update_student, name='update_student'),
    path('student/postattendance/', postattendance, name='postattendance'),
    path('student/searchforattendance/',
         searchforattendance, name='searchforattendance'),
    path('student/download/report/', student_report, name='student_report'),
    path('student/download/attendance/<int:grade>/',
         attendance_report, name='attendance_report'),
    path('student/search_for_email/', search_for_email, name='search_for_email'),
    path('student/payment/', token_required(payment), name='payment'),
    path('student/payment_noauth/', payment, name='payment_noauth')

]
