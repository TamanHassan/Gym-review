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
      className="btn btn-primary"
    >
      Login
    </button>
  );
};

export default LoginButton;
