# The content service on its own, for docker-compose.
FROM node:22-alpine

WORKDIR /app

COPY service/package.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY service ./

ENV NODE_ENV=production PORT=4000
EXPOSE 4000

HEALTHCHECK --interval=10s --timeout=5s --start-period=20s --retries=10 \
  CMD wget -qO- http://127.0.0.1:4000/health >/dev/null 2>&1 || exit 1

CMD ["node", "src/index.js"]
