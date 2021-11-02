FROM python:3.6

ENV PYTHONUNBUFFERED 1
ENV APP_ROOT /apps/alimregistration/registration
ENV PORT 9005

# create and set working directory
RUN mkdir -p ${APP_ROOT}
ADD . ${APP_ROOT}

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
        tzdata \
        python3-setuptools \
        python3-pip \
        python3-dev \
        python3-venv \
        git \
        && \
    apt-get clean && \
    rm -rf /var/lib/apt-get/lists/*

# install environment dependencies
RUN pip3 install --upgrade pip

RUN pip install --no-cache-dir -r ${APP_ROOT}/requirements.txt

VOLUME ["${APP_ROOT}"]
WORKDIR "${APP_ROOT}"

EXPOSE $PORT
CMD gunicorn registration.wsgi:application --reload --workers 3 --timeout 60 --user=root --group=root --bind=0.0.0.0:$PORT

