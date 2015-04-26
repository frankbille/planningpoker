#!/bin/bash
export BRANCH=$(git symbolic-ref --short -q HEAD)
google-cloud-sdk/bin/gcloud auth activate-service-account \
    "${GAE_CLIENT_ACCOUNT}" \
    --key-file gcloudauth.json
google-cloud-sdk/bin/gcloud \
    --project "${GAE_PROJECT_ID}" \
    preview app deploy \
    --version "${BRANCH}" \
    --quiet \
    "dist/app.yaml"