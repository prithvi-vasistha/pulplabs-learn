# The Next.js UI on its own, for docker-compose. It talks to the service over
# CONTENT_API_URL and never opens a database connection.
FROM node:22-alpine AS build

WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci

COPY jsconfig.json next.config.mjs ./
COPY public ./public
COPY src ./src

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine
WORKDIR /app

COPY --from=build /build/package.json    ./package.json
COPY --from=build /build/node_modules    ./node_modules
COPY --from=build /build/.next           ./.next
COPY --from=build /build/public          ./public
COPY --from=build /build/next.config.mjs ./next.config.mjs

ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000
EXPOSE 3000

CMD ["./node_modules/.bin/next", "start", "--hostname", "0.0.0.0"]
