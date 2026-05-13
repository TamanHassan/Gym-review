# Backend - Gym Review API

Express.js server with Firebase authentication, REST endpoints, and comprehensive tests.

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.js              # Express app setup (routes, middleware)
│   ├── server.js           # Server entry point
│   ├── routes/
│   │   ├── gyms.js         # Gym CRUD endpoints
│   │   └── profile.js      # User profile endpoint
│   ├── middleware/
│   │   └── verifyToken.js  # Firebase token verification
│   ├── services/
│   │   └── firebase.js     # Firebase admin setup
│   └── data/
│       └── gyms.js         # Gym data (in-memory)
├── tests/
│   ├── integration/
│   │   └── gyms.test.js    # Full route tests
│   └── unit/
│       └── utils.test.js   # Business logic tests
├── .env                    # Environment variables (not in git)
├── .env.example            # Example env template
├── package.json
├── vitest.config.js        # Test runner config
└── README.md
```

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create .env file**
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase credentials
   ```

3. **Run in development**
   ```bash
   npm run dev
   ```
   Server will listen on http://localhost:3000

4. **Run tests**
   ```bash
   npm test
   ```

## 📦 Dependencies

### Core
- **express**: Web framework
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variable management

### Authentication
- **firebase-admin**: Firebase backend SDK

### Development
- **nodemon**: Auto-restart during development
- **vitest**: Fast unit test runner
- **supertest**: HTTP assertion library

## 🔑 Environment Variables

See `.env.example` for all required variables:

```bash
PORT=3000                           # Server port
NODE_ENV=development                # development | test | production
FIREBASE_PROJECT_ID=xxx             # From Firebase console
FIREBASE_KEY_PATH=./firebase-key.json
CORS_ORIGIN=http://localhost:5173   # Frontend URL
```

## 📡 API Endpoints

### Public

| Method | Route | Returns |
|--------|-------|---------|
| GET | /gyms | All gyms (200) |
| GET | /gyms/:id | Gym details or 404 |

### Protected (Require Bearer Token)

| Method | Route | Returns |
|--------|-------|---------|
| POST | /gyms | Create gym (201) or 401 |
| POST | /gyms/:id/reviews | Add review (201) or 401/404 |
| GET | /profile | User info (200) or 401 |

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npm test gyms.test.js
```

### Watch Mode (Re-run on changes)
```bash
npm test -- --watch
```

### Test Coverage
```bash
npm test -- --coverage
```

## 🔐 Authentication Flow

### Request without token
```bash
curl http://localhost:3000/profile
# Returns 401 Unauthorized
```

### Request with token
```bash
curl -H "Authorization: Bearer YOUR_ID_TOKEN" \
  http://localhost:3000/profile
# Returns user profile
```

### Getting a token (Frontend)
```javascript
import { auth } from './services/firebase.js';

const user = auth.currentUser;
const token = await user.getIdToken();
```

## 🔒 Security Implementation

### Token Verification Middleware

```javascript
// middleware/verifyToken.js
export const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.substring(7);
  
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = await auth.verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};
```

### Applied to Protected Routes

```javascript
// routes/gyms.js
router.post("/", verifyToken, (req, res) => {
  // Only executes if token is valid
  // req.user contains the user info
});
```

## 📊 Data Structure

### Gym Object
```javascript
{
  id: 1,
  name: "Nordic Fitness",
  location: "Gothenburg",
  reviews: [],
  createdBy: "user-uid"
}
```

### Review Object
```javascript
{
  id: 1,
  rating: 5,
  comment: "Great equipment!",
  userId: "user-uid",
  createdAt: "2024-01-15T10:30:00Z"
}
```

## 🐛 Common Issues

### "Firebase key file not found"
- Set correct `FIREBASE_KEY_PATH` in `.env`
- Download service account key from Firebase Console
- Path should be relative or absolute

### CORS errors
- Check `CORS_ORIGIN` matches frontend URL
- Ensure frontend makes requests to backend URL
- Don't use wildcard `*` for security

### 401 Unauthorized on protected routes
- Ensure frontend sends Bearer token in `Authorization` header
- Verify token is current (not expired)
- Check token comes from same Firebase project

## 🚀 Deployment

### Heroku (Example)
```bash
# Set environment variables
heroku config:set FIREBASE_PROJECT_ID=xxx
heroku config:set FIREBASE_KEY_PATH=/app/firebase-key.json

# Deploy
git push heroku main
```

### Environment Variables for Production
```bash
NODE_ENV=production
PORT=8080  # or container port
CORS_ORIGIN=https://yourfrontend.com
```

## 📝 Adding New Routes

1. Create route file in `src/routes/`
2. Import verifyToken if protected
3. Apply middleware to endpoints
4. Export router
5. Add to `src/app.js`

Example:
```javascript
// src/routes/example.js
import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Public endpoint" });
});

router.post("/", verifyToken, (req, res) => {
  res.json({ message: "Protected endpoint" });
});

export default router;
```

Then in `src/app.js`:
```javascript
import exampleRoutes from "./routes/example.js";
app.use("/example", exampleRoutes);
```

## 🔗 Related Documentation

- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Express.js Guide](https://expressjs.com/)
- [Vitest Documentation](https://vitest.dev/)
- [REST API Best Practices](https://restfulapi.net/)

---

**Last Updated**: January 2024
