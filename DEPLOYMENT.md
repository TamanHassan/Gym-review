# Deployment Guide

This guide walks through deploying the Gym Review application to Vercel (frontend) and Render (backend).

## Prerequisites

- GitHub repository with code pushed to `main` branch
- Vercel account (free tier at https://vercel.com)
- Render account (free tier at https://render.com)
- Firebase project with Email/Password authentication enabled
- Backend Firebase service account key (`.json` file)

## Part 1: Prepare Your Code

### 1. Ensure `.env` Files are Not Committed

Verify `.gitignore` includes:
```
backend/.env
frontend/.env.local
firebase-key.json
```

### 2. Create `.env.example` Files

**backend/.env.example:**
```env
PORT=3000
NODE_ENV=development
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_KEY_PATH=./firebase-key.json
CORS_ORIGIN=http://localhost:5173
```

**frontend/.env.example:**
```env
VITE_API_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 3. Push to GitHub

```bash
git add .
git commit -m "Add Docker and deployment files"
git push origin main
```

## Part 2: Deploy Backend to Render

### Step 1: Create Render Account

1. Go to https://render.com
2. Click "Sign up"
3. Create account (can use GitHub OAuth for easier setup)

### Step 2: Create Web Service

1. In Render dashboard, click "New +"
2. Select "Web Service"
3. Select "Build and deploy from a Git repository"
4. Click "Connect account" (GitHub)
5. Find and select your repository
6. Click "Connect"

### Step 3: Configure Service

Fill in these settings:

| Field | Value |
|-------|-------|
| Name | `gym-review-backend` |
| Region | Choose nearest to your location |
| Branch | `main` |
| Root Directory | `backend` |
| Runtime | `Node` |
| Build Command | `npm install` |
| Start Command | `npm start` |

### Step 4: Add Environment Variables

Click "Advanced" and add these environment variables:

```
NODE_ENV=production
PORT=3000
FIREBASE_PROJECT_ID=gym-review-39103
CORS_ORIGIN=https://your-vercel-url (update after frontend is deployed)
FIREBASE_KEY_PATH=./firebase-key.json
```

### Step 5: Upload Firebase Key

This is tricky because Render doesn't have a file upload feature. Two options:

**Option A: Base64 Encode (Recommended)**

1. Open a terminal and convert your Firebase key:
```bash
base64 -i backend/firebase-key.json
```

2. Copy the entire base64 output
3. In Render, add environment variable:
   - Key: `FIREBASE_KEY_BASE64`
   - Value: Paste the base64 string

4. In `backend/src/services/firebase.js`, modify to decode:
```javascript
import fs from "fs";

let serviceAccount;

if (process.env.FIREBASE_KEY_BASE64) {
  const decoded = Buffer.from(process.env.FIREBASE_KEY_BASE64, 'base64').toString('utf-8');
  serviceAccount = JSON.parse(decoded);
} else if (process.env.FIREBASE_KEY_PATH) {
  serviceAccount = JSON.parse(fs.readFileSync(process.env.FIREBASE_KEY_PATH, 'utf-8'));
}
```

**Option B: Store as Environment Variable (Less secure but simpler)**

Not recommended for production as it exposes the entire key in the environment variable.

### Step 6: Deploy

1. Click "Create Web Service"
2. Render will automatically build and deploy
3. Wait for "Service is live" message
4. Note your URL: `https://gym-review-backend-xxxxx.onrender.com`

### Step 7: Verify Backend

Test your backend is working:
```bash
curl https://your-render-url/gyms
# Should return: [{"id":1,"name":"Nordic Fitness",...}, ...]

curl https://your-render-url/api/health
# Should return: {"status":"ok","timestamp":"2026-05-22T..."}
```

## Part 3: Deploy Frontend to Vercel

### Step 1: Create Vercel Account

1. Go to https://vercel.com
2. Click "Sign up"
3. Click "Continue with GitHub"
4. Authorize Vercel to access your GitHub

### Step 2: Import Project

1. In Vercel dashboard, click "Add New..."
2. Select "Project"
3. Find your repository
4. Click "Import"

### Step 3: Configure Project

1. **Project Name**: `gym-review`
2. **Framework Preset**: Select "Vite"
3. **Root Directory**: Select `frontend`
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`

### Step 4: Add Environment Variables

Before deploying, add these variables:

```
VITE_API_URL=https://your-render-backend-url
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=gym-review-39103
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Step 5: Deploy

1. Click "Deploy"
2. Vercel builds and deploys automatically
3. Wait for "Congratulations" message
4. Note your URL: `https://gym-review.vercel.app`

### Step 6: Verify Frontend

1. Open `https://your-vercel-url`
2. You should see the Gym Review app
3. Click "Login" and test authentication
4. Try creating a gym or leaving a review

## Part 4: Update Backend CORS

Now that frontend is deployed, update backend CORS:

1. Go to Render dashboard
2. Select your backend service
3. Go to "Environment" tab
4. Edit `CORS_ORIGIN` variable
5. Change to: `https://your-vercel-url` (without trailing slash)
6. Click "Save"
7. Service will redeploy automatically

## Part 5: Test End-to-End

### Test Authentication

1. Open your frontend URL
2. Click "Login"
3. Use any email/password (Firebase allows new accounts in test mode)
4. Should show "Logout" button after login
5. Protected content (Create Gym, Profile) should be visible

### Test API Connectivity

1. Open browser DevTools → Network tab
2. Click "Create Gym"
3. Fill in gym name and location
4. Submit form
5. In Network tab, verify:
   - Request goes to `https://your-render-url/gyms`
   - Response status is 201 (Created)
   - Response includes the new gym data

### Test CORS

In browser console:
```javascript
fetch('https://your-render-url/gyms')
  .then(r => r.json())
  .then(d => console.log(d))
```

Should return array of gyms (no CORS errors).

## Part 6: Configure GitHub Actions (Optional)

To automatically deploy on push, add secrets:

1. Go to GitHub repository
2. Settings → Secrets and variables → Actions
3. Add new repository secrets:

```
RENDER_API_KEY=your-render-api-key
RENDER_BACKEND_SERVICE_ID=your-service-id
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
BACKEND_URL=https://your-render-url
FRONTEND_URL=https://your-vercel-url
```

Then the `.github/workflows/deploy.yml` will automatically deploy on push to `main`.

## Troubleshooting

### Backend won't start

**Check Render logs:**
1. Go to Render dashboard
2. Select service
3. Click "Logs"
4. Look for error messages

**Common issues:**
- Missing Firebase key: Verify `FIREBASE_KEY_BASE64` is set
- Wrong project ID: Check Firebase console for correct ID
- Port issues: Ensure `PORT=3000` in environment variables

### Frontend shows "Cannot connect to API"

**Check:**
1. Frontend `VITE_API_URL` points to correct Render URL
2. Backend `CORS_ORIGIN` matches frontend URL (no trailing slash!)
3. Backend is actually running (check Render logs)
4. In browser DevTools, check Network tab for API requests

**Test:**
```javascript
fetch('https://your-render-url/api/health')
  .then(r => r.json())
  .then(d => console.log(d))
  .catch(e => console.error(e))
```

### Login not working

**Check:**
1. Firebase config variables are correct
2. Firebase Email/Password provider is enabled
3. Check browser console for Firebase errors
4. Test with new account (not existing one)

### Docker issues

**Build fails locally:**
```bash
docker build -t test backend/
```

Check output for specific error.

**Common issues:**
- Missing `package.json` in `backend/` root
- Old `node_modules` in build context (use `.dockerignore`)
- Syntax error in Dockerfile

## Security Reminders

Before going live:

1. ✓ Never commit `.env` files
2. ✓ Use environment variables for all secrets
3. ✓ Set `CORS_ORIGIN` to specific URL (not `*`)
4. ✓ Use HTTPS everywhere (Vercel and Render provide it)
5. ✓ Test with real Firebase account (not test mode)
6. ✓ Verify tokens are not stored in localStorage
7. ✓ Check Network tab for sensitive data being sent

## Next Steps

1. Test thoroughly in production
2. Monitor error logs (Render and Vercel dashboards)
3. Set up monitoring/alerts if needed
4. Keep dependencies updated
5. Consider adding database (PostgreSQL on Render)

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **Firebase Docs**: https://firebase.google.com/docs
- **Docker Docs**: https://docs.docker.com
