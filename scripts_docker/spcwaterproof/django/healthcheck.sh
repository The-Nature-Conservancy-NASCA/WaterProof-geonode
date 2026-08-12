#!/bin/bash

# Enhanced healthcheck script for Django uWSGI container
# Checks multiple indicators of health including queue status

set -e

# Primary health check - HTTP response
HTTP_STATUS=$(curl --fail --silent --write-out '%{http_code}' --output /dev/null --connect-timeout 5 --max-time 10 http://127.0.0.1:8001/ || echo "000")

if [ "$HTTP_STATUS" != "200" ]; then
    echo "HTTP health check failed with status: $HTTP_STATUS"
    exit 1
fi

# Check uWSGI stats if available
if command -v uwsgi_curl >/dev/null 2>&1; then
    # Check for queue overflow in uWSGI logs
    QUEUE_FULL=$(grep -c "listen queue.*full" /tmp/uwsgi.log 2>/dev/null || echo "0")
    if [ "$QUEUE_FULL" -gt "0" ]; then
        echo "uWSGI queue overflow detected: $QUEUE_FULL occurrences"
        exit 1
    fi
fi

# Check memory usage (warn if over 90% of allocated)
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
if [ "$MEMORY_USAGE" -gt "90" ]; then
    echo "High memory usage detected: ${MEMORY_USAGE}%"
    exit 1
fi

# Check if Django can connect to database
if ! python -c "
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'geonode.settings')
django.setup()
from django.db import connection
cursor = connection.cursor()
cursor.execute('SELECT 1')
print('Database connection OK')
" 2>/dev/null; then
    echo "Database connection check failed"
    exit 1
fi

echo "All health checks passed"
exit 0