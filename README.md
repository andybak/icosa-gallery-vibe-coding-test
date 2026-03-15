<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/72a7fbc9-9460-4f9f-bba2-cd32f68c126c

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

## Google Play Store (PWA/TWA) readiness

This repository now includes the parts we can safely automate in source control:

- A valid web manifest with local app icons and maskable icon metadata.
- Local text-based (non-binary) PWA icons in `public/icons/` to keep PR tooling compatible.
- Service worker registration and static service worker file.
- A Digital Asset Links template at `public/.well-known/assetlinks.example.json`.

### What you still need to do (manual)

These steps require your own domain, signing keys, and Play Console account.

1. **Choose your production web origin** (must be HTTPS).
2. **Create an Android app package** (usually Trusted Web Activity / Bubblewrap).
3. **Sign your Android app** and get the SHA-256 signing certificate fingerprint.
4. **Publish Digital Asset Links**:
   - Copy `public/.well-known/assetlinks.example.json` to `public/.well-known/assetlinks.json`.
   - Replace `package_name` and `sha256_cert_fingerprints` with your real values.
   - Deploy and verify that this is publicly reachable:
     `https://<your-domain>/.well-known/assetlinks.json`
5. **Play Console policy and metadata setup**:
   - Privacy policy URL
   - Data Safety form
   - Content rating
   - App access declarations if needed
6. **Run final verification checks** before upload:
   - Lighthouse PWA audit on production URL
   - Android install/open flow test from Play internal testing track
   - Confirm deep links stay in-app (verified links)

### Suggested release checklist

- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] Manifest icons load from your own domain
- [ ] `/.well-known/assetlinks.json` is live and valid JSON
- [ ] Android package name + SHA-256 fingerprint match asset links
- [ ] Internal testing build installs and opens your production URL in TWA

## GitHub Pages CI publishing

This repo now includes a GitHub Actions workflow at `.github/workflows/deploy-pages.yml` that:

- installs dependencies with `npm ci`
- runs `npm run lint`
- builds the app with a Pages base path (`VITE_BASE_PATH=/<repo-name>/`)
- deploys `dist/` to GitHub Pages on pushes to `main`

### One-time setup you must do in GitHub

1. Go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Ensure your default branch is `main` (or update the workflow trigger branch).
4. Push to `main` (or run the workflow manually from the Actions tab).

### If you use a custom domain

- Set `VITE_BASE_PATH=/` in the workflow build step instead of `/<repo-name>/`.
- Configure your domain in **Settings → Pages** and add DNS records.


### Note on PR tooling and icons

If your PR integration rejects binary files, keep icon assets as SVG (text files) like this repo now does.
If you later need PNG launch icons for specific stores/platform checks, generate them in CI or outside the PR flow and upload through release artifacts instead of committing binaries.
