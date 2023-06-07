# Run this file: 'python manage.py shell < init_users.py'
from shipping_backend.models import User

DEFAULT_ADMIN_USER = 'admin'
DEFAULT_ADMIN_PASS = 'TeamAtlas1!'
ADMIN_ROLE = 5
# Create a superuser since python manage.py createsuperuser broke after adding custom authentication via AbstractUser
User.objects.create_superuser(username=DEFAULT_ADMIN_USER, password=DEFAULT_ADMIN_PASS, user_type=ADMIN_ROLE)

# Create the other users:
User.objects.create_user(username='broker@teamatlas.com', password=DEFAULT_ADMIN_PASS, user_type=2, eligibility=1, first_name='A',
                         last_name='Broker')
User.objects.create_user(username='registrar@teamatlas.com', password=DEFAULT_ADMIN_PASS, user_type=4, eligibility=2, first_name='A',
                         last_name='Registrar@teamatlas.com')
User.objects.create_user(username='individual@teamatlas.com', password=DEFAULT_ADMIN_PASS, user_type=1, eligibility=3,
                         first_name='An', last_name='Individual')
User.objects.create_user(username='commercial@teamatlas.com', password=DEFAULT_ADMIN_PASS, user_type=3, eligibility=4, first_name='A',
                         last_name='Commercial')
