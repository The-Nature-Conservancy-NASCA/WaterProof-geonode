FROM mdillon/postgis:11-alpine
LABEL PostGIS for Waterproof

COPY ./initdb-geonode.sh /docker-entrypoint-initdb.d/geonode.sh
COPY ./geonode.dmp geonode.dmp
RUN chmod +x /docker-entrypoint-initdb.d/geonode.sh