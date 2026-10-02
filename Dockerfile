# syntax=docker/dockerfile:1

# Production image for เรือพระเล่าเรื่อง.
#
# Built in three stages so the thing that ships carries the server and nothing else: no
# compilers, no dev dependencies, no test suite, no 200MB of raw field photographs.
#
# The build deliberately does not need a database. Every page that reads one renders at
# request time, so this image can be built anywhere — a laptop, a CI runner, a hosting
# provider's builder — without a Postgres happening to be on the same network.

# A Debian base rather than Alpine: sharp ships prebuilt glibc binaries, and the musl
# variants need optional packages that a lock file generated on Windows does not carry.
# The image is larger; the build is one that works on any machine.
# ---------------------------------------------------------------- dependencies
FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---------------------------------------------------------------------- build
FROM node:22-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# `prisma generate` reads the schema file only; it needs no live database.
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --------------------------------------------------------------------- runner
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Prisma's query engine links against OpenSSL and warns that it cannot detect a version on
# a slim image, then guesses. The guess happened to be right here; on another host it will
# not be, and the failure would land during a deploy rather than now.
RUN apt-get update  && apt-get install -y --no-install-recommends openssl ca-certificates  && rm -rf /var/lib/apt/lists/*

# Run as a normal user. If the container is ever reached, it should not be reached as root.
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 --ingroup nodejs nextjs

# The standalone output carries its own minimal node_modules.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# The Prisma CLI, so the container can bring the database up to date when it starts.
# Installed rather than copied out of the builder: the standalone output carries only what
# the server imports, and the CLI needs its own dependency tree to run at all.
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts
# Installed in its own directory. Running npm install inside /app makes npm reconcile the
# whole project tree against package.json and reinstall every production dependency on top
# of the standalone output — 700MB of duplicates. The symlink is so prisma.config.ts, which
# imports "prisma/config", still resolves from /app.
RUN mkdir -p /opt/prisma  && cd /opt/prisma  && npm init -y > /dev/null 2>&1  && npm install --no-package-lock --omit=dev prisma@7.10.0  && npm cache clean --force  && ln -s /opt/prisma/node_modules/prisma /app/node_modules/prisma  && chown -R nextjs:nodejs /opt/prisma

# Uploaded photographs live here. Mount a volume on it, or they vanish with the container.
RUN mkdir -p /app/storage/uploads && chown -R nextjs:nodejs /app/storage

COPY --chown=nextjs:nodejs docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

USER nextjs
EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
