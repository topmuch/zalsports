#!/bin/sh
# Production startup script for ZalSports
# Runs Prisma migrations and starts the server

set -e

# Create data directory if not exists
mkdir -p /app/data

# Run Prisma generate (already done at build, but just in case)
if [ -f "node_modules/.prisma/client/index.js" ]; then
  echo "Prisma client already generated"
fi

# Start the server
exec bun server.js
