# TODO : use python:2.7.13-alpine3.6 to make this lighter ( it is what we use for letsencryipt as well)
# But it seems it's not possible for now because alpine only has geos 3.6 which is not supported by django 1.8
# (probably because of https://code.djangoproject.com/ticket/28441)

FROM python:3.8.3-buster

# Install system dependencies
#RUN echo "deb http://apt.postgresql.org/pub/repos/apt/ buster-pgdg main" | tee /etc/apt/sources.list.d/pgdg.list
#RUN wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -

# This section is borrowed from the official Django image but adds GDAL and others
RUN apt-get update && apt-get install -y \
        libpq-dev python-dev libxml2-dev \
        libxml2 libxslt1-dev zlib1g-dev libjpeg-dev \
        libmemcached-dev libldap2-dev libsasl2-dev libffi-dev

RUN apt-get update && apt-get install -y \
        gcc zip gettext geoip-bin cron \
        postgresql-client-11 \
        sqlite3 spatialite-bin libsqlite3-mod-spatialite \
        python3-gdal python3-psycopg2 python3-ldap \
        python3-pip python3-pil python3-lxml python3-pylibmc \
        python3-dev libgdal-dev \
        uwsgi uwsgi-plugin-python3 memcached\
    --no-install-recommends && rm -rf /var/lib/apt/lists/*


# Install python dependencies
RUN echo "GeoNode python dependencies"
RUN pip install pip --upgrade
# Install geonode dependencies
ADD requirements.txt /requirements.txt

# Install pygdal (after requirements https://github.com/GeoNode/geonode/pull/4599)
RUN pip install --upgrade --no-cache-dir -r requirements.txt \
    && pip install pygdal==$(gdal-config --version).* \
    && pip install flower==0.9.4

# Activate "memcached"
# RUN apt install memcached
RUN pip install pylibmc \
    && pip install sherlock


RUN rm -rf /var/lib/apt/lists/* && \
    rm -rf ~/.cache/pip

# Install geonode
RUN mkdir /spcwaterproof
WORKDIR /spcwaterproof/
ADD . /spcwaterproof/
RUN pip install -e . --upgrade
RUN chmod +x scripts_docker/spcwaterproof/django/docker-entrypoint.sh

# Export ports
EXPOSE 8000

# We provide no command or entrypoint as this image can be used to serve the django project or run celery tasks
