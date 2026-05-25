#!/bin/bash
# scripts/update-ha-version.sh
# Update Home Assistant version without updating the addon plugin

set -e

NEW_VERSION="${1:-latest}"

if [[ -z "$NEW_VERSION" ]]; then
    echo "Error: Version required. Use: ./update-ha-version.sh <version>"
    echo "Example: ./update-ha-version.sh 2025.1.0"
    exit 1
fi

echo "Updating Home Assistant version from: $(grep 'ARG BUILD_FROM' ha_opencode/Dockerfile | head -1)"
echo "To: $NEW_VERSION"

# Update BUILD_FROM argument in Dockerfile
sed -i.bak "s|ghcr.io/home-assistant/amd64-base-debian:trixie|$NEW_VERSION|" ha_opencode/Dockerfile

# Update HATEST file
echo "$NEW_VERSION" > ha_opencode/HATEST

echo "✓ BUILD_FROM actualizado a: $NEW_VERSION"
echo "✓ Actualización de HA completada sin tocar addon"
