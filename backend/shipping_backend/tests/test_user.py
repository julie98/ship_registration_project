import json

from django.test import Client, TransactionTestCase

from ..models import User


class UserTest(TransactionTestCase):
    reset_sequences = True

    def setUp(self):
        self.client = Client()

    def test_register_user_should_return_token(self):
        response = self.client.post(path='/register_user/',
                                    data=json.dumps(dict(username='abcdef',
                                                         password='abc',
                                                         first_name='A',
                                                         last_name='B',
                                                         user_type=3,
                                                         eligibility=2)),
                                    content_type='application/json')

        self.assertEqual(response.status_code, 200)

        assert 'token' in response.data.keys()
        assert 'first_name' in response.data.keys()
        assert 'last_name' in response.data.keys()

    def test_register_two_users_should_return_different_tokens(self):
        response = self.client.post(path='/register_user/',
                                    data=json.dumps(dict(username='abcdef',
                                                         password='abc',
                                                         first_name='A',
                                                         last_name='B',
                                                         user_type=3,
                                                         eligibility=2)),
                                    content_type='application/json')

        self.assertEqual(response.status_code, 200)

        assert 'token' in response.data.keys()
        assert 'first_name' in response.data.keys()
        assert 'last_name' in response.data.keys()

        token_user_a = response.data['token']

        response = self.client.post(path='/register_user/',
                                    data=json.dumps(dict(username='ghil',
                                                         password='abc',
                                                         first_name='C',
                                                         last_name='D',
                                                         user_type=3,
                                                         eligibility=2)),
                                    content_type='application/json')

        self.assertEqual(response.status_code, 200)

        assert 'token' in response.data.keys()
        assert 'first_name' in response.data.keys()
        assert 'last_name' in response.data.keys()

        token_user_b = response.data['token']

        assert token_user_a != token_user_b

    def test_register_user_with_incorrect_payload_should_return_400(self):
        response = self.client.post(path='/register_user/',
                                    data=json.dumps(dict(user_name='abcdef',
                                                         password='abc',
                                                         first_name='A',
                                                         last_name='B',
                                                         user_type=3,
                                                         eligibility=2)),
                                    content_type='application/json')

        self.assertEqual(response.status_code, 400)

    def test_register_user_same_username_should_return_400(self):
        username = 'test_user'
        password = 'teamatlas'

        User.objects.create_user(
            username=username,
            password=password,
            first_name='A',
            last_name='B',
            user_type=1,
            eligibility=1
        )

        response = self.client.post(path='/register_user/',
                                    data=json.dumps(dict(username=username,
                                                         password='def',
                                                         first_name='A',
                                                         last_name='B',
                                                         user_type=3,
                                                         eligibility=2)),
                                    content_type='application/json')

        self.assertEqual(response.status_code, 400)

    def test_login_user_should_return_token(self):
        username = 'test_user'
        password = 'teamatlas'

        User.objects.create_user(
            username=username,
            password=password,
            first_name='A',
            last_name='B',
            user_type=1,
            eligibility=1
        )

        response = self.client.post(path='/login/',
                                    data=json.dumps(dict(username=username,
                                                         password=password)),
                                    content_type='application/json')

        self.assertEqual(response.status_code, 200)

        assert 'token' in response.data.keys()

    def test_login_should_return_user_type(self):
        username = 'test_user'
        password = 'teamatlas'

        User.objects.create_user(
            username=username,
            password=password,
            first_name='A',
            last_name='B',
            user_type=1,
            eligibility=1
        )

        response = self.client.post(path='/login/',
                                    data=json.dumps(dict(username=username,
                                                         password=password)),
                                    content_type='application/json')

        self.assertEqual(response.status_code, 200)
        
        assert 'user_type' in response.data.keys()

    def test_login_non_existing_user_should_return_401(self):
        username = 'test_user'
        password = 'teamatlas'

        response = self.client.post(path='/login/',
                                    data=json.dumps(dict(username=username,
                                                         password=password)),
                                    content_type='application/json')

        self.assertEqual(response.status_code, 401)

    def test_login_user_with_incorrect_password_should_return_401(self):
        username = 'test_user'
        password = 'teamatlas'

        User.objects.create_user(
            username=username,
            password=password,
            first_name='A',
            last_name='B',
            user_type=1,
            eligibility=1
        )

        response = self.client.post(path='/login/',
                                    data=json.dumps(dict(username=username,
                                                         password='abc')),
                                    content_type='application/json')

        self.assertEqual(response.status_code, 401)
