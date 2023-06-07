#!/bin/bash

# Reset secret
kubectl delete secret gitlab-auth

# Reset current cluster
kubectl delete -f backend/kubernetes/postgres/
kubectl delete -f backend/kubernetes/django/
kubectl delete -f backend/kubernetes/ingress/
kubectl delete -f frontend/kubernetes/