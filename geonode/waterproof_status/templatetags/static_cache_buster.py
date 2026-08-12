"""
Template tags for cache-busting static files.

Usage in templates:
    {% load static_cache_buster %}

    <!-- For CSS -->
    <link rel="stylesheet" href="{% static_v 'path/to/style.css' %}"/>

    <!-- For JS -->
    <script src="{% static_v 'path/to/script.js' %}"></script>
"""
import time
from django import template
from django.conf import settings
from django.templatetags.static import static

register = template.Library()


@register.simple_tag
def static_v(path):
    """
    Returns a static file URL with version parameter for cache-busting.

    In development (DEBUG=True): Uses timestamp for immediate updates
    In production (DEBUG=False): Uses fixed version from settings

    Args:
        path: Path to the static file

    Returns:
        URL with version parameter appended

    Example:
        {% static_v 'css/styles.css' %}
        -> /static/css/styles.css?v=1234567890
    """
    static_url = static(path)

    if settings.DEBUG:
        # In development, use timestamp to always get fresh files
        version = str(int(time.time()))
    else:
        # In production, use version from settings
        version = getattr(settings, 'STATIC_VERSION', '1.0.0')

    # Add version parameter
    separator = '&' if '?' in static_url else '?'
    return f"{static_url}{separator}v={version}"


@register.simple_tag(takes_context=True)
def cache_bust_version(context):
    """
    Returns just the version string for manual use.

    Usage:
        <link href="{{ STATIC_URL }}style.css?v={% cache_bust_version %}"/>
    """
    if settings.DEBUG:
        return str(int(time.time()))
    else:
        return getattr(settings, 'STATIC_VERSION', '1.0.0')
