#!/bin/sh

set -e

export DEVELOPMENT=1
if docker network create kbase-dev; then
  echo "Docker network 'kbase-dev' created"
else
  echo "Docker network 'kbase-dev' already exists"
fi

if docker-compose up --build; then
  echo "Docker Compose exited normally"
else
  echo "Docker Compose exited with error"
fi
