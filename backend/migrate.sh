python manage.py makemigrations
python manage.py migrate
python populate_fixtures.py
python manage.py loaddata shipping_backend/fixtures/vessel_data.json
python manage.py loaddata shipping_backend/fixtures/user_data.json
python manage.py loaddata shipping_backend/fixtures/user_prof_data.json
python manage.py loaddata shipping_backend/fixtures/registration_data.json