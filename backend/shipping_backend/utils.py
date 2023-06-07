from django.shortcuts import get_object_or_404

from .models import Vessel, Individual, Broker, Commercial, Registrar


def is_imo_valid(imo_num):
    # "IMO" + 7 digit number The rightmost digit of this sum is the check digit.
    # For example, for IMO 9074729: (9×7) + (0×6) + (7×5) + (4×4) + (7×3) + (2×2) = 139
    imo_num = str(imo_num)

    if len(imo_num) != 10:
        print("ERROR IMO INCORRECT LENGTH")
        return False

    if not imo_num[:3].isalpha():
        print("ERROR FIRST 3 CHARS MUST BE ALPHA")
        return False

    digits = imo_num[3:]

    if not digits.isdecimal():
        print("ERROR LAST 7 CHARS MUST BE INTEGERS")
        return False

    checksum = sum([int(n) * i for n, i in zip(digits, range(len(digits), 1, -1))])

    if digits[-1] != str(checksum)[-1]:
        print(f"CHECKSUM FAILED: {digits[-1]} != {str(checksum)[-1]}")
        return False

    return True


def is_vessel_name_unique_in_port(ship_name, port):
    vessels = Vessel.objects.all().filter(ship_name=ship_name)

    if vessels is None:
        return True

    for v in vessels:
        if v.port == port:
            return False

    return True


def add_vessel_to_db(req_body):
    ship_name = req_body.get('ship_name')
    port = req_body.get('port')
    print(req_body)

    if not is_vessel_name_unique_in_port(ship_name, port):
        print("name not unique")
        raise ValueError(f'Ship name {ship_name} is not unique in port {port}')

    vessel_dict = dict(ship_name=req_body.get('ship_name'),
            length=req_body.get('length'),
            hull_id=req_body.get('hull_id'),
            num_hull=req_body.get('num_hull'),
            prop_method=req_body.get('prop_method'),
            port=port,
            joint_owners=req_body.get('joint_owners'),
            was_deleted=False)

    ship_type = req_body.get('ship_type')
    if ship_type == 1:
        vessel_dict['ship_type'] = ship_type
        vessel_dict['personal_vessel_type'] = req_body.get('personal_vessel_type') 
        vessel_dict['personal_model'] = req_body.get('personal_model') 
    elif ship_type == 2:
        imo_num = req_body.get('imo_num')
        if not is_imo_valid(imo_num):
            raise ValueError(f'IMO number {imo_num} is invalid')

        # TODO need to check if all of these are here
        mmsi = req_body.get('mmsi')
        call_sign = req_body.get('call_sign')
        #TODO add test to see if mmsi and call_sign are valid form
        vessel_dict['ship_type'] = ship_type
        vessel_dict['tonnage'] = req_body.get('tonnage')
        vessel_dict['imo_num'] = imo_num
        vessel_dict['width'] = req_body.get('width')
        vessel_dict['depth'] = req_body.get('depth')
        vessel_dict['mmsi'] = mmsi
        vessel_dict['call_sign'] = call_sign
        vessel_dict['prop_power'] = req_body.get('prop_power')
        vessel_dict['num_engine'] = req_body.get('num_engine') 
        vessel_dict['builder_name'] = req_body.get('builder_name')
        vessel_dict['builder_addr'] = req_body.get('builder_addr')
        vessel_dict['builder_yard_no'] = req_body.get('builder_yard_no')
        vessel_dict['build_date'] = req_body.get('build_date')
        vessel_dict['keel_date'] = req_body.get('keel_date')
    else:
        print("DIDNT ADD SHIP TYPE  ")
        raise ValueError(f'ship_type required')

    return Vessel.objects.create(**vessel_dict)


def compare_dicts_strings(dictionary_a: dict, dictionary_b: dict):
    common_pairs = dict()
    all_match = True

    for key in dictionary_a:
        if key in dictionary_b and str(dictionary_a[key]) == str(dictionary_b[key]):
            common_pairs[key] = dictionary_a[key]

        else:
            print(f'{str(dictionary_a[key])} != {str(dictionary_b[key])}')
            all_match = False

    return all_match


def get_user_profile(user):
    # Return Individual, Broker, Commercial, or Registrar model instance
    if user.is_individual():
        return get_object_or_404(Individual.objects, user=user)

    elif user.is_broker():
        return get_object_or_404(Broker.objects, user=user)

    elif user.is_commercial():
        return get_object_or_404(Commercial.objects, user=user)

    elif user.is_registrar():
        return get_object_or_404(Registrar.objects, user=user)

    else:
        pass  # TODO ADMIN and error
