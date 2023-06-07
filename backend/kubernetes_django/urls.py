"""kubernetes_django URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf.urls import url
from django.contrib import admin
from django.urls import path, include
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions
from shipping_backend.views import get_pricing
from shipping_backend.views import get_vessels, add_vessel, register_vessel, add_register_vessel, view_registration, \
    view_registrations
from shipping_backend.views import register_user, login
from shipping_backend.views import stripe_config, save_stripe_info
from shipping_backend.views import survey_vessel, assign_vessels_to_surveyor, check_unique_ship_name_in_port
from shipping_backend.views import view_all_users, view_all_approved_registrations, view_applications, view_application, \
    review_application

schema_view = get_schema_view(
    openapi.Info(
        title="Team Atlas's NADoTs API",
        default_version='v1',
        description="Backend APIs for Team Atlas's NADoT",
        terms_of_service="https://www.google.com/policies/terms/",
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

# TODO: cleanup not used views
urlpatterns = [
    # APIs
    path('register_user/', register_user),
    path('login/', login),

    path('vessels/list/', get_vessels),
    path('vessels/add/', add_vessel),
    path('vessels/register/', register_vessel),
    path('vessels/register_vessel/', add_register_vessel),
    path('vessels/register/view/', view_registration),
    path('vessels/register/view/all/', view_registrations),
    path('vessels/check_unique_name/', check_unique_ship_name_in_port),

    path('users/view/all/', view_all_users),
    path('registrations/view/all/', view_all_approved_registrations),
    path('applications/view/all/', view_applications),
    path('applications/view/', view_application),
    path('applications/review/', review_application),

    path('vessels/', survey_vessel),
    path('surveyors/assign/', assign_vessels_to_surveyor),

    # Payment
    path('pricing/list', get_pricing),

    path('payment/config/', stripe_config),
    path('payment/save-stripe-info/', save_stripe_info),

    # Views
    path('admin/', admin.site.urls),
    path('accounts/', include('django.contrib.auth.urls')),
    path('register/', register_user, name='register'),

    # Docs
    url(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    url(r'^swagger/$', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    url(r'^redoc/$', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),

    # Token
    path('custom-url/', include('django_expiring_token.urls')),
]
