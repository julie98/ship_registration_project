import json

from django.contrib.auth import authenticate
from django.test import TransactionTestCase, Client
from django_expiring_token.models import ExpiringToken

from ..models import User
from ..models import Vessel
from ..models import Registration
from ..utils import get_user_profile, compare_dicts_strings
from .helpers import create_mock_vessel


class VesselTest(TransactionTestCase):
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
        token = ExpiringToken.objects.get_or_create(user=self.user)
        self.client = Client(HTTP_AUTHORIZATION=f'Token {token[0].key}')

        self.ship_parameters = create_mock_vessel('TestShip1', port=2, ship_choices="commercial", just_dict=True)
        
        # Create vessel, add it to user_prof
        self.vessel = create_mock_vessel('TestShip1', port=2, ship_choices="commercial")
        # self.vessel, _ = Vessel.objects.get_or_create(self.ship_parameters)
        user_prof = get_user_profile(self.user)
        user_prof.vessels_list.add(self.vessel)

        self.registration_details = dict(date_applied='2020-10-18',
                                         date_approved='2020-10-18',
                                         reg_state='pending_reg_approval',
                                         registration_info=self.vessel,
                                         user=self.user) 
                                         
        self.registration, _ = Registration.objects.get_or_create(self.registration_details)

    def test_get_vessel_should_be_successful(self):
        response = self.client.get(path='/vessels/list/')

        assert response.status_code == 200

        response_dict = json.loads(response.content)

        assert len(response_dict) == 1

        individual_response = response_dict[0]
        print(individual_response)


        assert individual_response['id'] == 1
        assert individual_response['reg_pk'] == 1


        # TODO: compare fields
        # assert compare_dicts_strings(self.ship_parameters, response_fields)

    def test_get_vessel_should_return_only_vessels_for_active_user(self):
        username_b = 'test_user_b'
        password_b = 'teamatlas'

        User.objects.create_user(
            username=username_b,
            password=password_b,
            first_name='A',
            last_name='B',
            user_type=1,
            eligibility=1
        )

        # Create vessel, add it to user_prof of user b
        user_b = authenticate(username=username_b, password=password_b)
        self.vessel, _ = Vessel.objects.get_or_create(self.ship_parameters)
        user_prof = get_user_profile(user_b)
        user_prof.vessels_list.add(self.vessel)

        response = self.client.get(path='/vessels/list/')

        assert response.status_code == 200

        response_dict = json.loads(response.content)

        assert len(response_dict) == 1

    def test_create_vessel_should_be_successful(self):
        modified_parameters = self.ship_parameters
        modified_parameters['ship_name'] = 'TestShip2'
        modified_parameters['imo_num'] = 'AAC1234567'

        response = self.client.post(path='/vessels/add/',
                                    data=json.dumps(modified_parameters),
                                    content_type='application/json')

        self.assertEqual(response.status_code, 200)

        ship_from_db = Vessel.objects.get(ship_name='TestShip2')

        ship_dict = ship_from_db.__dict__

        assert compare_dicts_strings(modified_parameters, ship_dict)

    def test_create_vessel_with_same_name_for_different_port_should_be_successful(self):
        username_b = 'test_user_b'
        password_b = 'teamatlas'

        User.objects.create_user(
            username=username_b,
            password=password_b,
            first_name='A',
            last_name='B',
            user_type=1,
            eligibility=1
        )

        # Create vessel, add it to user_prof of user b
        user_b = authenticate(username=username_b, password=password_b)
        self.vessel, _ = Vessel.objects.get_or_create(self.ship_parameters)
        user_prof = get_user_profile(user_b)
        user_prof.vessels_list.add(self.vessel)

        modified_parameters = self.ship_parameters
        modified_parameters['port'] = 1
        modified_parameters['imo_num'] = 'CBC1234567'
        print(modified_parameters)

        response = self.client.post(path='/vessels/add/',
                                    data=json.dumps(modified_parameters),
                                    content_type='application/json')

        self.assertEqual(response.status_code, 200)

    def test_create_vessel_with_same_name_for_same_port_should_return_400(self):
        username_b = 'test_user_b'
        password_b = 'teamatlas'

        User.objects.create_user(
            username=username_b,
            password=password_b,
            first_name='A',
            last_name='B',
            user_type=1,
            eligibility=1
        )

        # Create vessel, add it to user_prof of user b
        user_b = authenticate(username=username_b, password=password_b)
        self.vessel, _ = Vessel.objects.get_or_create(self.ship_parameters)
        user_prof = get_user_profile(user_b)
        user_prof.vessels_list.add(self.vessel)

        response = self.client.post(path='/vessels/add/',
                                    data=json.dumps(self.ship_parameters),
                                    content_type='application/json')

        self.assertEqual(response.status_code, 400)

    def test_create_vessel_with_incorrect_payload_should_return_400(self):
        modified_parameters = self.ship_parameters
        modified_parameters['imo_num'] = 'A'

        response = self.client.post(path='/vessels/add/',
                                    data=json.dumps(modified_parameters),
                                    content_type='application/json')

        self.assertEqual(response.status_code, 400)

    def test_create_vessel_with_incorrect_imo_should_return_400(self):
        modified_parameters = self.ship_parameters
        del modified_parameters['ship_name']

        response = self.client.post(path='/vessels/add/',
                                    data=json.dumps(modified_parameters),
                                    content_type='application/json')

        self.assertEqual(response.status_code, 400)

    def test_name_available_is_succesful(self):
        username_b = 'test_user_b'
        password_b = 'teamatlas'

        User.objects.create_user(
            username=username_b,
            password=password_b,
            first_name='A',
            last_name='B',
            user_type=1,
            eligibility=1
        )

        # Create vessel, add it to user_prof of user b
        user_b = authenticate(username=username_b, password=password_b)
        self.vessel, _ = Vessel.objects.get_or_create(self.ship_parameters)
        user_prof = get_user_profile(user_b)
        user_prof.vessels_list.add(self.vessel)

        response = self.client.get(path='/vessels/check_unique_name/', data={'ship_name': 'TestShip2', 'port': 2})
        response_dict = json.loads(response.content)

        self.assertEqual(response_dict.get('is_unique'), True)

    def test_name_not_available_is_succesful(self):
        username_b = 'test_user_b'
        password_b = 'teamatlas'

        User.objects.create_user(
            username=username_b,
            password=password_b,
            first_name='A',
            last_name='B',
            user_type=1,
            eligibility=1
        )

        # Create vessel, add it to user_prof of user b
        user_b = authenticate(username=username_b, password=password_b)
        self.vessel, _ = Vessel.objects.get_or_create(self.ship_parameters)
        user_prof = get_user_profile(user_b)
        user_prof.vessels_list.add(self.vessel)

        response = self.client.get(path='/vessels/check_unique_name/', data={'ship_name': 'TestShip1', 'port': 2})
        response_dict = json.loads(response.content)

        self.assertEqual(response_dict.get('is_unique'), False)