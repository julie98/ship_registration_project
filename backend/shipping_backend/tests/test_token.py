from datetime import timedelta
from time import sleep

from django.contrib.auth import authenticate
from django.test import TransactionTestCase, Client
from django_expiring_token.models import ExpiringToken

from ..models import User


class TokenTest(TransactionTestCase):
    reset_sequences = True

    def setUp(self):
        username_a = 'test_user'
        password_a = 'teamatlas'

        User.objects.create_user(
            username=username_a,
            password=password_a,
            first_name='A',
            last_name='B',
            user_type=1,
            eligibility=1
        )

        self.user = authenticate(username=username_a, password=password_a)

    def test_calling_endpoint_with_expired_token_should_return_401(self):
        with self.settings(EXPIRING_TOKEN_DURATION=timedelta(seconds=0.5)):
            token = ExpiringToken.objects.create(user=self.user)
            client = Client(HTTP_AUTHORIZATION=f'Token {token.key}')

            sleep(0.6)
            response = client.get(path='/vessels/list/')
            assert response.status_code == 401
