"""
Context processors for waterproof_status app.
Provides cache-busting version for static files during development.
"""
import time
from django.conf import settings


def static_version(request):
    """
    Add a version parameter for cache-busting static files.
    In development, uses timestamp for immediate updates.
    In production, uses a fixed version from settings.
    """
    if settings.DEBUG:
        # In development, use timestamp to always get fresh files
        version = str(int(time.time()))
    else:
        # In production, use version from settings (should be updated on deploy)
        version = getattr(settings, 'STATIC_VERSION', '1.0.0')

    return {
        'STATIC_VERSION': version
    }
