#!/bin/bash
# Initialize Terraform
set -euo pipefail

ENV="${1:-dev}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="${SCRIPT_DIR}"

cd "${REPO_ROOT}/terraform"

BACKEND_BUCKET="${TF_BACKEND_BUCKET:-sports-monitor-terraform-state}"
AWS_REGION="${AWS_REGION:-us-east-1}"

ensure_backend_bucket() {
  local bucket_name="$1"
  if aws s3api head-bucket --bucket "${bucket_name}" >/dev/null 2>&1; then
    echo "• S3 bucket '${bucket_name}' already exists"
  else
    echo "• S3 bucket '${bucket_name}' not found — creating..."
    if [ "${AWS_REGION}" == "us-east-1" ]; then
      aws s3api create-bucket --bucket "${bucket_name}" --region "${AWS_REGION}" >/dev/null
    else
      aws s3api create-bucket --bucket "${bucket_name}" --region "${AWS_REGION}" \
        --create-bucket-configuration LocationConstraint="${AWS_REGION}" >/dev/null
    fi
    aws s3api put-bucket-versioning --bucket "${bucket_name}" --versioning-configuration Status=Enabled >/dev/null
    echo "✓ Created S3 bucket '${bucket_name}' with versioning enabled"
  fi
}

if [[ "${SKIP_BACKEND_BOOTSTRAP:-false}" != "true" ]]; then
  echo "Ensuring remote backend bucket '${BACKEND_BUCKET}' exists..."
  ensure_backend_bucket "${BACKEND_BUCKET}"
else
  echo "Skipping backend bucket bootstrap (SKIP_BACKEND_BOOTSTRAP=true)"
fi

echo "Initializing Terraform backend for environment: ${ENV}..."
terraform init -reconfigure \
  -backend-config="bucket=${BACKEND_BUCKET}" \
  -backend-config="key=${ENV}/terraform.tfstate" \
  -backend-config="region=${AWS_REGION}"

echo "✓ Initialization complete."