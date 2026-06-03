import React, { useEffect, useState } from "react";
import { auth, firebaseInitialized, login, logout } from "./services/firebase.js";
import { fetchGyms, fetchProfile } from "./services/api.js";
import LoginButton from "./components/LoginButton.jsx";
import LogoutButton from "./components/LogoutButton.jsx";
import GymList from "./components/GymList.jsx";
import ProtectedForm from "./components/ProtectedForm.jsx";

function App() {
  const [user, setUser] = useState(null);
  const [gyms, setGyms] = useState([]);
  const [profile, setProfile] = useState(null);
  const [userRole, setUserRole] = useState("user");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Monitor auth state changes
  useEffect(() => {
    if (!firebaseInitialized) {
      // In test mode, show login form
      setLoading(false);
      return;
    }

    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userProfile = await fetchProfile();
          setProfile(userProfile);
          setUserRole(userProfile.role || "user");
        } catch (err) {
          console.error("Failed to fetch profile:", err);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const refreshGyms = async () => {
    setLoading(true);
    try {
      const data = await fetchGyms();
      setGyms(data);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load gyms on component mount
  useEffect(() => {
    refreshGyms();
  }, []);

  const handleLoginClick = () => {
    setShowLoginForm(!showLoginForm);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const user = await login(loginEmail, loginPassword);
      setUser(user);
      setShowLoginForm(false);
      setLoginEmail("");
      setLoginPassword("");
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed: " + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setProfile(null);
      setShowLoginForm(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleGymCreated = (newGym) => {
    setGyms((currentGyms) => [...currentGyms, newGym]);
  };

  const handleGymDeleted = (gymId) => {
    setGyms((currentGyms) => currentGyms.filter((gym) => gym.id !== gymId));
  };

  const handleReviewDeleted = (gymId, reviewId) => {
    setGyms((currentGyms) =>
      currentGyms.map((gym) => {
        if (gym.id === gymId) {
          return {
            ...gym,
            reviews: gym.reviews.filter((review) => review.id !== reviewId)
          };
        }
        return gym;
      })
    );
  };

  const handleReviewAdded = async () => {
    await refreshGyms();
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Gym Review API</h1>
        <div className="header-content">
          <p>Welcome to the Gym Review Platform</p>
          <div>
            {user ? (
              <div className="user-info">
                <span>Logged in as: <strong>{user.email}</strong></span>
                <LogoutButton onLogoutClick={handleLogout} />
              </div>
            ) : (
              <LoginButton onLoginClick={handleLoginClick} />
            )}
          </div>
        </div>
      </header>

      {showLoginForm && !user && (
        <div className="login-form">
          <h3>Login to Your Account</h3>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="your@email.com"
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="form-control"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Login
              </button>
              <button
                type="button"
                onClick={() => setShowLoginForm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {user && profile && (
        <div className="profile-card">
          <h4>Your Profile</h4>
          <p><strong>UID:</strong> {profile.uid}</p>
          <p><strong>Email:</strong> {profile.email}</p>
        </div>
      )}

      <GymList gyms={gyms} loading={loading} error={error} user={user} onGymDeleted={handleGymDeleted} onReviewDeleted={handleReviewDeleted} />

      {user && (
        <ProtectedForm isLoggedIn={true} userRole={userRole} onGymCreated={handleGymCreated} onReviewAdded={handleReviewAdded} />
      )}

      {error && (
        <div className="message message-error">
          Error: {error}
        </div>
      )}
    </div>
  );
}

export default App;
