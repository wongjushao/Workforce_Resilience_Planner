FROM mcr.microsoft.com/playwright/python:v1.49.1-jammy

WORKDIR /app/scripts

# playwright is already bundled in the base image at the correct version;
# install only the remaining dependencies with an extended timeout
COPY scripts/requirements.txt /app/scripts/requirements.txt
RUN sed 's/\r//' /app/scripts/requirements.txt \
    | grep -v '^playwright' \
    | pip install --no-cache-dir --timeout 120 -r /dev/stdin \
    && pip install --no-cache-dir --timeout 120 "playwright==1.49.1"

COPY scripts/ /app/scripts/

ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app/scripts

ENTRYPOINT ["python", "etl_pipeline.py"]
CMD ["--headless", "--out", "/app/data/src/jobs.json", "--stdout"]
