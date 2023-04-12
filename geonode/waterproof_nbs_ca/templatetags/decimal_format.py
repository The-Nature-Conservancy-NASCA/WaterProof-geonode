from django.template import Library
from django.utils.numberformat import format

register = Library()

@register.filter
def decimalFormat(value, decimal_pos=2):
    return format(value, ",", decimal_pos)

decimalFormat.is_safe = True