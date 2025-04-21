#!/bin/bash
set -euo pipefail

# Set connection strings (edit these as needed)
PROD_DB_URL="${PROD_DB_URL:-postgresql://sc:pwd@74.235.120.184:5000/sc-admin}"
DEV_DB_URL="${DEV_DB_URL:-postgresql://ameen:pwd@localhost:5432/sc-admin}"

# Parse DB name and user from DEV_DB_URL for drop/create
parse_db_name() {
  echo "$1" | sed -E 's#.*/([^/?]+).*#\1#'
}
parse_db_user() {
  echo "$1" | sed -E 's#postgresql://([^:/@]+).*#\1#'
}

DEV_DB_NAME=$(parse_db_name "$DEV_DB_URL")
DEV_DB_USER=$(parse_db_user "$DEV_DB_URL")

# Drop and recreate dev database
echo "Disconnecting active connections to dev database: $DEV_DB_NAME..."
PGPASSWORD=$(echo "$DEV_DB_URL" | sed -E 's#.*:([^:@/]+)@.*#\1#') \
  psql "$DEV_DB_URL" -U "$DEV_DB_USER" -d postgres -c "\
    SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DEV_DB_NAME' AND pid <> pg_backend_pid();\
  " || { echo "Failed to disconnect active connections"; exit 1; }

echo "Dropping dev database: $DEV_DB_NAME..."
PGPASSWORD=$(echo "$DEV_DB_URL" | sed -E 's#.*:([^:@/]+)@.*#\1#') \
  psql "$DEV_DB_URL" -U "$DEV_DB_USER" -d postgres -c "DROP DATABASE IF EXISTS \"$DEV_DB_NAME\";" || { echo "Failed to drop dev DB"; exit 1; }

echo "Creating dev database: $DEV_DB_NAME..."
PGPASSWORD=$(echo "$DEV_DB_URL" | sed -E 's#.*:([^:@/]+)@.*#\1#') \
  psql "$DEV_DB_URL" -U "$DEV_DB_USER" -d postgres -c "CREATE DATABASE \"$DEV_DB_NAME\";" || { echo "Failed to create dev DB"; exit 1; }

# Dump prod and restore to dev
echo "Dumping prod database and restoring to dev..."
pg_dump --no-owner --no-privileges "$PROD_DB_URL" | psql "$DEV_DB_URL" || { echo "Failed to clone prod to dev"; exit 1; }

echo "Clone complete!"
