from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

# Register your models here.
from .models import Vessel
admin.site.register(Vessel)

# Register your Individual users here.
from .models import Individual
admin.site.register(Individual)

# Register your brokers here.
from .models import Broker
admin.site.register(Broker)

# Register your commercial companies here.
from .models import Commercial
admin.site.register(Commercial)

# Register your registrars here.
from .models import Registrar
admin.site.register(Registrar)

# Register your pricing here.
from .models import Pricing
admin.site.register(Pricing)

from .models import User
admin.site.register(User)

from .models import Registration
admin.site.register(Registration)

from .models import Surveyor
admin.site.register(Surveyor)