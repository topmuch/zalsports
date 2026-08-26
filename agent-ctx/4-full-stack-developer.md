# Task 4: Prepare ZalSports for Coolify deployment

**Agent:** full-stack-developer

## Work Done

### Files Created
1. **`Dockerfile`** — 3-stage production build (deps → builder → runner-alpine). Uses Bun throughout. Standalone output + static + public copied to minimal alpine image. Non-root user, /app/data for SQLite.

2. **`.dockerignore`** — Excludes node_modules, .next, .git, screenshots, tool-results, tests, examples, db/, logs.

3. **`docker-compose.yml`** — Single `app` service on port 3000 with env vars and `zalsports_data` volume.

4. **`coolify.yaml`** — Coolify-native service spec matching docker-compose config.

5. **`scripts/start.sh`** — Executable startup script (chmod +x). Creates data dir, checks Prisma, exec's bun server.js.

6. **`DEPLOY.md`** — Full deployment guide in French: prerequisites, step-by-step Coolify setup, env vars, credential changes, volume persistence, backup/restore, updates, rollback, troubleshooting.

### Files Modified
1. **`.gitignore`** — Added `data/` and `.dockerignore` entries.

### Notes
- Dockerfile CMD points to `scripts/start.sh` for pre-start initialization
- `bun.lock` + `--frozen-lockfile` for reproducible builds
- `db:generate` runs at build time so Prisma client is included in standalone output
- All tasks completed successfully