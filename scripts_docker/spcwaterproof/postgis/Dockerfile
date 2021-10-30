FROM postgis/postgis:14-3.1-alpine
#FROM tobi312/rpi-postgresql-postgis
LABEL PostGIS for Waterproof

COPY ./initdb-geonode.sh /docker-entrypoint-initdb.d/geonode.sh
RUN chmod +x /docker-entrypoint-initdb.d/geonode.sh