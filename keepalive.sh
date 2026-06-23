#!/bin/bash
cd /home/z/my-project
while true; do
  echo "Starting server at $(date)..."
  npx next dev --port 3000 -H 0.0.0.0 2>&1
  echo "Server exited at $(date), restarting in 2s..."
  sleep 2
done
