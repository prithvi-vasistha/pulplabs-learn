# CI/CD to the home lab

A push to `main` runs `.github/workflows/cicd.yml`. Pull requests build and validate without publishing or deploying. Main builds publish AMD64 images to GHCR with commit tags and immutable digests. After all images succeed, a separate job publishes the production Kustomize manifests to the `deploy` branch. Argo CD polls that branch every 60–75 seconds and automatically syncs, prunes application resources, and heals drift.

CI uses the repository-scoped `GITHUB_TOKEN`; it has no VPN credentials, Kubernetes credentials, or Argo CD password. Actions are pinned by commit, builds use BuildKit caches, superseded main runs are cancelled, and a final head check prevents an older build overwriting a newer release. Dependabot proposes weekly action updates.

## Production resources

Change `deploy/production/` on main to change application settings. Existing Secrets, database workloads, PVCs, and the Cloudflare tunnel are platform-managed and excluded from application pruning. Never put production credentials in Git or Docker build arguments.

Learn validates its PostgreSQL schema and seeded API responses before building. Each release runs a PreSync migration/seed Job once, without pruning stored content. A migration failure blocks rollout. Web/API replicas are autoscaled 2–6 and spread over the two application workers.

## Initial registry setup

The published GHCR packages must allow the cluster to pull them. For this public source repository, set the container packages to public in GitHub package settings. GitHub defaults new packages to private even when the source repo is public. This is a one-time owner/admin action; no long-lived package token is stored in the cluster.

## Operations

- Actions: https://github.com/prithvi-vasistha/pulplabs-learn/actions/workflows/cicd.yml
- Argo CD, over the home-lab VPN: https://10.20.0.10:30443
- Application: `pulplabs-learn`; login account: `Admin` (password is managed outside Git).
- The server uses an internal TLS certificate; the supplied public certificate can be trusted by your client.
- The release's `source-revision.json` records its source commit and Actions run. Image digests are in the deploy branch's `kustomization.yaml`.
- To roll back application code, revert the offending source commit on main. That builds and deploys the reverted code through the same checks. For an immediate image rollback, revert the corresponding deploy-branch commit; the next main release supersedes it. Database schema rollback is separate and may require restoring a backup.
- To pause deployments, disable automated sync on the Argo CD Application. To rerun a release without a new source change, dispatch the workflow on main.

The current cluster is on one physical server. Application replicas and GitOps do not remove that hardware failure boundary. Daily application/etcd backups and weekly VM backups remain configured on the HDD.
