#!/bin/sh
set -e

echo "Aplicando migrations..."
node node_modules/prisma/build/index.js migrate deploy

# cria/atualiza o admin se as envs estiverem setadas
if [ -n "$ADMIN_EMAIL" ] && [ -n "$ADMIN_PASSWORD" ]; then
  node scripts/create-admin.js || true
fi

exec node server.js
