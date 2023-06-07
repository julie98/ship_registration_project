import io
import json

import stripe
from django.conf import settings
from django.contrib.auth import authenticate
from django.core import serializers
from django.core.mail import send_mail, EmailMessage
from django.db.models import Q
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django_expiring_token.models import ExpiringToken
from reportlab.pdfgen import canvas
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_401_UNAUTHORIZED
from rest_framework_api_key.models import APIKey
from rest_framework_api_key.permissions import HasAPIKey

from .models import Pricing, Vessel
from .models import Registration
from .models import Surveyor
from .models import User
from .utils import add_vessel_to_db, get_user_profile, is_vessel_name_unique_in_port
from .gen_cert import gen_reg_certificate


@api_view(["GET"])
def get_vessels(request):
    """
    Returns all of the vessels associated with the user. The
    user is authenticated and fetched via the required token
    in the request header.

    Example Response: 
    {
       "id": 1,
        "ship_name": "TestShip2",
        "ship_type": 1,
        "tonnage": 100,
        "imo_num": "ABC1234567",
        "joint_owners": "[\"[\\\"owner0\\\", \\\"99\\\"]\", \"[\\\"owner1\\\", \\\"1\\\"]\"]",
        "prop_method": 1,
        "prop_power": 10,
        "num_engine": 1,
        "num_hull": 1,
        "port": 2,
        "builder_name": "Bob the builder",
        "builder_addr": "123 street",
        "builder_yard_no": 1,
        "date_created": "2020-11-10",
        "build_date": "2020-10-28",
        "keel_date": "2020-10-18",
        "was_deleted": false,
        "reg_status": "pending_reg_approval",
        "date_applied": "2020-12-01",
        "date_approved": "2020-12-01",
        "reg_pk": 1
    }
    
    Errors {
        403 Error: Forbidden = "You do not have permission to perform this action."
            This error means you forgot your authentication token.
    }
    """
    user_object = get_user_profile(request.user)
    vessel_objects = user_object.vessels_list.all()

    vessel_info = []
    for vessel in vessel_objects:
        pk = vessel.pk
        modified_dict = vessel.__dict__
        del modified_dict['_state']
        modified_dict['date_created'] = str(vessel.date_created)
        modified_dict['build_date'] = str(vessel.build_date)
        modified_dict['keel_date'] = str(vessel.keel_date)
        try:
            registration = Registration.objects.get(pk=pk)
            modified_dict['reg_status'] = registration.reg_state
            modified_dict['date_applied'] = str(registration.date_applied)
            modified_dict['date_approved'] = str(registration.date_approved)
            modified_dict['reg_pk'] = registration.pk
            vessel_info.append(modified_dict)

        except Exception as e:
            modified_dict['reg_status'] = "unregistered_vessel"
            modified_dict['date_applied'] = ""
            modified_dict['date_approved'] = ""
            modified_dict['reg_pk'] = ""
            vessel_info.append(modified_dict)

    json_response = json.dumps(vessel_info)
    return HttpResponse(json_response, content_type='application/json')


