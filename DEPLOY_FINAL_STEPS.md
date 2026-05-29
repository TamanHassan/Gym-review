Deployment final steps

This file lists the minimal actions you need to perform to deploy the app to Render (backend) and Vercel (frontend), wire the live URLs into the repo, and enable CI-driven updates.

1) Create services

- Render (Backend)
  - Create a new Web Service, connect your GitHub repo, and set the Root Directory to `backend`.
  - Build Command: `npm install`
  - Start Command: `npm start`
  - Add environment variables in Render dashboard:
    - `NODE_ENV=production`
    - `PORT=3000`
    - `FIREBASE_PROJECT_ID` (your Firebase project id)
    - `FIREBASE_KEY_BASE64` (base64 of firebase service account JSON) OR upload `firebase-key.json` in a secure store and set `FIREBASE_KEY_PATH` accordingly
    - `CORS_ORIGIN` → your frontend deployed URL (set after frontend deploy)

- Vercel (Frontend)
  - Import project, set Root Directory to `frontend`, Framework: `Vite`.
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Add Environment Variables (Project Settings → Environment Variables):
    - `VITE_API_URL` => your Render backend URL (https://...)
    - `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`

2) Set GitHub Secrets (Repository → Settings → Secrets)

- `RENDER_API_KEY` - Render API key (optional if you use manual deploys)
- `RENDER_BACKEND_SERVICE_ID` - Render service ID (optional)
- `VERCEL_TOKEN` - Vercel token (optional)
- `VERCEL_ORG_ID` - Vercel org id (optional)
- `VERCEL_PROJECT_ID` - Vercel project id (optional)
- `BACKEND_URL` - Final deployed backend URL (used to update README)
- `FRONTEND_URL` - Final deployed frontend URL (used to update README)
- `FIREBASE_KEY_JSON` - (for CI tests) the raw JSON content of firebase service account (used by `test.yml`)
- `FIREBASE_PROJECT_ID` - Firebase project id used by CI tests
- VITE_* Firebase values used by CI tests (`VITE_FIREBASE_API_KEY`, etc.)

3) Trigger the deployment

- Option A: Use the Render and Vercel dashboards and let GitHub Actions `deploy.yml` verify and update README.
- Option B: Manually run the `workflow_dispatch` from the Actions tab (or use this curl):

```bash
curl -X POST -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer <PERSONAL_ACCESS_TOKEN>" \
  https://api.github.com/repos/<OWNER>/<REPO>/actions/workflows/deploy.yml/dispatches \
  -d '{"ref":"main"}'
```

4) After deploy

- Add `BACKEND_URL` and `FRONTEND_URL` as repository secrets (or set them as workflow inputs) so the `deploy.yml` verify step can check health and the README updater can commit real URLs.
- Confirm the app: visit the frontend URL, login, and create a gym/review to verify end-to-end behavior.

Notes

- The CI `test.yml` already uses `FIREBASE_KEY` secret to run tests. Make sure to set `FIREBASE_KEY_JSON` in GitHub Secrets if you want CI to run tests that need a Firebase key.
- For Render, `FIREBASE_KEY_BASE64` avoids newline/quoting issues in deployment UIs; create it locally with `base64 -w 0 path/to/firebase-key.json` (Linux/macOS) or `certutil -encode` on Windows and paste into secret.
