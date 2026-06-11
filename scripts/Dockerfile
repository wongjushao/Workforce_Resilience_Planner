FROM mcr.microsoft.com/playwright/python:v1.49.1-jammy

WORKDIR /app/scripts

# Pin Playwright to the version bundled with the base image.
RUN pip install --no-cache-dir "playwright==1.49.1"

COPY scripts/ /app/scripts/

ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app/scripts

ENTRYPOINT ["python", "etl_pipeline.py"]
CMD ["--headless", "--out", "/app/data/src/jobs.json", "--stdout"]
