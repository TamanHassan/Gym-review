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
  const [currentUserRole, setCurrentUserRole] = useState("member");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginType, setLoginType] = useState("member"); // "member" or "employee"
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showContent, setShowContent] = useState(false);

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
          setCurrentUserRole(userProfile.role || "member");
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

  const handleLoginClick = (type = "member") => {
    setLoginType(type);
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
    <>
      <nav className="navbar">
        <a href="#" className="navbar-brand">Gym Review</a>
        <div className="navbar-menu">
          <a href="#" className="navbar-link">Find Gyms</a>
          {user ? (
            <a href="#" className="navbar-link">Membership</a>
          ) : (
            <a href="#" onClick={() => handleLoginClick("member")} className="navbar-link">Member Login</a>
          )}
          {user ? (
            <a href="#" className="navbar-link">Employee</a>
          ) : (
            <a href="#" onClick={() => handleLoginClick("employee")} className="navbar-link">Employee Login</a>
          )}
          {user ? (
            <div className="user-info" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ color: 'white', fontWeight: '500' }}>{user.email}</span>
              <LogoutButton onLogoutClick={handleLogout} />
            </div>
          ) : null}
        </div>
      </nav>

      <div className="hero">
        <h1>Find Your Perfect Gym</h1>
        <p>Discover the best gyms in your area and read authentic reviews from members</p>
        <button className="hero-cta" onClick={() => setShowContent(true)}>Get Started</button>
      </div>

      <div className="container">
        {showContent && (
          <>
            {showLoginForm && !user && (
              <div className="login-form">
                <h3>{loginType === "member" ? "Member Login" : "Employee Login"}</h3>
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
                      Login as {loginType === "member" ? "Member" : "Employee"}
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
                <p><strong>Role:</strong> {profile.role}</p>
              </div>
            )}

            <GymList gyms={gyms} loading={loading} error={error} user={user} onGymDeleted={handleGymDeleted} onReviewDeleted={handleReviewDeleted} />

            {user && (
              <ProtectedForm isLoggedIn={true} userRole={currentUserRole} onGymCreated={handleGymCreated} onReviewAdded={handleReviewAdded} gyms={gyms} />
            )}

            {error && (
              <div className="message message-error">
                Error: {error}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default App;
