#!/bin/bash

case "$1" in
  "build")
    echo "Building development environment..."
    docker compose -f docker-compose.yml up -d --build
    ;;
  "run")
    echo "Starting development environment..."
    docker compose -f docker-compose.yml up -d
    ;;
  "down")
    echo "Stopping development environment..."
    docker compose -f docker-compose.yml down
    ;;
  "logs")
    echo "Showing development logs..."
    docker compose -f docker-compose.yml logs -f
    ;;
  "frontend-logs")
    echo "Showing frontend logs..."
    docker logs ifclca-development -f
    ;;
  "status")
    echo "Checking development status..."
    docker ps
    ;;
esac 