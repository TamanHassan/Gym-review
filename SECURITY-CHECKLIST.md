# Security Checklist for Production

Complete this checklist before going live. Check off each item and document the status.

## 1. Secret Management & Environment Variables

- [ ] No `.env` files committed to Git
  - Verify: `git log --all --full-history -- backend/.env frontend/.env.local`
  - Should return: No results

- [ ] No Firebase private keys in repository
  - Verify: `grep -r "private_key" .`
  - Should return: No matches in source code (only in `.env.example` structure)

- [ ] `.env.example` shows structure without values
  - Verify: Check `backend/.env.example` and `frontend/.env.example`
  - Example: `FIREBASE_API_KEY=your-api-key` (not real key)

- [ ] All environment variables defined in deployment platform
  - Render dashboard → Environment variables
  - Vercel dashboard → Environment variables

- [ ] No secrets logged to console in production
  - Verify: `grep -r "console.log" src/` doesn't log tokens/keys
  - Check: NODE_ENV=production in production

- [ ] Docker images exclude secrets
  - Verify: `.dockerignore` includes `.env`, `firebase-key.json`
  - Build and verify: `docker build -t test backend/`

## 2. CORS Configuration

- [ ] CORS origin restricted to deployed frontend URL
  ```javascript
  // ✓ Correct:
  cors({ origin: "https://gym-review.vercel.app" })
  
  // ✗ Wrong:
  cors({ origin: "*" })
  ```
  - Verify: `grep -A 2 "cors(" backend/src/app.js`

- [ ] CORS origin updated after frontend deployment
  - Production URL: `https://your-vercel-url`
  - Backend .env: `CORS_ORIGIN=https://your-vercel-url`
  - Render environment: Update after frontend is deployed

- [ ] credentials: true enabled
  - Verify: `cors({ ... credentials: true })`

- [ ] Preflight OPTIONS requests handled
  - Test: 
    ```bash
    curl -X OPTIONS https://your-api-url/gyms \
      -H "Origin: https://your-frontend-url" \
      -H "Access-Control-Request-Method: POST"
    # Should return 200 with CORS headers
    ```

## 3. Authentication & Token Security

- [ ] Tokens NOT stored in localStorage
  - Frontend: Uses `browserSessionPersistence` (session storage)
  - Verify: `firebase.js` has `setPersistence(auth, browserSessionPersistence)`

- [ ] Tokens included in Authorization header
  - All authenticated requests use: `Authorization: Bearer <token>`
  - Verify: `api.js` includes token in headers

- [ ] withCredentials set for authenticated requests
  - Frontend fetch calls include credentials
  - Backend allows credentials in CORS

- [ ] Backend verifies tokens with Firebase Admin SDK
  - Verify: `verifyToken.js` uses `auth.verifyIdToken(token)`

- [ ] Protected routes return 401 for missing/invalid tokens
  - Test: 
    ```bash
    curl https://your-api-url/gyms
    # Should return 200 (public)
    
    curl https://your-api-url/gyms -H "Authorization: Bearer invalid"
    # Should return 401
    ```

- [ ] Auth redirect URIs use deployed URLs
  - Firebase console → Authentication → Authorized domains
  - Add: `your-vercel-url`
  - Remove: `localhost`

## 4. HTTPS & Transport Security

- [ ] All deployed URLs use HTTPS
  - Frontend: `https://your-vercel-url` ✓ (Vercel automatic)
  - Backend: `https://your-render-url` ✓ (Render automatic)

- [ ] No unencrypted (HTTP) connections in code
  - Verify: `grep -r "http://" src/` 
  - Only localhost should appear

- [ ] Firebase connects over HTTPS
  - Verify: Firebase SDK uses HTTPS by default ✓

## 5. Application Security Headers

- [ ] X-Powered-By header hidden
  - Verify: Backend has `app.disable("x-powered-by")`

- [ ] Security headers set
  - Verify: Backend sets:
    - `X-Content-Type-Options: nosniff`
    - `X-Frame-Options: DENY`
    - `X-XSS-Protection: 1; mode=block`

- [ ] No sensitive information in error messages
  - Error messages don't expose:
    - System paths
    - Database structure
    - Framework details

## 6. API Input Validation

- [ ] All protected endpoints validate input
  - Verify: `POST /gyms` checks name and location
  - Verify: `POST /gyms/:id/reviews` checks rating and comment

- [ ] Requests with missing fields return 400
  - Test:
    ```bash
    curl -X POST https://your-api-url/gyms \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"name": "Incomplete"}'
    # Should return 400 (missing location)
    ```

- [ ] Invalid data types rejected
  - Rating must be number 1-5
  - Comments must be strings

