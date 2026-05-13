import React, { useState } from "react";
import { createGym, addReview } from "../services/api.js";

/**
 * ProtectedForm component - allows authenticated users to create gyms and add reviews
 */
const ProtectedForm = ({ isLoggedIn = false, onGymCreated = null }) => {
  const [formType, setFormType] = useState("gym"); // "gym" or "review"
  const [gymName, setGymName] = useState("");
  const [location, setLocation] = useState("");
  const [gymId, setGymId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!isLoggedIn) {
    return (
      <div style={{ padding: "20px", backgroundColor: "#f0f0f0", borderRadius: "4px" }}>
        <p style={{ color: "#666" }}>Please log in to create gyms or add reviews</p>
      </div>
    );
  }

  const handleCreateGym = async (e) => {
    e.preventDefault();
    if (!gymName || !location) {
      setMessage("Name and location are required");
      return;
    }

    setLoading(true);
    try {
      const newGym = await createGym(gymName, location);
      setMessage(`Gym "${newGym.name}" created successfully!`);
      setGymName("");
      setLocation("");
      if (onGymCreated) {
        onGymCreated(newGym);
      }
    } catch (error) {
      setMessage(`Error creating gym: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!gymId || !rating) {
      setMessage("Gym ID and rating are required");
      return;
    }

    setLoading(true);
    try {
      const review = await addReview(parseInt(gymId), parseInt(rating), comment);
      setMessage("Review added successfully!");
      setGymId("");
      setComment("");
      setRating(5);
    } catch (error) {
      setMessage(`Error adding review: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      border: "1px solid #ddd", 
      padding: "20px", 
      borderRadius: "4px",
      marginTop: "20px"
    }}>
      <h3>Protected Actions</h3>
      
      <div style={{ marginBottom: "15px" }}>
        <button 
          onClick={() => setFormType("gym")}
          style={{
            marginRight: "10px",
            padding: "8px 16px",
            backgroundColor: formType === "gym" ? "#007bff" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Create Gym
        </button>
        <button 
          onClick={() => setFormType("review")}
          style={{
            padding: "8px 16px",
            backgroundColor: formType === "review" ? "#007bff" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Add Review
        </button>
      </div>

      {formType === "gym" && (
        <form onSubmit={handleCreateGym}>
          <div style={{ marginBottom: "10px" }}>
            <label>Gym Name:</label>
            <input 
              type="text" 
              value={gymName} 
              onChange={(e) => setGymName(e.target.value)}
              style={{ 
                width: "100%", 
                padding: "8px", 
                marginTop: "5px",
                boxSizing: "border-box"
              }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Location:</label>
            <input 
              type="text" 
              value={location} 
              onChange={(e) => setLocation(e.target.value)}
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
            disabled={loading}
            style={{
              padding: "10px 20px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Creating..." : "Create Gym"}
          </button>
        </form>
      )}

      {formType === "review" && (
        <form onSubmit={handleAddReview}>
          <div style={{ marginBottom: "10px" }}>
            <label>Gym ID:</label>
            <input 
              type="number" 
              value={gymId} 
              onChange={(e) => setGymId(e.target.value)}
              style={{ 
                width: "100%", 
                padding: "8px", 
                marginTop: "5px",
                boxSizing: "border-box"
              }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Rating (1-5):</label>
            <select 
              value={rating} 
              onChange={(e) => setRating(e.target.value)}
              style={{ 
                width: "100%", 
                padding: "8px", 
                marginTop: "5px",
                boxSizing: "border-box"
              }}
            >
              <option value="1">1 - Poor</option>
              <option value="2">2 - Fair</option>
              <option value="3">3 - Good</option>
              <option value="4">4 - Very Good</option>
              <option value="5">5 - Excellent</option>
            </select>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Comment:</label>
            <textarea 
              value={comment} 
              onChange={(e) => setComment(e.target.value)}
              style={{ 
                width: "100%", 
                padding: "8px", 
                marginTop: "5px",
                boxSizing: "border-box",
                minHeight: "80px"
              }}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            style={{
              padding: "10px 20px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Adding..." : "Add Review"}
          </button>
        </form>
      )}

      {message && (
        <div style={{
          marginTop: "15px",
          padding: "10px",
          backgroundColor: message.includes("Error") ? "#f8d7da" : "#d4edda",
          color: message.includes("Error") ? "#721c24" : "#155724",
          borderRadius: "4px"
        }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default ProtectedForm;
