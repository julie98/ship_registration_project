#!/bin/bash

wait-for-it/wait-for-it.sh -t 60 postgres-container:5432 --
python manage.py migrate
python manage.py loaddata shipping_backend/fixtures/*.json
python manage.py runserver 0.0.0.0:8000