## 7. Docker Security

- [ ] Multi-stage builds used
  - Verify: Backend and frontend Dockerfiles have build stage

- [ ] .dockerignore excludes unnecessary files
  - Check: `node_modules`, `.env`, `firebase-key.json`, `.git`

- [ ] No secrets copied into images
  - Verify: Dockerfile doesn't `COPY .env`

- [ ] Alpine base image used (smaller attack surface)
  - Verify: `FROM node:22-alpine`

- [ ] Image runs as non-root user (recommended)
  - Optional: Add `USER node` at end of Dockerfile

## 8. Database & Data Storage

- [ ] No hardcoded data in code
  - Verify: Gyms array in `gyms.js` is development only

- [ ] Production: Plan for persistent database
  - Note: Current in-memory storage resets on restart
  - Recommendation: PostgreSQL on Render

- [ ] No sensitive data in logs
  - Logs don't include: tokens, passwords, personal info

## 9. Testing

- [ ] All unit tests pass
  ```bash
  cd backend && npm test
  cd frontend && npm test
  ```

- [ ] Production tests pass
  - CORS tests verify correct headers
  - API tests verify response structure
  - Security tests verify no sensitive headers

- [ ] CI/CD pipeline runs on every push
  - GitHub Actions workflow executes
  - All tests pass before merge

- [ ] Integration tests verify deployed environment
  ```bash
  # Test real URLs
  curl https://your-api-url/gyms
  curl https://your-frontend-url
  ```

## 10. Deployment Platform Security

### Render (Backend)

- [ ] Environment variables in Render dashboard (not in Dockerfile)
- [ ] Firebase key loaded from `FIREBASE_KEY_BASE64`
- [ ] Health check configured: `GET /api/health`
- [ ] Auto-restart on crash enabled
- [ ] Logs monitored for errors

### Vercel (Frontend)

- [ ] Environment variables in Vercel dashboard
- [ ] No sensitive data in build logs
- [ ] Preview deployments work correctly
- [ ] Production domain configured
- [ ] Analytics/monitoring configured (optional)

## 11. Firebase Console Configuration

- [ ] Email/Password authentication enabled
- [ ] Authorized domains include deployed frontend
- [ ] Authorized domains do NOT include localhost
- [ ] No overly permissive Firestore/Realtime DB rules
- [ ] Service account key restricted to backend only

## 12. GitHub Repository

- [ ] `.gitignore` includes all sensitive files
  ```
  .env
  .env.local
  firebase-key.json
  node_modules
  ```

- [ ] No credentials in git history
  - Verify: `git log --all -S "AKIA"` (AWS key pattern)

- [ ] Secrets configured in GitHub
  - Settings → Secrets and variables → Actions
  - Contains: API keys, tokens for deployment

- [ ] Branch protection on main (optional but recommended)
  - Require pull request reviews
  - Require status checks to pass

## 13. Monitoring & Logging

- [ ] Backend logs monitored
  - Render dashboard → Logs
  - Check for errors and warnings

- [ ] Frontend errors tracked
  - Browser console should not show CORS errors
  - Check Network tab for failed requests

- [ ] Health check endpoints working
  - Backend: `GET /api/health` returns 200
  - Frontend: Page loads and displays content

## 14. User Data & Privacy

- [ ] User data handled securely
  - Firebase handles user credentials
  - API doesn't log passwords/tokens

- [ ] Consider GDPR/privacy implications
  - Data retention policy
  - User data deletion capability

## Final Security Test Checklist

Run these tests to verify everything works:

```bash
# 1. Test public endpoints (should work without auth)
curl https://your-api-url/gyms -v
# Check: Status 200, no CORS errors

# 2. Test protected endpoints without auth (should fail)
curl -X POST https://your-api-url/gyms \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "location": "Test"}' -v
# Check: Status 401

# 3. Test CORS headers
curl -X OPTIONS https://your-api-url/gyms \
  -H "Origin: https://your-vercel-url" \
  -H "Access-Control-Request-Method: POST" -v
# Check: CORS headers present

# 4. Test HTTPS
curl https://your-api-url -v
# Check: Uses https://, valid certificate

# 5. Test authentication flow in browser
# Open frontend URL
# Click Login
# Fill email/password
# Should see "Logout" button and protected content
```

## Sign-Off

- **Date Completed**: _______________
- **Completed By**: _______________
- **Reviewed By**: _______________

## Issues Found & Remediation

| Issue | Status | Remediation |
|-------|--------|-------------|
| | | |
| | | |
| | | |

---

**Remember**: Security is not a one-time checklist. Monitor logs, update dependencies, and review access regularly.
