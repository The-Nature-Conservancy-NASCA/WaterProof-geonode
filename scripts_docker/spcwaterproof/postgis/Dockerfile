FROM postgis/postgis:14-3.1-alpine
LABEL PostGIS for Waterproof

COPY ./initdb-geonode.sh /docker-entrypoint-initdb.d/geonode.sh
RUN chmod +x /docker-entrypoint-initdb.d/geonode.sh