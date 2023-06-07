from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import ArrayField
from django.db import models
from django_fsm import transition, FSMField

from .managers import UserManager

max_str_len = 100


class Vessel(models.Model):
    # Fields common to both vessel types
    ship_name = models.CharField(max_length=max_str_len)
    ship_choices = (
        (1, 'private'),
        (2, 'commercial')
    )

    ship_type = models.PositiveSmallIntegerField(choices=ship_choices)
    length = models.IntegerField()

    hull_id = models.CharField(max_length=12)
    num_hull = models.PositiveSmallIntegerField()

    prop_choices = (
        (1, 'Sail'),
        (2, 'Non-propelled'),
        (3, 'Steam'),
        (4, 'Motor'),
        (5, 'Propellor'),
        (6, 'Pumpjet'),
        (7, 'Voith-Schneider Cyclo-Rotor'),
        (8, 'Paddle Wheel'),
        (9, 'Caterpillar')
    )
    prop_method = models.PositiveSmallIntegerField(choices=prop_choices)
    
    # List of Users
    # Array of 3: owner name, owner percentage, eligibility choice (description), all all string
    joint_owners = ArrayField(ArrayField(models.CharField(max_length=100), size=3), size=50)
    was_deleted = models.BooleanField()  # In case owner deletes vessel from their list
    
    # Fields Specific to Pleasure Vessel
    personal_vessel_choices = (
        (1, 'Barge'),
        (2, 'Dinghy'),
        (3, 'Hovercraft'),
        (4, 'Inflatable'),
        (5, 'Motor Sailer'),
        (6, 'Motor Yacht'),
        (7, 'Narrow Boat'),
        (8, 'Sailing Yacht'),
        (9, 'Sports Yacht'),
        (10, 'Wet Bike')
    )
    personal_vessel_type = models.PositiveSmallIntegerField(choices=personal_vessel_choices, null=True, blank=True)
    personal_model = models.CharField(max_length=max_str_len, blank=True, null=True)
    
    port_choices = (
        (1, 'Whitby Harbour'),
        (2, 'Point Newcastle'),
        (3, 'Robin Hood\'s Bay'),
        (4, 'Victoria'),
    )
    port = models.PositiveSmallIntegerField(choices=port_choices)
    
    # Fields Specific to Commercial Vessel
    tonnage = models.BigIntegerField(null=True, blank=True)
    # "IMO" + 7 digit number The rightmost digit of this sum is the check digit. For example, for IMO 9074729: (9×7) + (0×6) + (7×5) + (4×4) + (7×3) + (2×2) = 139
    imo_num = models.CharField(max_length=10, unique=True, null=True, blank=True)
    width = models.PositiveSmallIntegerField(null=True, blank=True)
    depth = models.PositiveSmallIntegerField(null=True, blank=True)
    # Type of commercial vessel: 
    commer_type = ArrayField(models.CharField(max_length=100), size=3, null=True, blank=True)
    mmsi = models.CharField(max_length=max_str_len, null=True, blank=True)
    call_sign = models.CharField(max_length=max_str_len, null=True, blank=True)
    
    prop_power = models.IntegerField(null=True, blank=True)  # kilowatts
    num_engine = models.PositiveSmallIntegerField(null=True, blank=True)
    # Engine make and model for each engine:
    engine_details = ArrayField(ArrayField(models.CharField(max_length=100), size=2), size=50, null=True, blank=True)

    builder_name = models.CharField(max_length=max_str_len, null=True, blank=True)
    builder_addr = models.CharField(max_length=max_str_len, null=True, blank=True)
    builder_yard_no = models.IntegerField(null=True, blank=True)
    date_created = models.DateField(auto_now_add=True, null=True, blank=True)  # log date when the DB entry created
    build_date = models.DateField(null=True, blank=True)
    keel_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return str(self.ship_name)


class User(AbstractUser):
    INDIVIDUAL = 1
    BROKER = 2
    COMMERCIAL = 3
    REGISTRAR = 4
    ADMIN = 5
    ROLE_CHOICES = (
        (INDIVIDUAL, 'individual'),
        (BROKER, 'broker'),
        (COMMERCIAL, 'commercial'),
        (REGISTRAR, 'registrar'),
        (ADMIN, 'admin'),
    )
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    user_type = models.PositiveSmallIntegerField(choices=ROLE_CHOICES)
    objects = UserManager()  # managers.py

    def is_individual(self):
        return self.user_type == 1

    def is_broker(self):
        return self.user_type == 2

    def is_commercial(self):
        return self.user_type == 3

    def is_registrar(self):
        return self.user_type == 4

    def save(self, eligibility=None, *args, **kwargs):
        # Save the actual User Instance
        super().save(*args, **kwargs)

        # Create the User profiles
        if self.is_individual():
            Individual.objects.get_or_create(user=self, eligibility=eligibility)

        elif self.is_broker():
            Broker.objects.get_or_create(user=self)

        elif self.is_commercial():
            Commercial.objects.get_or_create(user=self, eligibility=eligibility)

        elif self.is_registrar():
            Registrar.objects.get_or_create(user=self)


