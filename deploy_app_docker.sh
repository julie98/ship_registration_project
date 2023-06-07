#!/bin/bash

# Trap ctrl-c and call ctrl_c()
trap ctrl_c INT

function ctrl_c() {
  docker-compose down
}

function push_backend() {
  docker build -t localhost:5000/atlas-backend -f backend/Dockerfile backend
  docker push localhost:5000/atlas-backend
}

function push_frontend() {
  docker build -t localhost:5000/atlas-frontend -f frontend/Dockerfile frontend
  docker push localhost:5000/atlas-frontend
}

function push_db() {
  docker build -t localhost:5000/atlas-local-db -f backend/local_testing_db/Dockerfile backend/local_testing_db
  docker push localhost:5000/atlas-local-db
}

# Make sure we are using local cluster
kubectl config use-context docker-desktop

# Make sure wee have localhost docker registry running
docker run -d -p 5000:5000 --restart=always --name registry registry:2

push_db

# Start docker-compose from YAML
if [ "$1" == "frontend-dev" ]; then
  push_backend
  docker-compose up atlas-local-db atlas-backend

elif [ "$1" == "backend-dev" ]; then
  push_frontend
  docker-compose up atlas-local-db atlas-frontend

elif [ "$1" == "backend-dev-only" ]; then
  docker-compose up atlas-local-db

else
  push_frontend
  push_backend
  docker-compose up
fi