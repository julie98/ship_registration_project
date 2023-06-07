import random
import string
import json
from copy import deepcopy
# Run this file: 'python manage.py shell < init_users.py'

DEFAULT_ADMIN_USER = 'admin'
DEFAULT_ADMIN_PASS = 'TeamAtlas1!'
HASHED_PASS = "pbkdf2_sha256$216000$SxgXqgFLgmtI$ISaCd0HIZxzVsQ1zOrTw19HiVDP9u/k2Xl3eyEMK/xY="
ADMIN_ROLE = 5

REG_STATES = ["unregistered_vessel", "app_fee_pending", "reg_fee_pending", "pending_reg_approval", "reg_approved", "reg_rejected", "reg_completed"]

def make_reg(vessel_pk, user_pk):
    fields = dict(date_applied='2020-10-28',
            date_approved='2020-10-28',
            reg_state=random.choice(REG_STATES),
            registration_info=vessel_pk,
            user=user_pk)

    return dict(model="shipping_backend.registration", pk=vessel_pk, fields=fields)


vessels = []
num_vessels = 31
for i in range(1, num_vessels):
    imo_num = "".join([random.choice(string.ascii_uppercase) for i in range(3)]) + "1234567"
    hull_id = "".join([random.choice(string.ascii_uppercase) for i in range(3)]) + str(random.randint(10000,99999)) + "H458" 
    fields = dict(ship_name="ship_name" + str(i),
            length=100,
            hull_id=hull_id,
            num_hull=1,
            prop_method=1,
            port=1,
            joint_owners=[['owner0', '100', 'British Overseas Citizen']],
            was_deleted=False)

    if i < 21:
        fields['ship_type'] = 1
        fields['personal_vessel_type'] = 1
        fields['personal_model'] = 'Benneteau 26'

    else:
        mmsi = str(random.randint(100000000, 999999999))
        call_sign = "1" + "".join([random.choice(string.ascii_uppercase) for i in range(3)]) + "2"
        fields['ship_type'] = 2
        fields['tonnage'] = 100
        fields['imo_num'] = imo_num
        fields['width'] = 100
        fields['depth'] = 100
        fields['mmsi'] = mmsi
        fields['call_sign'] = call_sign 
        fields['prop_power'] = 10
        fields['num_engine'] = 1
        fields['builder_name'] ='Bob the builder'
        fields['builder_addr'] ='123 street'
        fields['builder_yard_no'] = 1
        fields['date_created'] ='2020-10-28'
        fields['build_date'] = '2020-10-28'
        fields['keel_date'] = '2020-10-18'


    vessels.append(dict(model="shipping_backend.vessel", pk=i, fields=fields))


users = []
user_profs = []
regs = []
num_each_user = 5
users_made = 1
vessel_cnt = 1
for (u_cnt, u_type) in enumerate(["individual", "broker", "commercial", "registrar"]):
    for i in range(num_each_user):
        fields = dict(first_name=u_type + "_first_name" + str(i),
            last_name=u_type + "_last_name" + str(i),
            user_type=u_cnt + 1,
            username=u_type + str(i) + "@test.com",
            password=HASHED_PASS)

        users.append(dict(model="shipping_backend.user", pk=users_made, fields=fields))

        prof_fields = dict(user=users_made)
        
        if u_type is "individual":
            prof_fields["eligibility"] = 1
            prof_fields["vessels_list"] = vessel_cnt,
            prof_fields["mailing_addr"] = "123 street, santa cruz",
            prof_fields["phone_nbr"] = "123-456-7890",
            regs.append(make_reg(vessel_cnt, users_made))
            vessel_cnt += 1
        
        elif u_type is "commercial": 
            prof_fields["eligibility"] = 1
            prof_fields["tonnage"] = 1
            prof_fields["vessels_list"] = [v for v in range(vessel_cnt, vessel_cnt + 2)]
            regs.extend([make_reg(v, users_made) for v in range(vessel_cnt, vessel_cnt + 2)])
            vessel_cnt += 2
        
        elif u_type is "broker":
            prof_fields["vessels_list"] = [v for v in range(vessel_cnt, vessel_cnt + 3)]
            regs.extend([make_reg(v, users_made) for v in range(vessel_cnt, vessel_cnt + 3)])
            vessel_cnt += 3
        
        else:
            prof_fields["reviewed_vessels"] = []
            prof_fields["pending_vessels"] = []
            

        user_profs.append(dict(model="shipping_backend." + u_type, pk=users_made, fields=prof_fields))
        users_made += 1




with open('shipping_backend/fixtures/vessel_data.json', 'w') as outfile:
    json.dump(vessels, outfile, indent=4, separators=(',', ': '), sort_keys=True)

with open('shipping_backend/fixtures/user_data.json', 'w') as outfile:
    json.dump(users, outfile, indent=4, separators=(',', ': '), sort_keys=True)

with open('shipping_backend/fixtures/user_prof_data.json', 'w') as outfile:
    json.dump(user_profs, outfile, indent=4, separators=(',', ': '), sort_keys=True)

with open('shipping_backend/fixtures/registration_data.json', 'w') as outfile:
    json.dump(regs, outfile, indent=4, separators=(',', ': '), sort_keys=True)
