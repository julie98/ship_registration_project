import json

from django.contrib.auth import authenticate
from django.core import mail
from django.test import TransactionTestCase, Client
from django_expiring_token.models import ExpiringToken

from .helpers import create_mock_vessel
from ..models import Registration
from ..models import User


class RegistrarTest(TransactionTestCase):
    reset_sequences = True

    def setUp(self):
        username = 'test_user'
        password = 'teamatlas'

        self.registration_user = User.objects.create_user(
            username=username,
            password=password,
            first_name='A',
            last_name='B',
            user_type=4,
            eligibility=None
        )

        # Create vessels
        user = authenticate(username=username, password=password)

        # Get token and attach to client's header
        token = ExpiringToken.objects.get_or_create(user=user)
        self.client = Client(HTTP_AUTHORIZATION=f'Token {token[0].key}')

    def test_registrar_view_all_users_is_successful(self):
        # Create a dummy users of each type in the database

        individ_user = User.objects.create_user(
            username='username_i',
            password='password',
            first_name='Individual',
            last_name='User',
            user_type=1,
            eligibility=1
        )

        broker_user = User.objects.create_user(
            username='username_b',
            password='password',
            first_name='Broker',
            last_name='User',
            user_type=2,
            eligibility=None
        )

        commercial_user = User.objects.create_user(
            username='username_c',
            password='password',
            first_name='Commercial',
            last_name='User',
            user_type=3,
            eligibility=1
        )

        registrar_user = User.objects.create_user(
            username='username_r',
            password='password',
            first_name='Registrar',
            last_name='User',
            user_type=4,
            eligibility=None
        )

        response = self.client.get(path='/users/view/all/',
                                   content_type='application/json')

        self.assertEqual(response.status_code, 200)
        response_dict = json.loads(response.content)

        self.assertEqual(len(response_dict), 3)

        individ_fields = response_dict[0]
        self.assertEqual(individ_fields.get('id'), individ_user.pk)
        self.assertEqual(individ_fields.get('username'), 'username_i')
        self.assertEqual(individ_fields.get('first_name'), 'Individual')
        self.assertEqual(individ_fields.get('last_name'), 'User')

        broker_fields = response_dict[1]
        self.assertEqual(broker_fields.get('id'), broker_user.pk)
        self.assertEqual(broker_fields.get('username'), 'username_b')
        self.assertEqual(broker_fields.get('first_name'), 'Broker')
        self.assertEqual(broker_fields.get('last_name'), 'User')

        commercial_fields = response_dict[2]
        self.assertEqual(commercial_fields.get('id'), commercial_user.pk)
        self.assertEqual(commercial_fields.get('username'), 'username_c')
        self.assertEqual(commercial_fields.get('first_name'), 'Commercial')
        self.assertEqual(commercial_fields.get('last_name'), 'User')

    def test_registrar_view_all_applications_is_successful(self):
        # Create a dummy registration defaulting to "unregistered_vessel"
        Registration.objects.create(registration_info=create_mock_vessel('Test1', 1, "private"),
                                    user=self.registration_user)
        vessel2 = create_mock_vessel('Test2', 1, "private")
        reg_2 = Registration.objects.create(registration_info=vessel2, user=self.registration_user)

        # Change registration state for reg_2
        reg_2.reg_state = 'reg_approved'
        reg_2.save()

        response = self.client.get(path='/registrations/view/all/',
                                   content_type='application/json')

        self.assertEqual(response.status_code, 200)
        response_dict = json.loads(response.content)

        self.assertEqual(len(response_dict), 1)
        reg = response_dict[0]
        reg_fields = reg.get('fields')
        self.assertEqual(reg.get('pk'), reg_2.pk)
        self.assertEqual(reg_fields.get('reg_state'), 'reg_approved')
        self.assertEqual(reg_fields.get('registration_info'), vessel2.pk)

    def test_registrar_view_filtered_applications_is_successful(self):
        """
        Instantiates registrations of each reg_state, then checks only 1 is returned when
        the /applications/view/all/ query parameter is changed"
        """
        states = [s for s, _ in Registration.STATES]

        # Create registrations for each type
        vessels = [create_mock_vessel('Test' + str(i), 1, "private") for i in range(5)]
        regs = [Registration.objects.create(registration_info=v, user=self.registration_user) for v in vessels]

        # Change registration states (keep 0'th as 'unregistered_vessel')
        for reg, state in zip(regs[1:], states[1:]):
            print(f"saving {state} -> {reg}")
            reg.reg_state = state
            reg.save()

        # Query endpoint with each status type, and expect only one result back for each
        for (reg, state), vessel in zip(zip(regs, states), vessels):
            print(f"querying: reg_stats= {state}")
            response = self.client.get('/applications/view/all/',
                                       {'registration_status': state},
                                       HTTP_ACCEPT='application/json')
            # data = json.dumps(dict(registration_status=state)),

            self.assertEqual(response.status_code, 200)
            response_dict = json.loads(response.content)

            self.assertEqual(len(response_dict), 1)
            resp_reg = response_dict[0]
            print(resp_reg)
            self.assertEqual(resp_reg.get('id'), reg.pk)
            self.assertEqual(resp_reg.get('reg_state'), state)
            self.assertEqual(resp_reg.get('registration_info_id'), vessel.pk)
            self.assertEqual(resp_reg.get('ship_name'), vessel.ship_name)

    def test_registrar_approve_application_is_successful(self):
        registration = Registration.objects.create(registration_info=create_mock_vessel('Test1', 1, "private"),
                                                   user=self.registration_user,
                                                   root_url='localhost:3000')

        registration.reg_state = 'pending_reg_approval'
        registration.save()

        with self.settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend'):
            response = self.client.post(path='/applications/review/',
                                        data=dict(registration_id=registration.id, decision='approved'),
                                        content_type='application/json')

            self.assertEqual(response.status_code, 200)

            self.assertEquals(len(mail.outbox), 1)
            sent_email = mail.outbox[0]
            assert sent_email.to == ['test_user']
            assert sent_email.from_email == 'support@teamatlas.com'
            assert sent_email.subject == 'Your application status'
            assert sent_email.body == 'The application for your vessel Test1 was approved! Click on the following link: http://localhost:3000/payment/1 to pay $100.'

            response_dict = json.loads(response.content)
            response_dict_fields = response_dict[0]['fields']
            assert 'date_applied' in response_dict_fields.keys()
            assert 'date_approved' in response_dict_fields.keys()
            assert response_dict_fields['reg_state'] == 'reg_fee_pending'
            assert response_dict_fields['registration_info'] == 1
            assert response_dict_fields['user'] == 1

    def test_registrar_reject_application_is_successful(self):
        registration = Registration.objects.create(registration_info=create_mock_vessel('Test1', 1, "private"),
                                                   user=self.registration_user)

        registration.reg_state = 'pending_reg_approval'
        registration.save()

        with self.settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend'):
            response = self.client.post(path='/applications/review/',
                                        data=dict(registration_id=registration.id, decision='rejected'),
                                        content_type='application/json')

            self.assertEqual(response.status_code, 200)

            self.assertEquals(len(mail.outbox), 1)
            sent_email = mail.outbox[0]
            assert sent_email.to == ['test_user']
            assert sent_email.from_email == 'support@teamatlas.com'
            assert sent_email.subject == 'Your application status'
            assert sent_email.body == 'The application for your vessel Test1 was rejected!'

            response_dict = json.loads(response.content)
            response_dict_fields = response_dict[0]['fields']
            assert 'date_applied' in response_dict_fields.keys()
            assert 'date_approved' in response_dict_fields.keys()
            assert response_dict_fields['reg_state'] == 'reg_rejected'
            assert response_dict_fields['registration_info'] == 1
            assert response_dict_fields['user'] == 1
