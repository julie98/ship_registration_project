FROM mcr.microsoft.com/playwright:bionic

RUN apt-get update
RUN apt-get install -y software-properties-common

RUN add-apt-repository ppa:deadsnakes/ppa
RUN apt-get update
RUN apt-get install -y python3.7 python3-pip
RUN python3.7 -m pip install --upgrade pip

RUN python3.7 -m pip install playwright pytest pytest-playwright
RUN python3.7 -m playwright install

WORKDIR e2e

RUN git clone https://github.com/vishnubob/wait-for-it.git

COPY ./e2e_test.py .

CMD ["python3.7", "-m", "pytest"]

# docker run -it --rm --ipc=host --network="host" playwright