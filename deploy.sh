#!/bin/bash

# Read current version from version.json, or default to 1.0.0 if not found
if [ -f public/version.json ]; then
    VERSION=$(grep -oP '"version":\s*"\K[0-9]+\.[0-9]+\.[0-9]+' public/version.json)
else
    VERSION="1.0.0"
fi

# Split version into major, minor, patch
IFS='.' read -r MAJOR MINOR PATCH <<< "$VERSION"

# Increment patch
PATCH=$((PATCH + 1))

NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"

# Update version.json with new version number
echo "{\"version\": \"${NEW_VERSION}\", \"timestamp\": \"$(date +%s)\"}" > public/version.json

# Build the app
echo "Building App..."
npm run build
echo "Building successful!"

echo "Deploying version ${NEW_VERSION}..."
# Deploy to Firebase
firebase deploy
echo "Deploy successful!"
