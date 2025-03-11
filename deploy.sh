#!/bin/bash

# Create version counter file if it doesn't exist
if [ ! -f .version-counter ]; then
    echo "0" > .version-counter
fi

# Read and increment version counter
COUNTER=$(($(cat .version-counter) + 1))
echo $COUNTER > .version-counter

# Update version.json with new version number
echo "{\"version\": \"1.0.${COUNTER}\", \"timestamp\": \"$(date +%s)\"}" > public/version.json

# Build the app
echo "Building App..."
npm run build
echo "Building successful!"

echo "Deploying version 1.0.${COUNTER}..."
# Deploy to Firebase
firebase deploy
echo "Deploy successful!"
