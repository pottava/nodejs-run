FROM python:3-slim

ENV PYTHONUSERBASE=/app/site-packages
ENV API_ENDPOINT=https://app-xxxxx-an.a.run.app
ENV API_SECURED=False

WORKDIR /app
RUN pip install --user requests google.auth

COPY lib /app/lib
ARG CLIENT="001"
COPY $CLIENT /app/$CLIENT

WORKDIR /app/$CLIENT
ENTRYPOINT ["python", "main.py"]