class Registration(models.Model):
    date_applied = models.DateField(auto_now_add=True)  # registration application date
    date_approved = models.DateField(auto_now_add=True)  # registration approved date
    UNREGISTERED_VESSEL = 'unregistered_vessel'
    APP_FEE_PENDING = 'app_fee_pending'
    REG_FEE_PENDING = 'reg_fee_pending'
    PENDING_REG_APPROVAL = 'pending_reg_approval'
    REG_APPROVED = 'reg_approved'
    REG_REJECTED = 'reg_rejected'
    REG_COMPLETED = 'reg_completed'
    STATES = (
        (UNREGISTERED_VESSEL, 'unregistered_vessel'),
        (APP_FEE_PENDING, 'app_fee_pending'),
        (REG_FEE_PENDING, 'reg_fee_pending'),
        (PENDING_REG_APPROVAL, 'pending_reg_approval'),
        (REG_APPROVED, 'reg_approved'),
        (REG_REJECTED, 'reg_rejected'),
        (REG_COMPLETED, 'reg_completed'),
    )
    reg_state = FSMField(default=UNREGISTERED_VESSEL, choices=STATES)

    @transition(field=reg_state, source=[UNREGISTERED_VESSEL, REG_REJECTED], target=APP_FEE_PENDING)
    def register_vessel(self):
        print("Moving into state 'app_fee_pending' from 'unregistered_vessel' upon adding a registration.")

    @transition(field=reg_state, source=[APP_FEE_PENDING], target=PENDING_REG_APPROVAL)
    def pay_app_fee(self):
        print("Moving into state 'pending_reg_approval' from 'app_fee_pending' upon payment of application fee.")

    @transition(field=reg_state, source=[PENDING_REG_APPROVAL], target=REG_FEE_PENDING)
    def approve_reg(self):
        print("Moving into state 'reg_approved' from 'pending_reg_approval' upon approval by registrar.")

    @transition(field=reg_state, source=[PENDING_REG_APPROVAL], target=REG_REJECTED)
    def reject_reg(self):
        print("Moving into state 'reg_rejected' from 'pending_reg_approval' upon rejection by registrar.")

    @transition(field=reg_state, source=[REG_FEE_PENDING], target=REG_COMPLETED)
    def pay_reg_fee(self):  # TODO this will take params to determine if app fee can be skipped
        print("Moving into state 'reg_completed' from 'reg_fee_pending' upon payment of registration fee.")
 
    registration_info = models.OneToOneField(Vessel, on_delete=models.CASCADE)  # TODO modify on_delete
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    root_url = models.CharField(max_length=200, blank=True, null=True)  

class Individual(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="individual_profile", primary_key=True)
    eligibility_choices = (
        (1, 'UK Citizen'),
        (2, 'British Dependent Territories Citizen'),
        (3, 'British Overseas Citizen'),
        (4, 'Commonwealth Citizen'),
        (5, 'Non-UK National settled in UK'),
        (6, 'Citizen of EU Member State Under Articles 48 or 52')
    )
    eligibility = models.PositiveSmallIntegerField(choices=eligibility_choices)
    vessels_list = models.ManyToManyField(Vessel)
    mailing_addr = models.CharField(max_length=100, blank=True)  # physical mailing address
    phone_nbr = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return str(self.user.username)

    def get_user_type(self):
        return "individual"


class Broker(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="broker_profile", primary_key=True)
    client_list = ArrayField(ArrayField(models.CharField(max_length=max_str_len, blank=True, null=True), size=2),
                             size=500, blank=True, null=True)
    vessels_list = models.ManyToManyField(Vessel)

    def get_user_type(self):
        return "broker"


class Commercial(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="commercial_profile", primary_key=True)
    eligibility_choices = (
        (1, 'Company Incorporated in Navis Album'),
        (2, 'Company Incorporated in any British Dependent Territory'),
        (3, 'Company Incorporated in EEA Country'),
        (4, 'Company Incorporated in any British Overseas Possession'),
        (5, 'Company Incorporated in EEIG'),
        (6, 'Company Incorporated in Commonwealth State')
    )
    eligibility = models.PositiveSmallIntegerField(choices=eligibility_choices)
    vessels_list = models.ManyToManyField(Vessel)
    tonnage = models.BigIntegerField(default=0)

    def get_user_type(self):
        return "commercial"


class Registrar(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="registrar_profile", primary_key=True)
    reviewed_vessels = models.ManyToManyField(Vessel, related_name='%(class)s_reviewed', blank=True, null=True)
    pending_vessels = models.ManyToManyField(Vessel, related_name='%(class)s_pending', blank=True, null=True)

    def get_user_type(self):
        return "registrar"


class Pricing(models.Model):
    ship_type = models.CharField(max_length=100)
    tonnage = models.BigIntegerField()
    is_new_ship = models.BooleanField()
    is_motor_change = models.BooleanField()
    is_extend_ship = models.BooleanField()
    is_reg_renewal = models.BooleanField()
    is_change_owner = models.BooleanField()


class Surveyor(models.Model):
    name = models.CharField(max_length=max_str_len, unique=True)
    api_key = models.CharField(max_length=max_str_len, unique=True)
    vessels_list = models.ManyToManyField(Vessel)
