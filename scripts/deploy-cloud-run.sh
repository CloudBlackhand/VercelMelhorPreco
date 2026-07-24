#!/usr/bin/env bash
set -e

PROJECT_ID=${PROJECT_ID:-SEU_PROJETO}
REGION=${REGION:-southamerica-east1}
SERVICE_NAME=${SERVICE_NAME:-melhorpreco}
REPO_NAME=${REPO_NAME:-apps}
IMAGE_TAG=${IMAGE_TAG:-latest}
ARTIFACT_REGISTRY="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/${SERVICE_NAME}:${IMAGE_TAG}"

DB_INSTANCE=${DB_INSTANCE:-melhorpreco-db}
DB_USER=${DB_USER:-melhorpreco}
DB_PASSWORD=${DB_PASSWORD:-troque-esta-senha}
DB_NAME=${DB_NAME:-melhorpreco}

NEXTAUTH_SECRET=${NEXTAUTH_SECRET:-$(openssl rand -base64 32)}
NEXTAUTH_URL=${NEXTAUTH_URL:-https://exemplo.com}
ADMIN_EMAIL=${ADMIN_EMAIL:-admin@melhorpreco.net}
ADMIN_PASSWORD=${ADMIN_PASSWORD:-troque-esta-senha}

echo "=== build e push da imagem ==="
gcloud auth configure-docker "${REGION}-docker.pkg.dev"
docker build -t "${ARTIFACT_REGISTRY}" .
docker push "${ARTIFACT_REGISTRY}"

echo "=== deploy no Cloud Run ==="
gcloud run deploy "${SERVICE_NAME}" \
  --project "${PROJECT_ID}" \
  --image "${ARTIFACT_REGISTRY}" \
  --region "${REGION}" \
  --allow-unauthenticated \
  --port 3000 \
  --memory 4Gi \
  --cpu 1 \
  --min-instances 1 \
  --max-instances 1 \
  --concurrency 80 \
  --timeout 60 \
  --no-cpu-throttling \
  --add-cloudsql-instances "${PROJECT_ID}:${REGION}:${DB_INSTANCE}" \
  --set-env-vars "DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@localhost/${DB_NAME}?schema=public&host=/cloudsql/${PROJECT_ID}:${REGION}:${DB_INSTANCE}" \
  --set-env-vars "NEXTAUTH_SECRET=${NEXTAUTH_SECRET}" \
  --set-env-vars "NEXTAUTH_URL=${NEXTAUTH_URL}" \
  --set-env-vars "ADMIN_EMAIL=${ADMIN_EMAIL}" \
  --set-env-vars "ADMIN_PASSWORD=${ADMIN_PASSWORD}"

echo "=== deploy concluído ==="
