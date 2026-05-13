import React from "react";
import { auth } from "../services/firebase.js";

/**
 * Login button component - allows user to sign in
 */
const LoginButton = ({ onLoginClick }) => {
  const handleClick = () => {
    if (onLoginClick) {
      onLoginClick();
    }
  };

  return (
    <button 
      onClick={handleClick}
      style={{
        padding: "10px 20px",
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer"
      }}
    >
      Login
    </button>
  );
};

export default LoginButton;
