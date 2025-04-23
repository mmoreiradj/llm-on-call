#!/bin/bash
set -e

GREEN='\033[0;32m'
NC='\033[0m'

images_name=(
  "microservices-gateway:latest"
  "microservices-names-service:latest"
  "microservices-verbes-service:latest"
)

echo "Importing K3D images..."
for image in "${images_name[@]}"; do
  k3d image import "$image"
done

echo -e "${GREEN}Image import completed.${NC}"