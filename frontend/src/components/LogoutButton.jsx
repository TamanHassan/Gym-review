import React from "react";
import { logout } from "../services/firebase.js";

/**
 * Logout button component - allows user to sign out
 */
const LogoutButton = ({ onLogoutClick }) => {
  const handleClick = async () => {
    try {
      await logout();
      if (onLogoutClick) {
        onLogoutClick();
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="btn btn-secondary"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
