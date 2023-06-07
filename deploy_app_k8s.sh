#!/bin/bash

# Start minikube
minikube start --vm=true
eval "$(minikube docker-env)"

kubectl create secret docker-registry gitlab-auth --docker-server=https://git.ucsc.edu:5050 --docker-username="$1" --docker-password="$2"

# Create postgres deployment
kubectl apply -f backend/kubernetes/postgres/

# Create backend deployment
kubectl apply -f backend/kubernetes/django/

# Create frontend deployment
kubectl apply -f frontend/kubernetes/

# Create ingress
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.40.2/deploy/static/provider/cloud/deploy.yaml
minikube addons enable ingress
kubectl apply -f backend/kubernetes/ingress/

# To access frontend:
# 1 - minikube ip
# 2 - Copy paste address in browser

# To access dashboard:
# 1 - minikube dashboard
# 2 - Click on the link