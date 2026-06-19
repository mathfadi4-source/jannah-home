#!/bin/sh
set -e

# Apply the Prisma schema to the database. This is idempotent and safely
# creates the tables on the first run.
echo "[entrypoint] Applying database schema (prisma db push)..."
bunx prisma db push --skip-generate

# Optional one-time seeding. WARNING: the seed script wipes existing data,
# so it is OFF by default. Enable it only for the very first deployment by
# setting SEED_ON_START=true, then remove the flag afterwards.
if [ "${SEED_ON_START}" = "true" ]; then
  echo "[entrypoint] SEED_ON_START=true -> seeding database (this resets data)..."
  bunx prisma db seed || echo "[entrypoint] Seed step failed, continuing startup."
fi

echo "[entrypoint] Starting application..."
exec "$@"
