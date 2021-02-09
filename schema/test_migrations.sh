#!/bin/bash
set -euo pipefail

docker network prune -f 2>&1 >/dev/null
docker network create CQRServerless 2>&1 >/dev/null

docker run -d --rm --net CQRServerless -e POSTGRES_HOST_AUTH_METHOD=trust --name postgres postgres 2>&1 >/dev/null
docker run -d --rm --net CQRServerless --name dockerize jwilder/dockerize -wait tcp://postgres:5432 2>&1 >/dev/null
docker run --rm --net CQRServerless -v ${PWD}/infrastructure/schema:/flyway/sql --name flyway flyway/flyway -url=jdbc:postgresql://postgres/postgres -user=postgres migrate


function cleanup {
  docker kill postgres 2>&1 >/dev/null
}
trap cleanup SIGINT SIGTERM EXIT
