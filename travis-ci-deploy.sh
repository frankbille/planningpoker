#!/usr/bin/env bash
branch=$(git symbolic-ref --short -q HEAD)
cat "${GAE_CLIENT_KEY_JSON_FILE}" > gcloudkey.json
google-cloud-sdk/bin/gcloud auth activate-service-account \
    --key-file gcloudkey.json
google-cloud-sdk/bin/gcloud \
    --project "${GAE_PROJECT_ID}" \
    preview app deploy \
    --quiet \
    "app-$branch.yaml"