@api_view(["POST"])
def add_vessel(request):
    """
    Adds a new vessel to a user's vessels_list.  The
    user is authenticated and fetched via the required token
    in the request header.
    Example request body: 
    {            
        "ship_name": "TestShip3",
        "ship_type": 1,
        "tonnage": 100,
        "imo_num": "ABC1234567",
        "joint_owners": [["owner0","99"], ["owner1", "1"]],
        "prop_method": 1,
        "prop_power": 10,
        "num_engine": 1,
        "num_hull": 1,
        "port": 2,
        "builder_name": "Bob the builer",
        "builder_addr": "123 street",
        "builder_yard_no": 1,
        "build_date": "2020-10-28",
        "keel_date": "2020-10-18"
    }

    Example response: 
    {
        "TestShip3"
    }

    Errors {
        403 Error: Forbidden = "You do not have permission to perform this action."
            - This error means you forgot your authentication token.

        ValueError: "Ship name <ship_name> is not unique in port <port>"
            - Either the port or ship_name must be changed because this ship_name is no unique for this port.
        ValueError: "IMO number <imo_num> is invalid"
            - The IMO number does not conform to the IMO requirements.
    }
    """
    try:
        # Parse req for Vessel fields, then add vessel to user's vessels_list
        request_body = request.body
        loaded_body = json.loads(request_body)
        vessel = add_vessel_to_db(loaded_body)
        user_object = get_user_profile(request.user)
        user_object.vessels_list.add(vessel)
        print(f'Added {vessel} to {user_object}')
        return HttpResponse(vessel, content_type='application/json')

    except Exception as e:
        return Response(f'Something went wrong with the request: {e}', status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def register_vessel(request):
    """
    Allows a user to create a registration in the DB for their vessel. The
    user is authenticated and fetched via the required token
    in the request header. The endpoint takes in a "vessel_id", the primary key
    of the vessel to create the registration for. 

    Example request body:
    {
        "vessel_id": 1,
    }
    
    Example response: 
    [
        {
            "model": "shipping_backend.registration",
            "pk": 1,   
            "fields": {
                "date_applied": "2020-11-17",
                "date_approved": "2020-11-17",
                "reg_state": "app_fee_pending",
                "registration_info": 1
            }
        }
    ]

    Errors {
        403 Error: Forbidden = "You do not have permission to perform this action."
            - This error means you forgot your authentication token.

        404 Error: Not Found = "not found"
            - The vessel with primary key "vessel_id" is not associated with the user.
    }

    """
    try:
        # Parse req for registration fields, then add vessel to user's vessels_list
        request_body = request.body
        loaded_body = json.loads(request_body)
        vessel_id = loaded_body.get('vessel_id')

        # Get vessel from the User's list of vessels (ensure they have access)
        user_object = get_user_profile(request.user)
        vessel = get_object_or_404(user_object.vessels_list, pk=vessel_id)

        # Create registration and save
        registration, _created = Registration.objects.get_or_create(registration_info=vessel, user=user_object.user)

        # Trigger state transition TODO: switch based on reg_status
        # if registration.reg_status == "NO_REG" : -> call the specific transition func
        registration.register_vessel()
        registration.save()

        # Serialize Registration object to send to frontend
        json_response = serializers.serialize('json', [registration])

        return HttpResponse(json_response, content_type='application/json')

    except Exception as e:
        return Response(f'Something went wrong with the request: {e}', status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def add_register_vessel(request):
    """
    Both associates a new vessel with the user AND creates a new
    registration entry in the DB. The user is authenticated and
    fetched via the required token in the request header.

    Example request body: 
    {            
        "ship_name": "TestShip3",
        "ship_type": 1,
        "tonnage": 100,

        "imo_num": "ABC1234567",
        "joint_owners": [["owner0","99"], ["owner1", "1"]],
        "prop_method": 1,
        "prop_power": 10,
        "num_engine": 1,
        "num_hull": 1,
        "port": 2,
        "builder_name": "Bob the builer",
        "builder_addr": "123 street",
        "builder_yard_no": 1,
        "build_date": "2020-10-28",
        "keel_date": "2020-10-18"
        "root_url": "localhost:3000/",
    }

    Example response: 
    [
        {
            "model": "shipping_backend.registration",
            "pk": 1,   
            "fields": {
                "date_applied": "2020-11-17",
                "date_approved": "2020-11-17",
                "reg_state": "app_fee_pending",
                "registration_info": 1
            }
        }
    ]

    Errors {
        403 Error: Forbidden = "You do not have permission to perform this action."
            - This error means you forgot your authentication token.
        ValueError: "Ship name <ship_name> is not unique in port <port>"
            - Either the port or ship_name must be changed because this ship_name is no unique for this port.
        ValueError: "IMO number <imo_num> is invalid"
            - The IMO number does not conform to the IMO requirements.
    }
    """
    try:
        # Parse req for registration fields, then add vessel to user's vessels_list
        request_body = request.body
        loaded_body = json.loads(request_body)
        root_url = loaded_body.get('root_url')
        if root_url is None:
            return Response("Did not include 'root_url' in req body.", status=status.HTTP_400_BAD_REQUEST)

        vessel = add_vessel_to_db(loaded_body)

        user_object = get_user_profile(request.user)
        user_object.vessels_list.add(vessel)

        print(f'Added {vessel} to {user_object}')

        # Create registration and save
        registration = Registration.objects.create(registration_info=vessel, user=user_object.user, root_url=root_url)

        # Trigger state transition TODO: switch based on reg_status
        # if registration.reg_status == "NO_REG" : -> call the specific transition func
        registration.register_vessel()
        registration.save()

        # Serialize Registration object to send to frontend
        json_response = serializers.serialize('json', [registration])

        return HttpResponse(json_response, content_type='application/json')

    except Exception as e:
        return Response(f'Something went wrong with the request: {e}', status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def view_registration(request):
    """
    Endpoint for a Individual/Broker/Commericial user to view a single registration,
    given a "registration_id" which is the primary key for a registration. The user is authenticated and
    fetched via the required token in the request header.

    Example GET request: '/evessels/register/view/?registration_id=1
    
    Example response: 
    [
        {
            "model": "shipping_backend.registration",
            "pk": 1,   
            "fields": {
                "date_applied": "2020-11-17",
                "date_approved": "2020-11-17",
                "reg_state": "app_fee_pending",
                "registration_info": 1
            }
        }
    ]

    Errors {
        400 Error: Bad Request = "Requires 'registration_id' in GET request"
            - You must pass registration primary key as parameter in GET request
        403 Error: Forbidden = "You do not have permission to perform this action."
            - This error means you forgot your authentication token.
        404 Error: Not Found = "not found"
            - The registration with primary key "registration_id" is not associated with the user.
    }
    """

    # Parse req for registration pk
    reg_id = request.GET.get('registration_id')

    if reg_id is None:
        return Response("Requires 'registration_id' in request body", status=status.HTTP_400_BAD_REQUEST)

    # Get the registration object
    registration = get_object_or_404(Registration.objects, pk=reg_id)

    # Check that this owner actually owns the vessel that registration refers to
    user_object = get_user_profile(request.user)
    get_object_or_404(user_object.vessels_list, pk=registration.registration_info.pk)

    # Serialize Registration object to send to frontend
    json_response = serializers.serialize('json', [registration])

    return HttpResponse(json_response, content_type='application/json')


@api_view(["GET"])
def view_registrations(request):
    """
    Endpoint for a Individual/Broker/Commericial user to view all the registrations
    that the user owns. The user is authenticated and fetched via the required token
    in the request header. This GET request takes no arguments.        
    Example Response: 
    [
        {
            "model": "shipping_backend.registration",
            "pk": 1,   
            "fields": {
                "date_applied": "2020-11-17",
                "date_approved": "2020-11-17",
                "reg_state": "app_fee_pending",
                "registration_info": 1
            }
        },
        {
            "model": "shipping_backend.registration",
            "pk": 2,   
            "fields": {
                "date_applied": "2020-11-18",
                "date_approved": "2020-11-18",
                "reg_state": "app_fee_pending",
                "registration_info": 2
            }
        }
    ]
    
    Errors {
        403 Error: Forbidden = "You do not have permission to perform this action."
            - This error means you forgot your authentication token.
        404 Error: Not Found = "not found"
            - Could not find registration entires in DB.
    }

    """

    # Check that this owner actually owns the vessel that registration refers to
    user_object = get_user_profile(request.user)

    # Get all of this user's registrations
    regs = [get_object_or_404(Registration.objects, registration_info=v) for v in user_object.vessels_list.all()]

    # Serialize Registration object to send to frontend
    json_response = serializers.serialize('json', regs)

    return HttpResponse(json_response, content_type='application/json')


@api_view(["GET"])
def view_all_users(request):
    """
    An endpoint for Registrars only. Returns list of all individual, broker and commercial users.
    The user is authenticated and fetched via the required token in the request header. 
    This GET request takes no arguments.        
    Example Response: 
    {
        {'id': 2,
        'last_login': None,
        'is_superuser': False,
        'username': 'username_i',
        'email': '',
        'is_staff': False,
        'is_active': True,
        'date_joined': '2020-12-03 04:25:05.379230+00:00',
        'first_name': 'Individual',
        'last_name': 'User',
        'user_type': 1}
    }

    Errors {
        403 Error: Forbidden = "You do not have permission to perform this action."
            - This error means you forgot your authentication token.
        403 Error: Forbidden = "Error must be a registrar"
        - Only Registar users are allowed to access this endpoint.
    }
    """
    # Ensure request coming from a registrar
    user_object = get_user_profile(request.user)

    if user_object.get_user_type() is not "registrar":
        return Response("Error must be a registrar", status=status.HTTP_403_FORBIDDEN)

    # Get all the registration objects
    users = User.objects.all().filter(Q(user_type=1) | Q(user_type=2) | Q(user_type=3))
    user_prof = []

    for user in users:
        del user.__dict__['_state']
        del user.__dict__['password']
        user.__dict__['date_joined'] = str(user.date_joined)
        user_prof.append(user.__dict__)

    # Serialize Registration object to send to frontend
    json_response = json.dumps(user_prof)
    return HttpResponse(json_response, content_type='application/json')


@api_view(["GET"])
def view_all_approved_registrations(request):
    """
    An endpoint for Registrars only. Returns all of the registrations in the state
    'reg_approved'. The user is authenticated and fetched via the required token in the request header. 
    This GET request takes no arguments.        

    Example Response: 
    {

    }

    Errors {
        403 Error: Forbidden = "You do not have permission to perform this action."
            - This error means you forgot your authentication token.
        403 Error: Forbidden = "Error must be a registrar"
        - Only Registar users are allowed to access this endpoint.
    }
    """
    # Ensure request coming from a registrar
    user_object = get_user_profile(request.user)

    if user_object.get_user_type() is not "registrar":
        return Response("Error must be a registrar", status=status.HTTP_403_FORBIDDEN)

    # Get all the registration objects
    registrations = Registration.objects.all().filter(reg_state="reg_approved")

    # Serialize Registration object to send to frontend
    json_response = serializers.serialize('json', registrations)
    return HttpResponse(json_response, content_type='application/json')


@api_view(["GET"])
def view_application(request):
    """
    An endpoint for Registrars only to view a single registration in the DB. 
    This is different than the 'vessels/register/view' endpoint
    because this doesn't require you to be associated with the vessel as you are a registrar.
    The user is authenticated and fetched via the required token in the request header. 
    This GET request requires the 'registration_id' argument which is the primary key of the 
    registration in DB.   

    Example GET request: '/applications/view/?registration_id=1'

    Example response: 
    [
        {
            "id": 1,
            "date_applied": "2020-11-17",
            "date_approved": "2020-11-17",
            "reg_state": "app_fee_pending",
            "registration_info_id": 1
            "user_id": 1,
            "ship_name": 'Test0',
            ...
        }
    ]

    Errors {
        400 Error: Bad Request = "Requires 'registration_id' in GET request"
            - You must pass registration primary key as parameter in GET request
        403 Error: Forbidden = "You do not have permission to perform this action."
            - This error means you forgot your authentication token.
        403 Error: Forbidden = "Error must be a registrar"
        - Only Registar users are allowed to access this endpoint.
        404 Error: Not Found = "not found"
        - A registration with primary key 'registration_id' could not be found.
    }
    """
    reg_id = request.GET.get('registration_id')

    if reg_id is None:
        return Response("Requires 'registration_id' in GET request", status=status.HTTP_400_BAD_REQUEST)

    # Ensure request coming from a registrar
    user_object = get_user_profile(request.user)

    if user_object.get_user_type() is not "registrar":
        return Response("Error must be a registrar", status=status.HTTP_403_FORBIDDEN)

    # Get all the registration objects
    registration = get_object_or_404(Registration.objects, pk=reg_id)
    vessel_pk = registration.__dict__.get('registration_info_id')
    vessel = Vessel.objects.get(pk=vessel_pk)
    registration.__dict__.update(vessel.__dict__)
    del registration.__dict__['_state']
    registration.__dict__['date_applied'] = str(registration.__dict__['date_applied'])
    registration.__dict__['date_approved'] = str(registration.__dict__['date_approved'])
    registration.__dict__['date_created'] = str(vessel.date_created)
    registration.__dict__['build_date'] = str(vessel.build_date)
    registration.__dict__['keel_date'] = str(vessel.keel_date)
    # Add user info to the response
    regs_user = User.objects.get(pk=registration.__dict__['user_id'])
    registration.__dict__['first_name'] = regs_user.first_name
    registration.__dict__['last_name'] = regs_user.last_name

    # Serialize Registration object to send to frontend
    json_response = json.dumps([registration])

    return HttpResponse(json_response, content_type='application/json')


@api_view(["GET"])
def view_applications(request):
    """
    An endpoint for Registrars to view all registrations in a particular state.
    This is different than the '/registrations/view/all/' endpoint
    because this is a more refined query as opposed to returning all completed registrations.
    The user is authenticated and fetched via the required token in the request header. 
    This GET request requires the 'registration_status' argument which is state of registrations
    we are restricting the query to.

    Possible values 'registration_status' can be: 
        - '' (if argument is empty, returns ALL registrations of ANY state)
        - 'unregistered_vessel'
        - 'app_fee_pending'
        - 'reg_fee_pending'
        - 'pending_reg_approval'
        - 'reg_approved'
        - 'reg_rejected'
        - 'reg_completed'

    Example GET request: '/applications/view/?registration_status=app_fee_pending'

    Example response: 
    [
        {
            "id": 1,
            "date_applied": "2020-11-17",
            "date_approved": "2020-11-17",
            "reg_state": "app_fee_pending",
            "registration_info_id": 1
            "user_id": 1,
            "ship_name": 'Test0',
            ...
        }
    ]

    Errors {
        400 Error: Bad Request = "Requires 'registration_status' to be one of 
        ['', 'unregistered_vessel', 'app_fee_pending', 'reg_fee_pending', pending_reg_approval',
        reg_approved, reg_rejected, reg_completed']
            - You must use a valid registration status
        403 Error: Forbidden = "You do not have permission to perform this action."
            - This error means you forgot your authentication token.
        403 Error: Forbidden = "Error must be a registrar"
        - Only Registar users are allowed to access this endpoint.
    }
    """
    reg_status = request.GET.get('registration_status')

    # Ensure request coming from a registrar
    user_object = get_user_profile(request.user)

    if user_object.get_user_type() is not "registrar":
        return Response("Error must be a registrar", status=status.HTTP_403_FORBIDDEN)

    # Get all the registration objects
    if reg_status is None:
        registrations = Registration.objects.all()

    elif reg_status in [s for s, _ in Registration.STATES]:
        registrations = Registration.objects.all().filter(reg_state=reg_status)

    else:
        return Response(f"'registration_status' must be in {[s for s, _ in Registration.STATES]}",
                        status=status.HTTP_400_BAD_REQUEST)

    applications = []
    for registration in registrations:
        vessel_pk = registration.__dict__.get('registration_info_id')
        vessel = Vessel.objects.get(pk=vessel_pk)
        registration.__dict__.update(vessel.__dict__)
        del registration.__dict__['_state']
        registration.__dict__['date_applied'] = str(registration.__dict__['date_applied'])
        registration.__dict__['date_approved'] = str(registration.__dict__['date_approved'])
        registration.__dict__['date_created'] = str(vessel.date_created)
        registration.__dict__['build_date'] = str(vessel.build_date)
        registration.__dict__['keel_date'] = str(vessel.keel_date)

        # Add user info to the response
        regs_user = User.objects.get(pk=registration.__dict__['user_id'])
        registration.__dict__['first_name'] = regs_user.first_name
        registration.__dict__['last_name'] = regs_user.last_name
        applications.append(registration.__dict__)

    # Serialize Registration object to send to frontend
    # json_response = serializers.serialize('json', registrations)
    json_response = json.dumps(applications)
    return HttpResponse(json_response, content_type='application/json')


@api_view(["GET", "POST"])
@permission_classes((HasAPIKey,))
@authentication_classes([])
def survey_vessel(request):
    """
    An endpoint for Surveyors to view the vessels they are allowed to survey.
    Requires use of an API key.

    Errors {
        404 Error: Not Found - "not found"
        - A surveyor with this API key could not be found.
    }
    """
    if request.method == "GET":
        key = request.META["HTTP_AUTHORIZATION"].split()[1]
        api_key = APIKey.objects.get_from_key(key)

        # Get Surveyor instance from api key
        surveyor = get_object_or_404(Surveyor, api_key=api_key)
        surveyor_vessels = surveyor.vessels_list.all()

        json_response = serializers.serialize('json', surveyor_vessels)
        return HttpResponse(json_response, content_type='application/json')

    elif request.method == "POST":
        # TODO: allow surveyor to review vessels with API key
        return Response(status=status.HTTP_501_NOT_IMPLEMENTED)


@api_view(["POST"])
def assign_vessels_to_surveyor(request):
    """
    This endpoint allows for a registrar to assign which vessels a surveyor is allowed to use.
    The registrar must supply a 'surveyor_name' and a list of vessel primary keys.

    Example Request: 
    {
        "surveyor_name": "The Surveyor Company",
        "vessel_pks": [1, 2, 3]
    }
    
    Finds vessels with primary keys 1, 2, and 3, then adds them to the surveyor's list.

    Errors {
        400 Error: Bad Request = "Requires 'vessel_pks' in request body"
        - The registrar forgot the required vessel_pks argument.
        400 Error: Bad Request = "Vessel with pk <pk> does not exist"
        - One or more of the supplied vessel primary keys does not exist in DB.
        403 Error: Forbidden = "You do not have permission to perform this action."
            - This error means you forgot your authentication token.
        403 Error: Forbidden = "Error must be a registrar"
        - Only Registar users are allowed to access this endpoint.
        404 Error: Not Found = "not found"
        - Could not find the surveyor using 'surveyor_name' required argument.
    }
    """
    try:
        request_body = request.body
        loaded_body = json.loads(request_body)
        vessel_pks = loaded_body.get('vessel_pks')
        surveyor_name = loaded_body.get('surveyor_name')

        if vessel_pks is None:
            return Response("Requires 'vessel_pks' in request body", status=status.HTTP_400_BAD_REQUEST)

        # Ensure request coming from a registrar
        user_object = get_user_profile(request.user)

        if user_object.get_user_type() is not "registrar":
            return Response("Error must be a registrar", status=status.HTTP_403_FORBIDDEN)

        # Ensure the primary keys correspond to real vessels
        matched_vessels = []

        for pk in vessel_pks:
            try:
                vessel = Vessel.objects.get(pk=pk)
                matched_vessels.append(vessel)

            except Vessel.DoesNotExist:
                return Response(f'Vessel with pk {pk} does not exist', status=status.HTTP_400_BAD_REQUEST)

        surveyor = get_object_or_404(Surveyor, surveyor_name=surveyor_name)

        surveyor.vessels_list = matched_vessels
        surveyor.save()

        json_response = serializers.serialize('json', [surveyor])
        return HttpResponse(json_response, content_type='application/json')

    except Exception as e:
        return Response(f'Something went wrong with the request: {e}', status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def review_application(request):
    """
    This Registrar-only endpoint allows a registrar to accept or reject an application.
    
    Possible "decision" values = {"approved", "rejected"}

    Example Request: 
    {
        "registration_id": 1,
        "decision": "approved"
    }

    Errors {
        400 Error: Bad Request = "Requires 'registration_id' in request body"
        - The registrar forgot the required 'registration_id' argument.
        400 Error: Bad Request = "Invalid decision entered"
        - The "decision" in the request was not in {"approved", "denied"}
        400 Error: Bad Request = "Cannot update from <cur_state> -> 'reg_approved'"
        - The applied "decision" is not allowed based on registrations current state.
        403 Error: Forbidden = "You do not have permission to perform this action."
            - This error means you forgot your authentication token.
        403 Error: Forbidden = "Error must be a registrar"
        - Only Registar users are allowed to access this endpoint.
        404 Error: Not Found = "not found"
        - Could not find the registration using 'registration_id' required argument.
    }
    """
    request_body = request.body
    loaded_body = json.loads(request_body)
    reg_id = loaded_body.get('registration_id')
    print(loaded_body, reg_id)

    if reg_id is None:
        return Response("Requires 'registration_id' in request body", status=status.HTTP_400_BAD_REQUEST)

    # Ensure request coming from a registrar
    user_object = get_user_profile(request.user)

    if user_object.get_user_type() is not "registrar":
        return Response("Error must be a registrar", status=status.HTTP_403_FORBIDDEN)

    registration = get_object_or_404(Registration.objects, pk=reg_id)

    if registration.reg_state != "pending_reg_approval":
        return Response(f"Cannot update from {registration.reg_state} -> 'reg_approved'",
                        status=status.HTTP_400_BAD_REQUEST)

    decision = loaded_body.get('decision')

    if decision not in ["approved", "rejected"]:
        return Response(f"Invalid decision entered.",
                        status=status.HTTP_400_BAD_REQUEST)

    if decision == "approved":
        registration.approve_reg()
        registration.save()
        url = registration.root_url
        id = registration.pk
        msg = f"Click on the following link: http://{url}/payment/{id} to pay $100."
        email_body = f'The application for your vessel {registration.registration_info.ship_name} was approved! ' + msg

    else:
        registration.reject_reg()
        registration.save()
        email_body = f'The application for your vessel {registration.registration_info.ship_name} was rejected!'

    # Notify user of application status
    send_mail(
        subject='Your application status',
        message=email_body,
        from_email='support@teamatlas.com',
        recipient_list=[registration.user.username],
        fail_silently=False,
    )

    # Serialize Registration object to send to frontend
    json_response = serializers.serialize('json', [registration])

    return HttpResponse(json_response, content_type='application/json')


@api_view(["POST"])
def pay_app_fee(request):
    """
    This endpoint allows a user to pay for their application fee. This currently
    does not perform any real transactions, but is in place to allow state
    transitions of the Registration object. The user is authenticated and fetched 
    via the required token in the request header. 

    Example Request:
    {
        "registration_id": 1,
        "payment_amount": 10
    }

    Errors {
        400 Error: Bad Request = "Requires 'registration_id' in request body"
        - The user forgot the required 'registration_id' argument.
        400 Error: Bad Request = "Requires 'payment_amount' in request body"
        - The user forgot the required 'payment_amount' argument.
        400 Error: Bad Request = "Requires 'payment_amount' to be positive integer"
        - The user did not post a positive integer for payment amount.
        400 Error: Bad Request = "Application fee is not pending for this registration"
        - The user attempted to pay but their registration is not in the 'app_fee_pending' state.
        403 Error: Forbidden = "Registrars cannot pay"
        - A registrar attempted to use this endpoint which is not allowed.
        - This error means you forgot your authentication token.
        403 Error: Forbidden = "You do not have permission to perform this action."
        - This error means you forgot your authentication token.
        403 Error: Forbidden = "Error must be a registrar"
        - Only Registar users are allowed to access this endpoint.
        404 Error: Not Found = "not found"
        - Could not find the registration using 'registration_id' required argument.
    }
    """
    request_body = request.body
    loaded_body = json.loads(request_body)
    reg_id = loaded_body.get('registration_id')
    pay_amt = loaded_body.get('payment_amount')

    if reg_id is None:
        return Response("Requires 'registration_id' in request body", status=status.HTTP_400_BAD_REQUEST)

    if pay_amt is None:
        return Response("Requires 'payment_amount' in request body", status=status.HTTP_400_BAD_REQUEST)

    elif pay_amt < 0:
        return Response("Requires 'payment_amount' to be positive integer", status=status.HTTP_400_BAD_REQUEST)

    # Get the registration object
    registration = get_object_or_404(Registration.objects, pk=reg_id)

    # check that this owner actually owns the vessel that registration refers to
    user_object = get_user_profile(request.user)

    if user_object.get_user_type() is "registrar":
        return Response(f"Registrars cannot pay", status=status.HTTP_403_FORBIDDEN)

    get_object_or_404(user_object.vessels_list, pk=registration.registration_info.pk)

    if registration.reg_state != "app_fee_pending":
        return Response(f"Application fee is not pending for this registration", status=status.HTTP_400_BAD_REQUEST)

    # TODO stripe call => if pay_amt > Pricing.objects.get().app_fee_amt: stripe.call(pay_amt)

    registration.pay_app_fee()
    registration.save()

    # Serialize Registration object to send to frontend
    json_response = serializers.serialize('json', [registration])

    return HttpResponse(json_response, content_type='application/json')


@api_view(["POST"])
@permission_classes((AllowAny,))
@authentication_classes([])
def register_user(request):
    """
    The endpoint to register a new user. The response contains the authentication
    token to supplied in the header for future API usage.

    "user_type" options = {
        1 => individual,
        2 => broker,
        3 => commericial,
        4 => registrar,
    }

    "eligibiltiy" options for Non-Commerical = {
        1 => ’UK Citizen’, 
        2 => ’British Dependent Territories Citizen’, 
        3 => ’British Overseas Citizen’, 
        4 => ’Commonwealth Citizen’, 
        5 => ’Non-Uk National settled in UK’, 
        6 => ’Citizen of EU Member State Under Articles 48 or 52'
    }

    "eligibiltiy" options for Commerical = {
        1 => 'Company Incorporated in Navis Album',
        2 => 'Company Incorporated in any British Dependent Territory',
        3 => 'Company Incorporated in EEA Country',
        4 => 'Company Incorporated in any British Overseas Possession'
        5 => 'Company Incorporated in EEIG',
        6 => 'Company Incorporated in Commonwealth State'
    }

    Example Request: 
    {
        "username": "user@company.com",
        "password": "secretpassword",
        "first_name": "John",
        "last_name": "Snow"
        "user_type": 1,
        "eligibility": 2
    }

    Example Response:
    {
        "token": "0bb3f4dc89d13b9d008ba85ef6fac4b5e723ea7d",
        "first_name": "John",
        "last_name": "Snow",
        "user_type": 1
    }

    Token usage in header for future requests: 
    header = {"Authorization": "Token 0bb3f4dc89d13b9d008ba85ef6fac4b5e723ea7d"}

    Errors {
        400 Error: Bad Request = "Something went wrong with the request:"
        - The user did not include the required arguments or mispelled them in the POST body. 
    }
    """
    try:
        request_body = request.body
        loaded_body = json.loads(request_body)

        username = loaded_body['username']
        password = loaded_body['password']
        first_name = loaded_body['first_name']
        last_name = loaded_body['last_name']

        User.objects.create_user(username=username,
                                 password=password,
                                 first_name=first_name,
                                 last_name=last_name,
                                 user_type=loaded_body['user_type'],
                                 eligibility=loaded_body['eligibility'])

        user = authenticate(username=username, password=password)

        token = ExpiringToken.objects.get_or_create(user=user)

        return Response(
            dict(token=token[0].key, first_name=user.first_name, last_name=user.last_name, user_Type=user.user_type),
            status=HTTP_200_OK)

    except Exception as e:
        return Response(f'Something went wrong with the request: {e}', status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes((AllowAny,))
@authentication_classes([])
def login(request):
    """
    The endpoint to login a user. This endpoint returns the authentication token required
    for API endpoint access.

    Example Request: 
    {
        "username": "user@company.com",
        "password": "secretpassword",
    }

    Example Response:
    {
        "token": "0bb3f4dc89d13b9d008ba85ef6fac4b5e723ea7d",
        "first_name": "John",
        "last_name": "Snow"
        "user_type": 1
    }
    Errors {
        400 Error: Bad Request = "Something went wrong with the request:"
        - The user did not include the required arguments or mispelled them in the POST body. 
        401 Error: Unauthorized = "Incorrect credentials"
        - Either username or password was incorrect and a user could not be foudn to authorize
    }
    """
    try:
        request_body = request.body
        loaded_body = json.loads(request_body)

        username = loaded_body['username']
        password = loaded_body['password']

        user = authenticate(username=username, password=password)

        if user is None:
            return Response('Incorrect credentials', status=HTTP_401_UNAUTHORIZED)

        token = ExpiringToken.objects.get_or_create(user=user)

        return Response(
            dict(token=token[0].key, first_name=user.first_name, last_name=user.last_name, user_type=user.user_type),
            status=HTTP_200_OK)

    except Exception as e:
        return Response(f'Something went wrong with the request: {e}', status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def get_pricing(request):
    pricing_objects = Pricing.objects.all()
    json_response = serializers.serialize('json', pricing_objects)
    return HttpResponse(json_response, content_type='application/json')


@api_view(["DELETE"])
def delete_vessel(request):
    user_object = get_user_profile(request.user)
    # Check if user is owner of vessel with id

    # If true, then query for the vessel object
    # Update vessel.was_deleted = True

    # Else
    pass


@api_view(["GET"])
def check_unique_ship_name_in_port(request):
    ship_name = request.GET.get('ship_name')
    port = int(request.GET.get('port'))
    if ship_name is None or port is None:
        return Response("must include 'ship_name' and 'port' in GET query parameter",
                        status=status.HTTP_400_BAD_REQUEST)

    return HttpResponse(json.dumps({'is_unique': is_vessel_name_unique_in_port(ship_name, port)}),
                        content_type='application/json')


@api_view(["GET"])
def stripe_config(request):
    stripe_config = {'publicKey': settings.STRIPE_PUBLISHABLE_KEY}
    print(stripe_config)
    return HttpResponse(json.dumps(stripe_config), content_type='application/json')


@api_view(['POST'])
def save_stripe_info(request):
    stripe.api_key = settings.STRIPE_SECRET_KEY

    data = request.data
    email = data['email']

    if email != request.user.username:
        print("BAD EMAIL")
        return Response("Email address does not match your account's", status=status.HTTP_400_BAD_REQUEST)

    reg_id = data.get('reg_id')

    if reg_id is None:
        return Response("Did not include reg id", status=status.HTTP_400_BAD_REQUEST)

    payment_method_id = data['payment_method_id']
    extra_msg = ''

    fee_type = str(data.get('fee_type'))

    if fee_type != "appfee" and fee_type != "regfee":
        return Response("Did not include fee_type = {'appfee', 'regfee'}", status=status.HTTP_400_BAD_REQUEST)

    reg = get_object_or_404(Registration, pk=reg_id)

    if fee_type == "appfee" and reg.reg_state != "app_fee_pending":
        return Response("Incorrect State", status=status.HTTP_400_BAD_REQUEST)

    if fee_type == "regfee" and reg.reg_state != "reg_fee_pending":
        return Response("Incorrect State", status=status.HTTP_400_BAD_REQUEST)

    # checking if customer with provided email already exists
    customer_data = stripe.Customer.list(email=email).data
    print(customer_data)

    amount = 5000 if fee_type == "appfee" else 10000

    if len(customer_data) == 0:
        # creating customer
        customer = stripe.Customer.create(
            email=email,
            payment_method=payment_method_id,
            invoice_settings={
                'default_payment_method': payment_method_id
            }
        )
    else:
        customer = customer_data[0]
        extra_msg = "Customer already exists."

    # creating paymentIntent
    try:
        stripe.PaymentIntent.create(customer=customer,
                                    payment_method=payment_method_id,
                                    currency='usd', amount=amount,
                                    confirm=True)
    except stripe.error.CardError as e:
        return Response(f"Problem with payment method: {e}", status=status.HTTP_400_BAD_REQUEST)

    # Handle state transitions
    if fee_type == "appfee":
        reg.pay_app_fee()
        reg.save()

    else:
        reg.pay_reg_fee()
        reg.save()

        file_name = gen_reg_certificate(Vessel.objects.get(pk = reg.registration_info_id).__dict__, email)

        email = EmailMessage(
            subject='Your registration proof',
            body='Attached is the registration proof for your vessel',
            from_email='support@teamatlas.com',
            to=[reg.user.username]
        )

        email.attach_file(file_name)

        email.send(fail_silently=False)

    return Response(status=status.HTTP_200_OK,
                    data=dict(message=f'Success updated {reg_id} to {reg.reg_state}', data=dict(customer_id=customer.id,
                                                                                                extra_msg=extra_msg)))
