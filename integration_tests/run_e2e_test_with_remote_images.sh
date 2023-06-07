#!/bin/bash

# Trap ctrl-c and call ctrl_c()
trap ctrl_c INT

function ctrl_c() {
  docker-compose down
}

# Authenticate with GitLab
docker login -u "$1" -p "$2" git.ucsc.edu:5050

# Start docker-compose from YAML
docker-compose up

# TODO: make automatic
# Run CONTROL + C when the test has exited