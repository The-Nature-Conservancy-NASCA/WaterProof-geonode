#!/bin/sh

# Exit script in case of error
set -e

echo $"\n\n\n"
echo "-----------------------------------------------------"
echo "STARTING NGINX ENTRYPOINT ---------------------------"
date

# We make the config dir
mkdir -p "/spcwaterproof-certificates/$LETSENCRYPT_MODE"

echo "Creating autoissued certificates for HTTP host"
if [ ! -f "/spcwaterproof-certificates/autoissued/privkey.pem" ] || [[ $(find /spcwaterproof-certificates/autoissued/privkey.pem -mtime +365 -print) ]]; then
        echo "Autoissued certificate does not exist or is too old, we generate one"
        mkdir -p "/spcwaterproof-certificates/autoissued/"
        openssl req -x509 -nodes -days 1825 -newkey rsa:2048 -keyout "/spcwaterproof-certificates/autoissued/privkey.pem" -out "/spcwaterproof-certificates/autoissued/fullchain.pem" -subj "/CN=${HTTP_HOST:-null}" 
else
        echo "Autoissued certificate already exists"
fi

echo "Creating symbolic link for HTTPS certificate"
# for some reason, the ln -f flag doesn't work below...
# TODO : not DRY (reuse same scripts as docker-autoreload.sh)
rm -f /certificate_symlink
if [ -f "/spcwaterproof-certificates/$LETSENCRYPT_MODE/live/$HTTPS_HOST/fullchain.pem" ] && [ -f "/spcwaterproof-certificates/$LETSENCRYPT_MODE/live/$HTTPS_HOST/privkey.pem" ]; then
        echo "Certbot certificate exists, we symlink to the live cert"
        ln -sf "/spcwaterproof-certificates/$LETSENCRYPT_MODE/live/$HTTPS_HOST" /certificate_symlink
else
        echo "Certbot certificate does not exist, we symlink to autoissued"
        ln -sf "/spcwaterproof-certificates/autoissued" /certificate_symlink
fi

echo "Sanity checks on http/s ports configuration"
if [ -z "${HTTP_PORT}" ]; then
        HTTP_PORT=80
fi
if [ -z "${HTTPS_PORT}" ]; then
        HTTPS_PORT=443
fi

echo "Replacing environement variables"
envsubst '\$HTTP_PORT \$HTTPS_PORT \$HTTP_HOST \$HTTPS_HOST \$RESOLVER' < /etc/nginx/nginx.conf.envsubst > /etc/nginx/nginx.conf
envsubst '\$HTTP_PORT \$HTTPS_PORT \$HTTP_HOST \$HTTPS_HOST \$RESOLVER' < /etc/nginx/nginx.https.available.conf.envsubst > /etc/nginx/nginx.https.available.conf

echo "Enabling or not https configuration"
if [ -z "${HTTPS_HOST}" ]; then 
        echo "" > /etc/nginx/nginx.https.enabled.conf
else
        ln -sf /etc/nginx/nginx.https.available.conf /etc/nginx/nginx.https.enabled.conf
fi

echo "Loading nginx autoreloader"
sh /docker-autoreload.sh &

echo "-----------------------------------------------------"
echo "FINISHED NGINX ENTRYPOINT ---------------------------"
echo "-----------------------------------------------------"

# Run the CMD 
exec "$@"
