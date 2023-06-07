#!/usr/bin/env python
import os
import sys

import coverage

if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "kubernetes_django.settings")

    try:
        from django.core.management import execute_from_command_line

    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc

    from django.core.management import execute_from_command_line

    is_testing = 'test' in sys.argv

    if is_testing:
        cov = coverage.coverage(source=['shipping_backend'], omit=['*/tests/*'])
        cov.erase()
        cov.start()

    execute_from_command_line(sys.argv)

    if is_testing:
        cov.stop()
        cov.save()
        cov.report()
