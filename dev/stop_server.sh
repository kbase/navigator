#!/bin/sh

set -e

export DEVELOPMENT=1

if docker compose --project-name navigator-dev stop; then
  echo "Docker Compose - containers stopped normally"
else
  echo "Docker Compose - containers stopped with error"
fi