# Releasing

This document is for maintainers only.

## Baseline

This project uses Bun throughout (install, build, test, publish). If that changes, update this document accordingly.

### JSR

JSR publishing uses OIDC — no token is needed. The workflow already has `id-token: write`.

First-time only: create the package on [jsr.io](https://jsr.io) under the `@sylvaincombes` scope
and link it to this GitHub repository so that OIDC publishing is authorised.

## Release steps

1. Update `CHANGELOG.md`.
2. Ensure `package.json` has the correct version.
3. Tag and push:

```sh
git tag vX.Y.Z
git push origin vX.Y.Z
```

GitHub Actions will build, publish to npm (via `bun publish`) and JSR, and create the GitHub Release with the build zip attached.
