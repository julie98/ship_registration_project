import json

from django.db import IntegrityError
from django.test import TransactionTestCase, Client
from rest_framework_api_key.models import APIKey

from .helpers import create_mock_vessel
from ..models import Surveyor


class SurveyorTest(TransactionTestCase):
    reset_sequences = True

    def setUp(self):
        self.client = Client()

        vessel = create_mock_vessel(ship_name='AShip', port=1, ship_choices='private')

        self.api_key = 'key-for-unit-test'
        surveyor = Surveyor.objects.create(name='ABC', api_key=self.api_key)
        surveyor.vessels_list.add(vessel)

    def test_get_vessel_with_api_key_should_be_successful(self):
        api_key, key = APIKey.objects.create_key(name=self.api_key)

        self.client = Client(HTTP_AUTHORIZATION=f'Api-Key {key}')

        response = self.client.get(path='/vessels/')

        assert response.status_code == 200

        response_dict = json.loads(response.content)

        assert len(response_dict) == 1

    def test_get_vessel_with_api_key_should_return_only_vessels_for_specific_surveyor(self):
        vessel_b = create_mock_vessel(ship_name='ASecondShip', port=2, ship_choices='private')
        surveyor_b = Surveyor.objects.create(name='DEF', api_key='blabla')
        surveyor_b.vessels_list.add(vessel_b)

        api_key, key = APIKey.objects.create_key(name=self.api_key)

        self.client = Client(HTTP_AUTHORIZATION=f'Api-Key {key}')

        response = self.client.get(path='/vessels/')

        assert response.status_code == 200

        response_dict = json.loads(response.content)

        assert len(response_dict) == 1

    def test_create_surveyor_with_same_api_key_should_fail(self):
        self.assertRaises(IntegrityError,
                          Surveyor.objects.create, name='ABC', api_key=self.api_key)
