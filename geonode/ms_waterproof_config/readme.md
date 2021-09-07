
docker run --rm -d -p 82:80 --name waterproof-mapserver --volume=/data/outputs/:/etc/mapserver/:ro camptocamp/mapserver

docker exec -it mapserver-example /bin/bash
docker exec -it waterproof-mapserver /bin/bash
docker logs -f waterproof-mapserver

