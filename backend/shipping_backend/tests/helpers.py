import random
import string

from ..models import Vessel


def create_mock_vessel(ship_name, port, ship_choices, just_dict=False):
    # Generate random IMO number
    imo_alpha = "".join([random.choice(string.ascii_uppercase) for i in range(3)]) + "1234567"
    
    # generate random hin
    hull_id = "".join([random.choice(string.ascii_uppercase) for i in range(3)]) + str(random.randint(10000,99999)) + "H458" 

    vessel_dict = dict(ship_name=ship_name,
            length=100,
            hull_id=hull_id,
            num_hull=1,
            prop_method=1,
            port=port,
            joint_owners=[['owner0', '100', 'British Overseas Citizen']],
            was_deleted=False)

    if ship_choices == "private":
        vessel_dict['ship_type'] = 1
        vessel_dict['personal_vessel_type'] = 1
        vessel_dict['personal_model'] = 'Benneteau 26'

    else:
        vessel_dict['ship_type'] = 2
        vessel_dict['tonnage'] = 100
        vessel_dict['imo_num'] = imo_alpha
        vessel_dict['width'] = 100
        vessel_dict['depth'] = 100
        vessel_dict['mmsi'] = str(random.randint(100000000, 999999999))
        vessel_dict['call_sign'] = "1" + "".join([random.choice(string.ascii_uppercase) for i in range(3)]) + "2" 
        vessel_dict['prop_power'] = 10
        vessel_dict['num_engine'] = 1
        vessel_dict['builder_name'] ='Bob the builder'
        vessel_dict['builder_addr'] ='123 street'
        vessel_dict['builder_yard_no'] = 1
        vessel_dict['build_date'] = '2020-10-28'
        vessel_dict['keel_date'] = '2020-10-18'

    if just_dict:
        return vessel_dict

    new_vessel = Vessel.objects.create(**vessel_dict)

    return new_vessel
