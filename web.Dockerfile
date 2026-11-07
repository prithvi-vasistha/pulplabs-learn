# The Next.js UI on its own, for docker-compose. It talks to the service over
# CONTENT_API_URL and never opens a database connection.
FROM node:22-alpine AS build

WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci

COPY jsconfig.json next.config.mjs ./
COPY public ./public
COPY src ./src

# NEXT_PUBLIC_* values are compiled into the bundle, so they are build
# arguments rather than environment variables — setting them at run time in a
# Deployment does nothing. Both default to the production hosts.
ARG NEXT_PUBLIC_SITE_URL=https://learn.pulplabs.ai
ARG NEXT_PUBLIC_MAIN_SITE_URL=https://pulplabs.ai
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_MAIN_SITE_URL=$NEXT_PUBLIC_MAIN_SITE_URL \
    NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine
WORKDIR /app

COPY --from=build --chown=node:node /build/.next/standalone ./
COPY --from=build --chown=node:node /build/.next/static ./.next/static
COPY --from=build --chown=node:node /build/public ./public
RUN mkdir -p /app/.next/cache && chown -R node:node /app/.next/cache
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
USER node
EXPOSE 3000
CMD ["node", "server.js"]
