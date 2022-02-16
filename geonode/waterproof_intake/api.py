from django.http import HttpResponse
from django.http.response import JsonResponse
from rest_framework.decorators import api_view
from django.conf import settings
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from django.db import connection
import requests
import json
import re
import math
from pytexit import py2tex


@api_view(['GET'])
def validatePyExpression(request):
    """Validate Python Expression

    """
    if request.method == 'GET':
        exp = request.GET['expression']
        is_valid = validateAndExecuteExpression(exp)
        latex = python2latex(exp)
        result = dict()
        result['valid'] = is_valid
        result['latex'] = latex
        return JsonResponse(result, safe=False)

def validateAndExecuteExpression(expression):
    """ 1. Extract variables from expression """
    """ 2. Create generic function with n args """

    # exp_to_function = "def generic_function"
    args = re.findall(r'[a-zA-Z_]\w*', expression)
    ALLOWED_NAMES = {
        k: v for k, v in math.__dict__.items() if not k.startswith("__")
    }
    args = remove_no_vars(args)
    global_vars = dict()
    for v in args:
        global_vars[v] = 1
    
    is_valid = True
    try:
        #x = eval(expression,global_vars)
        code = compile(expression, "<string>", "eval")
        x = eval(code,global_vars,ALLOWED_NAMES)
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


def python2latex(exp):

    ltx = ''
    ELSE = ' else '
    IF = ' if '
    try:
        if ELSE in exp:
            cond_exps = []
            conditional_exp = exp.split(ELSE)
            for cond in conditional_exp:
                sub_exp = cond.split(IF)
                if (len(sub_exp) == 2):
                    cond_exps.append(py2tex(sub_exp[1]) + " , " + py2tex(sub_exp[0]))
                    ltx += "$$" + py2tex(sub_exp[1]).replace("$$","") + " , " + py2tex(sub_exp[0]).replace("$$","") + "$$ "
                else:
                    cond_exps.append(" , " + py2tex(sub_exp[0]))
                    ltx += "$$ \\textit{Another Case}, " + py2tex(sub_exp[0]).replace("$$","") + "$$ "
            # print (cond_exps)
        else:
            ltx = py2tex(exp)
    except:
        print ("error processing expression: %s" % exp)
    
    #ltx = ltx.replace("$$","")
    print (ltx)
    return ltx

@api_view(['GET'])
def intakeUsedByPlantsAndStudyCases(request):
    
    cursor = connection.cursor()
    try:
        id_intake = int(request.GET['id'])
        sql = "select count(*) from public.waterproof_treatment_plants_csinfra c " + \
            "join public.waterproof_intake_elementsystem e on " + \
            "e.id = c.csinfra_elementsystem_id and e.intake_id = %s" % id_intake
        cursor.execute(sql)
        row = cursor.fetchone()    
        count = row[0]
        # cursor.close()
        if (count == 0):
            print ("No plants searching in study cases ...")
            sql = "select count(*) from waterproof_study_cases_studycases_intakes where intake_id = %s" % id_intake
            cursor.execute(sql)
            row = cursor.fetchone()    
            count = row[0]
            print ("count: %s" % count)
            cursor.close()
        return JsonResponse({'count': count}, safe=False)
    except Exception as e:
         return JsonResponse({"error": 'value must be integer'})
    