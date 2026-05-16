# Frontend - Gym Review API

React application with Firebase authentication and REST API integration.



```
frontend/
├── src/
│   ├── App.jsx                    # Main component
│   ├── main.jsx                   # React entry point
│   ├── components/
│   │   ├── GymList.jsx            # Display gyms
│   │   ├── LoginButton.jsx        # Login trigger
│   │   ├── LogoutButton.jsx       # Logout action
│   │   └── ProtectedForm.jsx      # Create gyms/reviews
│   ├── services/
│   │   ├── firebase.js            # Firebase auth
│   │   └── api.js                 # API calls
│   └── tests/
│       └── components.test.jsx    # Component tests
├── .env                           # Environment (not in git)
├── .env.example                   # Example env template
├── index.html                     # HTML entry point
├── package.json
├── vite.config.js                 # Vite configuration
└── README.md
```



1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create .env file**
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase config
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   App opens at http://localhost:5173

4. **Run tests**
   ```bash
   npm test
   ```



### Core
- **react**: UI library
- **react-dom**: React rendering

### Authentication
- **firebase**: Client SDK for authentication

### Development
- **vite**: Fast build tool and dev server
- **vitest**: Unit test runner
- **@testing-library/react**: Component testing utilities



See `.env.example` for template:

```bash
VITE_API_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
```

Get these from Firebase Console → Project Settings.



### Login Flow

1. User enters email/password in LoginButton
2. Firebase SDK authenticates and returns ID token
3. Token stored securely in browser memory (not localStorage!)
4. Token automatically sent with protected API requests

### Logout Flow

1. User clicks LogoutButton
2. Firebase SDK clears session
3. All authenticated requests return 401
4. User redirected to login page

### Protected Components

Components that require authentication:
- **ProtectedForm**: Create gyms and add reviews
- **Profile display**: Shows user info

Components that check `isLoggedIn`:
```javascript
{user && <ProtectedForm isLoggedIn={true} />}
{!user && <div>Please log in</div>}
```



### Run Tests
```bash
npm test
```

### Watch Mode
```bash
npm test -- --watch
```

### Test Coverage
```bash
npm test -- --coverage
```

### Test Files
- `src/tests/components.test.jsx` - Component logic tests

### What's Tested
-  LoginButton renders and handles clicks
-  LogoutButton calls logout function
-  GymList displays gyms with correct data
-  GymList shows loading/error/empty states
-  ProtectedForm requires authentication
-  Form validation (rating 1-5, required fields)



### API Service (`src/services/api.js`)

```javascript
// Public endpoints (no auth needed)
fetchGyms()           // GET /gyms
fetchGym(id)          // GET /gyms/:id

// Protected endpoints (require Bearer token)
createGym(name, location)    // POST /gyms
addReview(gymId, rating, comment)  // POST /gyms/:id/reviews
fetchProfile()        // GET /profile
```

All protected methods automatically include the Bearer token:

```javascript
const headers = await getAuthHeaders();
// Includes: "Authorization: Bearer <token>"
```



### GymList
Displays all gyms in a list format.

**Props:**
- `gyms` (array) - Gym data
- `loading` (bool) - Show loading state
- `error` (string) - Show error message

**States:**
- Loading → "Loading gyms..."
- Error → Shows error message
- Empty → "No gyms available"
- Loaded → List of gyms with review counts

### LoginButton
Triggers login form display.

**Props:**
- `onLoginClick` (func) - Called when clicked

**Returns:**
- Blue button with "Login" text

### LogoutButton
Logs out current user.

**Props:**
- `onLogoutClick` (func) - Called after logout

**Returns:**
- Red button with "Logout" text

### ProtectedForm
Create gyms or add reviews (requires login).

**Props:**
- `isLoggedIn` (bool) - Show form only if true
- `onGymCreated` (func) - Called when gym created

**Features:**
- Toggle between "Create Gym" and "Add Review" modes
- Form validation
- Error/success messages
- Disabled during submission

### App (Main Component)
Orchestrates all components and state.

**Key Functions:**
- Monitors auth state changes
- Loads gyms on mount
- Handles login/logout
- Manages component visibility based on auth



### Token Management

**What we do:**
-  Token stored in browser memory only (Firebase SDK)
-  Token never exposed in code
-  Token automatically refreshed by SDK
-  Token sent in `Authorization` header only

**What we DON'T do:**
-  Store token in localStorage
-  Store token in sessionStorage
-  Log token to console
-  Include token in URL/cookies

### API Requests

Protected requests include token:
```javascript
const token = await getToken();
const headers = {
  "Authorization": `Bearer ${token}`
};
```

### CORS

Frontend configured to accept responses from backend only:
- No wildcard `*` origin
- Specific backend URL: `http://localhost:3000`



### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
# Creates dist/ folder with optimized build
```

### Preview Production Build
```bash
npm run preview
# Serves dist/ locally
```

### Deploy to Vercel (Example)
```bash
npm install -g vercel
vercel
# Follow prompts, automatically detects Vite
```

### Deploy to Netlify (Example)
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```



### Development
```bash
VITE_API_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=dev-key
```

### Production
```bash
VITE_API_URL=https://api.example.com
VITE_FIREBASE_API_KEY=prod-key
```

Update `.env` before building for production.



### "Cannot find module 'firebase'"
```bash
npm install firebase
```

### Requests return 401 even with login
- Check `VITE_API_URL` points to backend
- Ensure backend `.env` has same `CORS_ORIGIN`
- Verify Firebase project ID matches on frontend/backend

### API requests fail with CORS error
- Backend CORS_ORIGIN doesn't match frontend URL
- Check both are using same protocol (http/https)
- Both using same ports if localhost

### "Firebase config is invalid"
- Copy credentials from Firebase Console correctly
- Check all 6 fields are present in `.env`
- No trailing spaces in values



### Check Auth State
```javascript
import { auth } from './services/firebase.js';

console.log("Current user:", auth.currentUser);
console.log("Auth state:", auth.currentUser?.uid);
```

### Check API Requests
```javascript
// Browser DevTools → Network tab
// Should see requests with Authorization header
```

### Firebase Console
- Go to Authentication tab
- See list of users
- Check custom claims and metadata

## 📱 Features

- Sign in with email/password
- Sign out (clear session)
- Browse gyms (public)
- View gym details (public)
- Create new gym (protected)
- Add review with rating (protected)
- View profile info (protected)
- Responsive design
- Error handling with user feedback



- [Firebase JavaScript SDK](https://firebase.google.com/docs/web/setup)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [REST API Guide](https://restfulapi.net/)

---

