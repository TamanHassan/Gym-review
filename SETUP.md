# 🚀 Quick Setup & Next Steps

This document guides you through setting up and running the Gym Review API project.

## ✅ What's Been Completed

### Backend (`backend/`)
- ✅ Express.js server with all routes
- ✅ Firebase authentication with verifyToken middleware
- ✅ Protected routes (POST /gyms, POST /gyms/:id/reviews, GET /profile)
- ✅ 8 comprehensive tests (5 integration + 3 unit)
- ✅ Environment variable setup

### Frontend (`frontend/`)
- ✅ React app with Vite
- ✅ Firebase authentication integration
- ✅ 4 components (GymList, LoginButton, LogoutButton, ProtectedForm)
- ✅ API service for backend integration
- ✅ 10+ component unit tests

### DevOps & Documentation
- ✅ GitHub Actions CI/CD pipeline
- ✅ .env.example templates
- ✅ Comprehensive README files
- ✅ .gitignore for security

## 🔧 Setup Instructions

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create Project"
3. Name it "gym-review"
4. Complete the setup wizard
5. In "Build" → "Authentication", enable Email/Password provider

### Step 2: Get Firebase Credentials

#### For Backend:
1. Go to Project Settings (gear icon)
2. Click "Service Accounts" tab
3. Click "Generate new private key"
4. Save as `backend/firebase-key.json`
5. Copy `projectId` to `backend/.env`

#### For Frontend:
1. In Project Settings, copy these values:
   - API Key
   - Auth Domain
   - Project ID
   - Storage Bucket
   - Messaging Sender ID
   - App ID
2. Paste into `frontend/.env`

### Step 3: Setup Backend

```bash
cd backend
npm install
# Create .env (see backend/.env.example)
# Add your Firebase credentials
npm test        # Run tests to verify setup
npm run dev     # Start server on port 3000
```

### Step 4: Setup Frontend

```bash
cd frontend
npm install
# Create .env (see frontend/.env.example)
# Add your Firebase credentials
npm test        # Run tests to verify setup
npm run dev     # Start app on port 5173
```

## 🧪 Running Tests

### Backend Tests
```bash
cd backend
npm test              # Run once
npm test -- --watch  # Run on file changes
npm test -- --coverage  # With coverage report
```

**Expected Output:**
```
✓ tests/integration/gyms.test.js (9)
✓ tests/unit/utils.test.js (6)

Test Files  2 passed (2)
     Tests  15 passed (15)
```

### Frontend Tests
```bash
cd frontend
npm test              # Run once
npm test -- --watch  # Watch mode
npm test -- --coverage  # Coverage report
```

**Expected Output:**
```
✓ src/tests/components.test.jsx (10)

Test Files  1 passed (1)
     Tests  10 passed (10)
```

## 🚀 Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Listening on http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Visit http://localhost:5173
```

## 📡 Testing the API

### Public Endpoints (No Auth)

```bash
# Get all gyms
curl http://localhost:3000/gyms

# Get specific gym
curl http://localhost:3000/gyms/1
```

### Protected Endpoints (Requires Token)

```bash
# You'll need a Firebase ID token
# Get it from the frontend after logging in

# Create gym (requires Bearer token)
curl -X POST http://localhost:3000/gyms \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Gym","location":"City"}'

# Add review (requires Bearer token)
curl -X POST http://localhost:3000/gyms/1/reviews \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rating":5,"comment":"Great!"}'

# Get profile (requires Bearer token)
curl -X GET http://localhost:3000/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔑 Key Files

| File | Purpose |
|------|---------|
| `backend/src/app.js` | Express app setup |
| `backend/src/middleware/verifyToken.js` | Firebase token validation |
| `backend/src/routes/gyms.js` | Gym API endpoints |
| `backend/tests/integration/gyms.test.js` | Route tests |
| `frontend/src/App.jsx` | Main React component |
| `frontend/src/services/firebase.js` | Firebase auth setup |
| `frontend/src/services/api.js` | API client |
| `.github/workflows/test.yml` | CI/CD pipeline |

## 🔐 Security Checklist

Before deploying, verify:

- ✅ `.env` files are in `.gitignore`
- ✅ No `firebase-key.json` in git history
- ✅ All `.env.example` files don't contain secrets
- ✅ Firebase tokens not in localStorage (using SDK instead)
- ✅ CORS origin points to frontend only (not wildcard)
- ✅ Backend returns 401 for unauthenticated requests
- ✅ All sensitive values in GitHub Secrets for CI/CD

## 🐛 Troubleshooting

### "Firebase key file not found"
```bash
# Make sure firebase-key.json exists in backend/
ls backend/firebase-key.json
# If missing, download from Firebase Console → Service Accounts
```

### CORS errors when calling API from frontend
```bash
# Check backend/.env CORS_ORIGIN matches frontend URL
# Dev: http://localhost:5173
# Prod: https://yourdomain.com
```

### 401 errors on protected routes
```bash
# From frontend login, get token:
const token = await user.getIdToken();
console.log(token);  // Copy this
# Then test with curl:
curl -H "Authorization: Bearer TOKEN" http://localhost:3000/profile
```

### Tests fail with "Cannot find module"
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📈 Next Steps

1. **Test locally**: Run both frontend and backend, verify login works
2. **Create test users**: Go to Firebase Console → Authentication → Create users
3. **Add to GitHub**: Push to your repository
4. **Setup Secrets**: Add Firebase config to GitHub Secrets
5. **Deploy**: Use your hosting provider (Vercel, Netlify, Heroku, etc.)

## 📚 Documentation

- [Backend README](backend/README.md) - API reference, security details
- [Frontend README](frontend/README.md) - Components, authentication flow
- [Main README](README.md) - Overview, architecture, implementation choices

## ❓ Questions?

Check the comprehensive README.md files for:
- Detailed API documentation
- Security implementation explanations
- Component API reference
- Deployment instructions
- Common issues and solutions

---

**Happy coding! 🎉**
