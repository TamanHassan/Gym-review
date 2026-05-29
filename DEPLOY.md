Deployment Guide

This document explains how to deploy the Gym Review project using Render (backend) and Vercel (frontend), including how to securely provide the Firebase service account.

Backend (Render)

1. Build & code
- Ensure your backend `package.json` `start` script runs `node src/server.js`.
- The repo already contains a `backend/Dockerfile` if you want container deployment.

2. Provide Firebase credentials
Preferred: `FIREBASE_KEY_BASE64` (recommended)
- Generate base64 from your service-account JSON (no newlines):
  - macOS / Linux:
```bash
base64 -w 0 service-account.json
```
  - Windows PowerShell:
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes('service-account.json'))
```
- In the Render dashboard for your backend service → Environment → Add Environment Variable:
  - `FIREBASE_KEY_BASE64` = (paste the base64 string exactly, no quotes)
  - `FIREBASE_PROJECT_ID` = your Firebase project ID
  - `NODE_ENV` = `production`
  - `CORS_ORIGIN` = the deployed frontend URL (e.g. https://your-frontend.vercel.app)

Alternative A: `FIREBASE_KEY_JSON`
- Paste the raw JSON string into this env var (be careful with quoting and newlines).

Alternative B: Secret Files
- Upload `service-account.json` to Render Secret Files and set `FIREBASE_KEY_PATH` to the provided path (Render shows the path after upload).

3. Restart and verify
- Redeploy the service or click "Manual Deploy" → Monitor logs.
- Confirm logs show one of:
  - `Firebase key loaded from FIREBASE_KEY_BASE64 environment variable`
  - `Firebase key loaded from file`
  - `Firebase Admin initialized successfully`

4. Health check
- Visit `https://<your-backend-url>/api/health` and ensure a 200 OK JSON response.

Frontend (Vercel)

1. Environment variables (Vite)
- In Vercel project settings → Environment Variables, add:
  - `VITE_FIREBASE_API_KEY` = (from Firebase web app)
  - `VITE_FIREBASE_AUTH_DOMAIN` = (from Firebase web app)
  - `VITE_FIREBASE_PROJECT_ID` = (your project id)
  - `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`
  - `VITE_API_URL` = your backend URL (e.g. https://gym-review-backend-17aw.onrender.com)

2. Deploy
- Connect your GitHub repo to Vercel and deploy the `frontend` directory.
- Confirm the app builds and opens at the Vercel URL.

CORS & Redirects

- Add the frontend deployed domain to Firebase Console → Authentication → Authorized domains.
- Ensure backend `CORS_ORIGIN` is set to the frontend URL (not `*`).

Testing in CI (GitHub Actions)

- The repo contains `.github/workflows/test.yml` which runs tests and builds Docker images.
- Ensure the following secrets are set in GitHub repository Secrets:
  - `FIREBASE_KEY_JSON` (raw JSON) — used in CI to run backend tests
  - `FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_*` values for frontend tests
  - `RENDER_API_KEY`, `RENDER_BACKEND_SERVICE_ID` and `VERCEL_*` tokens if you enable automated deployment

Notes & Troubleshooting

- If Render logs still show it is looking for `firebase-key.json`, it means the env var isn't available to the running service. Double-check you set the variable on the correct Render service and redeploy.
- Use `FIREBASE_KEY_BASE64` when possible — it avoids newline encoding issues common in web UIs.

Example: Quick local test

```bash
export FIREBASE_KEY_BASE64=$(base64 -w 0 service-account.json)
export FIREBASE_PROJECT_ID=your-project-id
yarn start
# then check logs for initialization messages
```

Contact

If you want, paste your service-account JSON here (or upload it) and I can generate the correct base64 string for you to paste into Render (you can delete it afterwards).