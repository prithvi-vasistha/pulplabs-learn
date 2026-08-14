# =============================================================================
# PulpLabs Learn — one image, three processes
#
# Postgres, the content service and the Next.js UI in a single container, so
# the whole thing runs with one `docker run` and no orchestrator.
#
# That is a deliberate trade, not an oversight. A container per process is the
# right shape for production and `docker-compose.yml` in this repo describes
# it. This image exists because "clone it and see it work" should be one
# command, and because a demo that needs a control plane is not a demo.
# =============================================================================

# ---- build ------------------------------------------------------------------
FROM node:22-alpine AS build

WORKDIR /build

# Dependencies first, so editing content does not reinstall the world.
COPY package.json package-lock.json ./
RUN npm ci

COPY service/package.json ./service/
RUN cd service && npm install --omit=dev --no-audit --no-fund

COPY jsconfig.json next.config.mjs ./
COPY public ./public
COPY src ./src
COPY scripts ./scripts
COPY service ./service

# The site is rendered on demand from the database, so the build compiles the
# app but reaches for no content — it does not need Postgres to be up.
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Regenerate the seed artefact from the authored modules, so the image can
# never ship a content.json that has drifted from src/data.
RUN npm run export:content

# ---- runtime ----------------------------------------------------------------
FROM node:22-alpine

# su-exec drops privileges for the postgres processes; postgres itself refuses
# to run as root, and running the whole container as postgres would be worse.
RUN apk add --no-cache postgresql postgresql-contrib su-exec tini \
    && mkdir -p /var/lib/postgresql/data /run/postgresql \
    && chown -R postgres:postgres /var/lib/postgresql /run/postgresql

WORKDIR /app

COPY --from=build /build/package.json          ./package.json
COPY --from=build /build/node_modules          ./node_modules
COPY --from=build /build/.next                 ./.next
COPY --from=build /build/public                ./public
COPY --from=build /build/next.config.mjs       ./next.config.mjs
COPY --from=build /build/service               ./service
COPY docker/entrypoint.sh                      /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PGDATA=/var/lib/postgresql/data \
    POSTGRES_DB=learn \
    POSTGRES_USER=postgres \
    SERVICE_PORT=4000 \
    PORT=3000 \
    CONTENT_API_URL=http://127.0.0.1:4000

# The database directory. Mount a volume here to keep data across `docker rm`.
VOLUME ["/var/lib/postgresql/data"]

EXPOSE 3000 4000 5432

# The UI answers as soon as it can render a page from the database, which is
# the only definition of healthy that means anything here.
HEALTHCHECK --interval=15s --timeout=5s --start-period=45s --retries=5 \
  CMD wget -qO- http://127.0.0.1:3000/ >/dev/null 2>&1 || exit 1

# tini reaps the postgres and service children; without it a stopped container
# leaves zombies and shutdown takes the full grace period.
ENTRYPOINT ["/sbin/tini", "--", "/usr/local/bin/entrypoint.sh"]
