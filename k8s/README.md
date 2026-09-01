# Deploying to Kubernetes

Three workloads, one database, one Ingress. The single-container `Dockerfile`
at the repo root is for trying the project; this is for running it.

```
                    Ingress (TLS, learn.pulplabs.ai)
                              │
                       Service learn-web:3000
                              │
                    Deployment learn-web  ×2      ← Next.js, renders every page
                              │  CONTENT_API_URL
                       Service learn-service:4000
                              │
                    Deployment learn-service ×2   ← the only DB client
                              │  DATABASE_URL
                     StatefulSet learn-postgres    ← PVC, 10Gi
```

There is **no separate front end to host.** The UI is server-rendered: it reads
the session cookie, renders content pages on demand and handles sign-in in its
own route handlers. It is a Node process, not a bundle for a CDN.

## Before you apply anything

**1. Build and push both images.** `NEXT_PUBLIC_*` values are compiled into the
web bundle, so they are build arguments — setting them in the Deployment does
nothing.

```bash
REG=ghcr.io/prithvi-vasistha

docker build -f service/Dockerfile -t $REG/pulplabs-learn-service:latest .
docker build -f web.Dockerfile     -t $REG/pulplabs-learn-web:latest \
  --build-arg NEXT_PUBLIC_SITE_URL=https://learn.pulplabs.ai \
  --build-arg NEXT_PUBLIC_MAIN_SITE_URL=https://pulplabs.ai .

docker push $REG/pulplabs-learn-service:latest
docker push $REG/pulplabs-learn-web:latest
```

Tag with a version rather than `latest` if you want rollbacks to mean anything;
`kubectl rollout undo` cannot help you if both revisions point at the same tag.

**2. Fill in the Secret.**

```bash
cp k8s/01-secrets.example.yaml k8s/01-secrets.yaml   # gitignored
openssl rand -base64 48                              # AUTH_SECRET
```

`AUTH_SECRET` is not optional here. Left empty, the service generates one and
stores it in the database — which two replicas cannot agree on, so a session
signed by one pod is rejected by the other.

**3. Point DNS at the cluster.** An `A` record for `learn` → the node's IP.

## Apply

```bash
kubectl apply -f k8s/00-namespace.yaml
kubectl apply -f k8s/01-secrets.yaml
kubectl apply -f k8s/10-postgres.yaml
kubectl -n pulplabs-learn rollout status statefulset/learn-postgres

kubectl apply -f k8s/20-migrate-job.yaml
kubectl -n pulplabs-learn wait --for=condition=complete job/learn-migrate --timeout=180s

kubectl apply -f k8s/30-service.yaml -f k8s/40-web.yaml -f k8s/50-ingress.yaml
kubectl -n pulplabs-learn rollout status deploy/learn-web
```

## Releasing new content

Content lives in `src/data`, is exported to `service/seed/content.json`, and is
loaded by the migration Job. The Job is the only thing that writes it — the
service pods are told to skip both schema and seed, because two replicas
running the same DDL and the same seed transaction at once is a race.

```bash
npm run export:content
# rebuild + push the service image, then:
kubectl -n pulplabs-learn delete job learn-migrate --ignore-not-found
kubectl apply -f k8s/20-migrate-job.yaml
kubectl -n pulplabs-learn rollout restart deploy/learn-service deploy/learn-web
```

The seed is upserts, so it never deletes. Removing content needs `--prune`,
which is deliberately not in the Job's command.

## Two things that decide whether sign-in works

The app reads two headers set by the Ingress:

| Header | Decides |
| --- | --- |
| `x-forwarded-proto` | whether the session cookie gets the `Secure` flag |
| `x-forwarded-host` | the origin the Google redirect URI is built from |

ingress-nginx sets both. Another controller may not — without them you get an
insecure cookie and Google redirecting somewhere unreachable.

`https://learn.pulplabs.ai` is already a registered redirect URI on the OAuth
client, so nothing needs adding in Google Cloud Console for the bare origin.

## Backups

The database is a PVC. Nothing backs it up.

```bash
kubectl -n pulplabs-learn exec learn-postgres-0 -- \
  pg_dump -U learn learn | gzip > learn-$(date +%F).sql.gz
```

Put that on a schedule before you have anything you would miss. Accounts are in
there — encrypted, but only recoverable with the same `AUTH_SECRET`, so back up
the Secret somewhere separate too or the rows are unreadable.

## What has not been verified

These manifests were written without a cluster to hand: no `kubectl`, so no
`--dry-run=server` and no admission-webhook check. What *was* verified, by
running the identical topology in Docker:

- the migration Job applies schema and seed and exits 0
- the service runs with `SKIP_SCHEMA=1 SKIP_SEED=1`, as uid 1000, with a
  read-only root filesystem
- the web image runs as uid 1000 and serves `/api/health` and every page
- the web container reaches the service by DNS name and renders from it
- names, ports, labels and Secret keys agree across the manifests

Storage class, Ingress class and the cert-manager issuer are the parts most
likely to need changing for your cluster — they are named in the files.
