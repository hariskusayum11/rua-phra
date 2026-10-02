#!/bin/sh
# Brings the database schema up to date, then starts the server.
#
# `migrate deploy` only applies migrations that already exist in prisma/migrations. It
# never invents one and never drops anything, which is the difference between it and the
# command used in development — the wrong one here could rewrite a table of field records
# that only exists in one place.
set -e

echo "==> applying database migrations"
/opt/prisma/node_modules/.bin/prisma migrate deploy

echo "==> starting server on port ${PORT:-3000}"
exec "$@"
