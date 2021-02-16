from django.template import Library
from django.utils.numberformat import format
from decimal import Decimal
register = Library()

@register.filter
def multiplyFactor(value, arg):
    return Decimal(value) * Decimal(arg)

multiplyFactor.is_safe = True