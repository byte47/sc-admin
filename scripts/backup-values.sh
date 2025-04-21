#!/bin/zsh

# Hardcoded Postgres connection string
PGURL="postgresql://sc:pwd@74.235.120.184:5000/sc-admin"

# Directory for backups
BACKUP_DIR="$(dirname "$0")/../backup-data"

# Export blocked_names
psql "$PGURL" -Atc "SELECT value FROM blocked_names ORDER BY created_at;" > "$BACKUP_DIR/blocked-names.txt"

# Export allowed_names
psql "$PGURL" -Atc "SELECT value FROM allowed_names ORDER BY created_at;" > "$BACKUP_DIR/allowed-names.txt"

# Export allowed_slugs
psql "$PGURL" -Atc "SELECT value FROM allowed_slugs ORDER BY created_at;" > "$BACKUP_DIR/allowed-slugs.txt"

# Export blocked_slugs
psql "$PGURL" -Atc "SELECT value FROM blocked_slugs ORDER BY created_at;" > "$BACKUP_DIR/blocked-slugs.txt"

echo "Backup complete."
