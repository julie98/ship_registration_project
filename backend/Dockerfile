FROM python:3.6.8

ENV PYTHONUNBUFFERED=1
ENV PROJECT_ROOT /usr/src/app
WORKDIR $PROJECT_ROOT

RUN git clone https://github.com/vishnubob/wait-for-it.git

COPY requirements.txt ./

RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]