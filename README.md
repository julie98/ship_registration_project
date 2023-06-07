# Developing for Team Atlas

## Local Development
The readme will list the commands needed to develop locally with either frontend or backend.

Please remember to `git pull` before you start working, to get the latest code.

### Deploy entire app locally without k8s - E2E testing
1. Make sure Docker-Desktop is installed and running.
2. Run `deploy_app_docker.sh` script.
3. When done with testing, use `control + c` to terminate containers.

### Backend
1. Make sure Docker-Desktop is installed and running.
2. Run `deploy_app_docker.sh backend-dev` script to instantiate local Postgres database running in Docker and frontend. Alternatively, run `deploy_app_docker.sh backend-dev-only` to instantiate only the database, without the frontend.
3. In a new terminal window, run `python manage.py runserver 0.0.0.0:8000` from the `backend` folder to start your local backend development server.

### Frontend
1. Make sure Docker-Desktop is installed and running.
2. Run `deploy_app_docker.sh frontend-dev` script to instantiate local Postgres database running in Docker and backend.
3. In a new terminal window, run `npm start` from the `frontend` folder to start your local frontend development page.

### Adding Users to Backend
1. Make sure the database is running via the Backend instructions above.
2. Create one of each user type via: 'python manage.py shell < init_users.py' .
3. Go to 'localhost:8000/admin/' and login using username='admin', password='TeamAtlas1!'.
4. Now you pay navigate using the Django UI to the Individual/Commercial/Broker/Registrar pages.
5. You may assign Vessels to a specific user profile here, i.e the one with  username='broker', password='teamatlas'.
6. Sending a 'Post' request to '/login/' with the above username and password will return the broker's authentication token.
7. Sending a 'GET' request to '/vessels/list' with the authentication token in the request header will now return JSON containing the user's vessels (non-empty assuming the vessel was added via the admin page).

### Pre-populated database via Fixtures for testing
1. The deployment script will automatically instantiate the database and populate it with dummy data to be used for testing purposes:
- 5 Individuals each with 1 vessel and 1 registration in a random state.
- 5 Commercials each with 2 vessels and 2 registrations in random states.
- 5 Brokers each with 3 vessels and 3 registrations in random states.
- 5 Registrars 

- Default credentials follow the format username=[name][num]@test.com, password=TeamAtlas1!
- where name = {individual, commercial, broker, registrar}, and num = {0, 1, 2, 3, 4}.
## Deploy local kubernetes cluster with remote images built with CI/CD
1. Run `deploy_app_k8s.sh <GitLab username> <GitLab password>`.

## Run integration tests with remote images built with CI/CD
1. Run `integration_tests/docker-compose.yml <GitLab username> <GitLab password>`.
2. When the test exited, run `CONTROL + C` to shut down the compose cluster.

## Additional remarks
Instead of the GitLab username and password, we should use an API token; however, it appears to be broken for the UCSC GitLab, the page displays 500 upon attempting to create a token.
