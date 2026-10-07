FROM python:3.12-alpine

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app
COPY --chown=65532:65532 server.py /app/server.py

USER 65532:65532
EXPOSE 11435

CMD ["python", "/app/server.py"]
