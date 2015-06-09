#!/bin/bash
node_modules/firebase-tools/bin/firebase login --email ${FIREBASE_EMAIL} --password ${FIREBASE_PASSWORD}
firebase=planningpokerapp
if [ "${TRAVIS_BRANCH}" = "develop" ]; then
    firebase=planningpokerappdev
fi
node_modules/firebase-tools/bin/firebase deploy --firebase ${firebase}
