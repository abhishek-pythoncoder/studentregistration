"""JSON helper functions"""
import os
import calendar
from datetime import date
import json
import traceback
from functools import wraps
from django.views.decorators.csrf import csrf_exempt
from django.core.serializers.json import DjangoJSONEncoder
from django.http import HttpResponse
from rest_framework_simplejwt.authentication import JWTAuthentication


def get_all_sundays(to_date):
    """Get all the sundays upto the given date"""
    sundays = []
    sundays_str = []
    year = to_date.year
    A = calendar.TextCalendar(calendar.SUNDAY)
    for month in range(1,13):
        if month > to_date.month:
            break
        for iday in A.itermonthdays(year,month):
            if iday!=0:
                day=date(year,month,iday)
                if day.weekday()==6 and day <= to_date:
                    sundays.append(day)
                    sundays_str.append(day.strftime('%d/%b'))
    return sundays, sundays_str

class ValidationError(Exception):
    pass

def JsonResponse(data, dump=True, status=200):
    try:
        data['errors']
    except KeyError:
        data['success'] = True
    except TypeError:
        pass

    return HttpResponse(
        json.dumps(data, cls=DjangoJSONEncoder) if dump else data,
        content_type='application/json',
        status=status,
    )


def JsonError(error_string, status=200):
    data = {
        'success': False,
        'errors': error_string,
    }
    return JsonResponse(data, status=status)


def JsonResponseBadRequest(error_string):
    return JsonError(error_string, status=400)


def JsonResponseUnauthorized(error_string):
    return JsonError(error_string, status=401)


def JsonResponseForbidden(error_string):
    return JsonError(error_string, status=403)


def JsonResponseNotFound(error_string):
    return JsonError(error_string, status=404)


def JsonResponseNotAllowed(error_string):
    return JsonError(error_string, status=405)


def JsonResponseNotAcceptable(error_string):
    return JsonError(error_string, status=406)

import base64 
  
def url_encode(string):
    string_bytes = string.encode("ascii") 
    base64_bytes = base64.b64encode(sample_string_bytes) 
    return base64_bytes.decode("ascii")

def url_decode(base64_string):
    base64_bytes = base64_string.encode("ascii") 
    sample_string_bytes = base64.b64decode(base64_bytes) 
    return sample_string_bytes.decode("ascii") 


def decode_docid(view_func):
    @csrf_exempt
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if kwargs.get('doc_id'):
            decoded_doc_id = url_decode(kwargs['doc_id'])
            kwargs['doc_id'] = int(decoded_doc_id)   
        return view_func(request, *args, **kwargs)

    return _wrapped_view

def token_required(view_func):
    """Decorator which ensures the user has provided a correct token."""

    @csrf_exempt
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        try:
            jwt_auth = JWTAuthentication()
            user, token = jwt_auth.authenticate(request)
        except:
            return JsonResponseUnauthorized(
                "TOKEN REQUIRED")

        if not (user and token):
            return JsonResponseNotAcceptable("Token not present")

        if user and token:
            request.user = user
            request.token = token
            return view_func(request, *args, **kwargs)

        return JsonResponseForbidden("Invalid token supplied")
    return _wrapped_view

