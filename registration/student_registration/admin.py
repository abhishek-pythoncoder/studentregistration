from django.contrib import admin
from .models import StudentDetails, Template, Attendance

# Register your models here.
class StudentDetailsAdmin(admin.ModelAdmin):
	list_display = (
					'student_id',
					'first_name',
					'last_name',
					'dob',
					'gender',
					'enrolment_for_year',
					'email_for_correspondence')
	list_filter = ('active', 'status')
	search_fields = ('first_name', 'last_name', 'email_for_correspondence', 'grade_in_school')

class AttendanceAdmin(admin.ModelAdmin):
	list_display = ('date', 'student_name', 'grade', 'is_present')


admin.site.register(StudentDetails, StudentDetailsAdmin)
admin.site.register(Attendance, AttendanceAdmin)
admin.site.register(Template)
