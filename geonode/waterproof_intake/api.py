from django.http import HttpResponse
from django.http.response import JsonResponse
from rest_framework.decorators import api_view
from django.conf import settings
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
import requests
import json
import re
from pytexit import py2tex


@api_view(['GET'])
def validatePyExpression(request):
    """Validate Python Expression

    """
    if request.method == 'GET':
        exp = request.GET['expression']
        is_valid = validateAndExecuteExpression(exp)
        latex = py2tex(exp)
		return JsonResponse(latex, safe=False)

def validateAndExecuteExpression(expression):
    """ 1. Extract variables from expression """
    """ 2. Create generic function with n args """

    # exp_to_function = "def generic_function"
    args = re.findall(r'[a-zA-Z_]\w*', expression)
    args = remove_no_vars(args)
    global_vars = dict()
    for v in args:
        global_vars[v] = 1
    x = eval(expression,global_vars)
    is_valid = True
    try:
        print ('Valid Expression: %s' % x)        
    except:
        print ('No a valid Expression')
        is_valid = False
    return is_valid

""" Remove special functions o math expressions"""
""" (i.e: min: E2, E3) """
def remove_no_vars(vars):

	special_values = ['min', 'E2', 'E3']
	if (settings.WATERPROOF_SPECIAL_VALUES):
		special_values = settings.WATERPROOF_SPECIAL_VALUES
	for v in special_values:
		while v in vars:
			vars.remove(v)    
	return vars