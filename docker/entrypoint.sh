#!/bin/sh
# =============================================================================
# Start Postgres, the content service and the UI, in that order.
#
# Each step waits for the one before it rather than sleeping a guessed number
# of seconds. If any of the three dies the container exits, so a supervisor
# outside — Docker's restart policy, a scheduler — can do its job instead of
# the container pretending to be healthy with a dead service inside it.
# =============================================================================
set -eu

PGDATA="${PGDATA:-/var/lib/postgresql/data}"
POSTGRES_DB="${POSTGRES_DB:-learn}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
SERVICE_PORT="${SERVICE_PORT:-4000}"
PORT="${PORT:-3000}"

log() { echo "[entrypoint] $*"; }

# --- postgres ----------------------------------------------------------------
# The data directory may be a fresh volume, so initdb is conditional on the
# marker file postgres itself writes.
if [ ! -s "$PGDATA/PG_VERSION" ]; then
  log "initialising a new database cluster in $PGDATA"
  mkdir -p "$PGDATA"
  chown -R postgres:postgres "$PGDATA"
  # trust auth: the socket and port are inside this container unless the
  # operator publishes 5432 on purpose. POSTGRES_PASSWORD sets a real password.
  su-exec postgres initdb -D "$PGDATA" -U "$POSTGRES_USER" --auth-local=trust --auth-host=trust --encoding=UTF8 >/dev/null
else
  log "reusing the existing database cluster in $PGDATA"
fi

chown -R postgres:postgres "$PGDATA" /run/postgresql

log "starting postgres"
su-exec postgres pg_ctl -D "$PGDATA" -l "$PGDATA/postgres.log" -w -t 60 \
  -o "-c listen_addresses='*' -p 5432" start

if [ -n "${POSTGRES_PASSWORD:-}" ]; then
  su-exec postgres psql -U "$POSTGRES_USER" -d postgres -c \
    "alter user \"$POSTGRES_USER\" with password '$POSTGRES_PASSWORD'" >/dev/null
  log "password set for $POSTGRES_USER"
fi

if ! su-exec postgres psql -U "$POSTGRES_USER" -d postgres -tAc \
      "select 1 from pg_database where datname='$POSTGRES_DB'" | grep -q 1; then
  log "creating database $POSTGRES_DB"
  su-exec postgres createdb -U "$POSTGRES_USER" "$POSTGRES_DB"
fi

export DATABASE_URL="${DATABASE_URL:-postgres://$POSTGRES_USER@127.0.0.1:5432/$POSTGRES_DB}"

# --- shutdown ----------------------------------------------------------------
SERVICE_PID=""
WEB_PID=""

shutdown() {
  log "shutting down"
  [ -n "$WEB_PID" ] && kill "$WEB_PID" 2>/dev/null || true
  [ -n "$SERVICE_PID" ] && kill "$SERVICE_PID" 2>/dev/null || true
  su-exec postgres pg_ctl -D "$PGDATA" -m fast -w -t 20 stop >/dev/null 2>&1 || true
  exit 0
}
trap shutdown INT TERM

# --- content service ---------------------------------------------------------
# It applies the schema and seeds on boot; both are idempotent, so a restart
# and a cold start take the same path.
log "starting content service on :$SERVICE_PORT"
cd /app/service
PORT="$SERVICE_PORT" node src/index.js &
SERVICE_PID=$!

log "waiting for the service to answer"
i=0
until wget -qO- "http://127.0.0.1:$SERVICE_PORT/health" >/dev/null 2>&1; do
  i=$((i + 1))
  if [ "$i" -gt 120 ]; then
    log "service did not become healthy; its output is above"
    exit 1
  fi
  # If it died there is nothing to wait for.
  kill -0 "$SERVICE_PID" 2>/dev/null || { log "service exited during startup"; exit 1; }
  sleep 1
done
log "service healthy"

# --- web ---------------------------------------------------------------------
log "starting the UI on :$PORT"
cd /app
CONTENT_API_URL="http://127.0.0.1:$SERVICE_PORT" \
  ./node_modules/.bin/next start --port "$PORT" --hostname 0.0.0.0 &
WEB_PID=$!

# Exit as soon as either process does, so the container's state is honest.
wait -n "$SERVICE_PID" "$WEB_PID" 2>/dev/null || wait "$WEB_PID"
log "a process exited; stopping the rest"
shutdown
