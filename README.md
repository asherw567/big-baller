# BigBallerBank

Fictional film-prop PWA. No real banking or money movement. Source recovered from the downloaded BigBallerBank v1.3 upload ZIP. Deployment improvements are version 1.3.1.

## Automatic deployment

Pushes to `main` run the build and tests, then deploy with GitHub Actions to the **existing** Cloudflare Pages project. Pull requests run tests without receiving Cloudflare secrets. The workflow refuses a project whose Cloudflare-reported subdomain is not `bank-3za.pages.dev`, uses its existing production branch, and checks the live version and commit after uploading. It never creates a replacement project.

### One-time secure setup

1. Revoke the API token previously pasted in chat at https://dash.cloudflare.com/profile/api-tokens. Treat that token as compromised. Never put a token in source, chat, or a command argument.
2. Create a replacement custom token with **Account / Cloudflare Pages / Edit**, restricted to the specific account that owns this Pages project. This permission is account scoped; do not assume it is restricted to a single project. Do not add unrelated permissions.
3. In the Cloudflare dashboard, open the existing project serving `https://bank-3za.pages.dev/`. Obtain the exact project name and Account ID there. Do not infer the project name from the URL, and do not create a new project or change its hostname.
4. At https://github.com/asherw567/big-baller/settings/secrets/actions, save these **repository secrets** directly:
   - `CLOUDFLARE_API_TOKEN`: the replacement token.
   - `CLOUDFLARE_ACCOUNT_ID`: the owning account's ID.
   - `CLOUDFLARE_PROJECT_NAME`: the existing project's exact name.
5. Open Actions → Test and deploy BigBallerBank → Run workflow, choosing `main`. Confirm both jobs succeed and the live verification passes.

Cloudflare credentials are only provided to the lookup and deployment steps. Logs do not print credentials or API response bodies. The app bundle contains no Cloudflare credentials. GitHub Actions uses read-only repository permissions and pinned action revisions.

## Updates and passkeys

The build produces content-hashed JavaScript/CSS, a distinct service-worker cache per build, and `version.json`. Pages revalidates assets; the service worker and version endpoint use `no-store`. Opening or returning to the app checks for worker updates. An existing controlled page reloads after a worker change, waiting for an active passkey operation to finish. Offline navigation uses the cached app; missing scripts never receive HTML fallback.

Keep the same origin, manifest scope/start URL, and local storage keys. Deployment does not clear device data. Existing passkeys still require the original device/browser storage and hostname; do not test enrollment on a preview hostname expecting it to transfer. Actual Face ID continuity must be verified on the user's enrolled device.

## Local checks

With Node 24 or newer:

```sh
node scripts/build.mjs
node --test scripts/*.test.mjs
```

Deploy only the generated `dist/` directory. Source and setup documentation are excluded from the published app. To recover from a bad release, use the existing project's Cloudflare Pages rollback, then fix or revert the source before the next push.

Reference: https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/

