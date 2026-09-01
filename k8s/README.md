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

VERSION=v1

docker build -f service/Dockerfile -t $REG/pulplabs-learn-service:$VERSION .
docker build -f web.Dockerfile     -t $REG/pulplabs-learn-web:$VERSION \
  --build-arg NEXT_PUBLIC_SITE_URL=https://learn.pulplabs.ai \
  --build-arg NEXT_PUBLIC_MAIN_SITE_URL=https://pulplabs.ai .

docker push $REG/pulplabs-learn-service:$VERSION
docker push $REG/pulplabs-learn-web:$VERSION
```

The manifests pin `:v1`. Bump the tag on both the images and the manifests for
each release — with `:latest` on every revision `kubectl rollout undo` has
nothing to roll back to, and Kubernetes defaults a `:latest` tag to
`imagePullPolicy: Always`, which quietly ignores any image you loaded onto the
node yourself.

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

## Verified on a real cluster

Applied to a throwaway kind cluster (Kubernetes v1.31.2) with ingress-nginx,
using these files unmodified apart from the Secret:

- migration Job completes and exits 0; 15 technologies, 4 courses, 24 lessons,
  6 exams, 66 questions, 7 field entries, 5 articles, 6 demos seeded
- the two service replicas start with **no** schema or seed in their logs — the
  Job owns both, so a rollout cannot race itself
- every route answers 200 through the Ingress, with content rendering
- **the session cookie comes back `Secure`** and the Google `redirect_uri` is
  built as `https://learn.pulplabs.ai` — both derived from the headers
  ingress-nginx sets, and that URI is already registered on the OAuth client
- register → lease a playground instance → run a demo works end to end through
  the Ingress, and a `planned` demo is still refused
- **rolling restart under load: 140 requests, 0 failures.** Without the
  `preStop` sleep it was 2 failures in 120 — a terminating pod stops accepting
  connections before the Service removes it from its endpoints. That sleep is
  the fix, and it is measured rather than assumed.
- deleting `learn-postgres-0` loses nothing: both accounts and all 7 field
  entries came back with the pod, and the site served 200 throughout
- no restarts, no crash loops, no warning events beyond a readiness probe
  correctly failing while Node was still starting

Recreate that cluster in about two minutes:

```bash
kind create cluster --name learn --config k8s/kind-cluster.yaml
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.11.3/deploy/static/provider/kind/deploy.yaml
kind load docker-image ghcr.io/prithvi-vasistha/pulplabs-learn-service:v1 --name learn
kind load docker-image ghcr.io/prithvi-vasistha/pulplabs-learn-web:v1 --name learn
# then the apply sequence above, and:
curl -k -H 'Host: learn.pulplabs.ai' https://localhost:8448/
```

## What is still cluster-specific

Three things were satisfied by kind's defaults and may differ on your server —
each is named in the files:

- **storage class**: the PVC uses the default. k3s calls it `local-path`.
- **ingress class**: `nginx`. Another controller must still send
  `x-forwarded-proto` and `x-forwarded-host` or sign-in breaks both ways.
- **cert-manager**: the Ingress asks for a `letsencrypt-prod` ClusterIssuer.
  The test cluster had none, so nginx served its own self-signed certificate —
  TLS termination itself was exercised, the certificate issuing was not.
