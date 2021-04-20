#!/bin/sh

# Exit script in case of error
set -e

echo $"\n\n\n"
echo "-----------------------------------------------------"
echo "STARTING DJANGO ENTRYPOINT $(date)"
echo "-----------------------------------------------------"

# Start memcached service
service memcached restart

# Setting dynamic env vars (some of this could probably be put in docker-compose once
# https://github.com/docker/compose/pull/5268 is merged, or even better hardcoded if
# geonode supported relative site urls)
if [ ! -z "$HTTPS_HOST" ]; then
    export SITEURL="https://$HTTPS_HOST"
    if [ "$HTTPS_PORT" != "443" ]; then
        SITEURL="$SITEURL:$HTTPS_PORT"
    fi
else
    export SITEURL="http://$HTTP_HOST"
    if [ "$HTTP_PORT" != "80" ]; then
        SITEURL="$SITEURL:$HTTP_PORT"
    fi
fi

export GEOSERVER_PUBLIC_LOCATION="${SITEURL}/geoserver/"

# Run migrations
echo 'Running initialize.py...'
python -u scripts_docker/spcwaterproof/django/initialize.py

echo "Running sql scripts... '$GEONODE_DATABASE_USER' :: '$GEONODE_DATABASE'"
export PGPASSWORD="${GEONODE_DATABASE_PASSWORD}"
psql -U $GEONODE_DATABASE_USER -d $GEONODE_DATABASE -h postgres -f initial_data/waterproof_tbls-parameters-models.sql
psql -U $GEONODE_DATABASE_USER -d $GEONODE_DATABASE -h postgres -f initial_data/waterproof_parameters_countries.sql
psql -U $GEONODE_DATABASE_USER -d $GEONODE_DATABASE -h postgres -f initial_data/waterproof_parameters_cities.sql
psql -U $GEONODE_DATABASE_USER -d $GEONODE_DATABASE -h postgres -f initial_data/waterproof_functions.sql

ogr2ogr -append --config PG_USE_COPY YES -nlt PROMOTE_TO_MULTI -nln public.waterproof_intake_basins -f "PostgreSQL" PG:"dbname=geonode host=postgres user=geonode password=G30N0D3" -a_srs EPSG:4326 initial_data/basins.gpkg waterproof_intake_basins

echo "-----------------------------------------------------"
echo "FINISHED DJANGO ENTRYPOINT --------------------------"
echo "-----------------------------------------------------"

# Run the CMD 
exec "$@"
