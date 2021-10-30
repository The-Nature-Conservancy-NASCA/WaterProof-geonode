FROM duvel/postgis:12-2.5
LABEL PostGIS for Waterproof

COPY ./initdb-geonode.sh /docker-entrypoint-initdb.d/geonode.sh
<<<<<<< HEAD
#RUN chmod +x /docker-entrypoint-initdb.d/geonode.sh
=======
COPY ./geonode.dmp geonode.dmp
RUN chmod +x /docker-entrypoint-initdb.d/geonode.sh
>>>>>>> 8d0cc8e383b8d47895f276ad88b7e61ec373bfc4
