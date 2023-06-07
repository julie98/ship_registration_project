import json

from django.contrib.auth import authenticate
from django.test import TransactionTestCase, Client
from django_expiring_token.models import ExpiringToken
from rest_framework.authtoken.models import Token

from ..models import User
from ..models import Vessel
from ..utils import get_user_profile
from .helpers import create_mock_vessel

from django.forms.models import model_to_dict


class RegistrationTest(TransactionTestCase):
    reset_sequences = True

    def setUp(self):
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

        self.ship_parameters = dict(ship_name='TestShip1',
                                    ship_type=1,
                                    tonnage=100,
                                    imo_num='ABC1234567',
                                    joint_owners=[['owner0', '100', 'British Overseas Citizen']],
                                    prop_method=1,
                                    prop_power=10,
                                    num_engine=1,
                                    num_hull=1,
                                    port=2,
                                    builder_name='Bob the builder',
                                    builder_addr='123 street',
                                    builder_yard_no=1,
                                    build_date='2020-10-28',
                                    keel_date='2020-10-18',
                                    was_deleted=False)

        # Create vessel, add it to user_prof
        # self.vessel, _ = Vessel.objects.get_or_create(self.ship_parameters)
        self.vessel = create_mock_vessel('TestShip1', port=2, ship_choices="private")
        user = authenticate(username=username, password=password)
        user_prof = get_user_profile(user)
        user_prof.vessels_list.add(self.vessel)

        # Get token and attach to client's header
        token = ExpiringToken.objects.get_or_create(user=user)
        self.client = Client(HTTP_AUTHORIZATION=f'Token {token[0].key}')

    def test_register_vessel_should_return_vessel(self):
        response = self.client.post(path='/vessels/register/',
                                    data=json.dumps(dict(vessel_id=self.vessel.pk)),
                                    content_type='application/json')

        self.assertEqual(response.status_code, 200)
        response_dict = json.loads(response.content)

        self.assertEqual(len(response_dict), 1)
        reg = response_dict[0]
        reg_fields = reg.get('fields')
        self.assertEqual(reg.get('pk'), 1)
        self.assertEqual(reg_fields.get('reg_state'), 'app_fee_pending')

    
    def test_add_register_vessel_should_return_registration(self):
        vessel = create_mock_vessel('Test1', port=2, ship_choices='commercial', just_dict=True)
        vessel["root_url"] = "localhost:3000"
        response = self.client.post(path='/vessels/register_vessel/',
                                        data=json.dumps(vessel),
                                        content_type='application/json')

        self.assertEqual(response.status_code, 200)
        response_dict = json.loads(response.content)

        self.assertEqual(len(response_dict), 1)
        reg = response_dict[0]
        reg_fields = reg.get('fields')
        self.assertEqual(reg.get('pk'), 1)
        self.assertEqual(reg_fields.get('reg_state'), 'app_fee_pending')    

            

