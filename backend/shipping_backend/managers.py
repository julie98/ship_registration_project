from django.contrib.auth.base_user import BaseUserManager


# A custom manager for creating User and Superusers. The default manager
# does not support the custom fields added: 'user_type'


class UserManager(BaseUserManager):

    def create_user(self, username: str, password, first_name: str, last_name: str, user_type, eligibility: str = None):
        user = self.model(username=username,
                          password=password,
                          first_name=first_name,
                          last_name=last_name,
                          user_type=user_type)

        user.set_password(password)

        if eligibility is None:
            eligibility = 1  # TODO come up with a default

        user.save(eligibility=eligibility)

        return user

    def create_superuser(self, username: str, password: str, user_type: str):
        if password is None:
            raise TypeError('Superusers must have a password.')

        user = self.model()
        user.username = username
        user.set_password(password)
        user.user_type = user_type  # must be int
        user.is_superuser = True
        user.is_staff = True

        user.save(eligibility=1)

        return user
