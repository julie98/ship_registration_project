import os

from playwright.sync_api import Page

# Make sure your local environment is running by executing ./deploy_app_docker_remote.sh

frontend_url = os.getenv('FRONTEND_HOST', 'http://localhost')


def test_check_website_loads(page: Page):
    page.goto(f'{frontend_url}:3000')
