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
        } catch (err) {
          console.error("Failed to fetch profile:", err);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Load gyms on component mount
  useEffect(() => {
    const loadGyms = async () => {
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

    loadGyms();
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
    setGyms([...gyms, newGym]);
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <header style={{
        borderBottom: "2px solid #007bff",
        paddingBottom: "20px",
        marginBottom: "20px"
      }}>
        <h1>Gym Review API</h1>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p>Welcome to the Gym Review Platform</p>
          <div>
            {user ? (
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
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
        <div style={{
          border: "1px solid #ddd",
          padding: "20px",
          borderRadius: "4px",
          marginBottom: "20px",
          backgroundColor: "#f9f9f9"
        }}>
          <h3>Login to Your Account</h3>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "10px" }}>
              <label>Email:</label>
              <input 
                type="email" 
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="your@email.com"
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "5px",
                  boxSizing: "border-box"
                }}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label>Password:</label>
              <input 
                type="password" 
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "5px",
                  boxSizing: "border-box"
                }}
              />
            </div>
            <button 
              type="submit"
              style={{
                padding: "10px 20px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginRight: "10px"
              }}
            >
              Login
            </button>
            <button 
              type="button"
              onClick={() => setShowLoginForm(false)}
              style={{
                padding: "10px 20px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {user && profile && (
        <div style={{
          border: "1px solid #28a745",
          padding: "15px",
          borderRadius: "4px",
          marginBottom: "20px",
          backgroundColor: "#d4edda"
        }}>
          <h4>Your Profile</h4>
          <p><strong>UID:</strong> {profile.uid}</p>
          <p><strong>Email:</strong> {profile.email}</p>
        </div>
      )}

      <GymList gyms={gyms} loading={loading} error={error} />

      {user && (
        <ProtectedForm isLoggedIn={true} onGymCreated={handleGymCreated} />
      )}

      {error && (
        <div style={{
          color: "red",
          padding: "10px",
          backgroundColor: "#f8d7da",
          borderRadius: "4px",
          marginTop: "20px"
        }}>
          Error: {error}
        </div>
      )}
    </div>
  );
}

export default App;
