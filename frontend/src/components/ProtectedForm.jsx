import React, { useState } from "react";
import { createGym, addReview } from "../services/api.js";

/**
 * ProtectedForm component - allows authenticated users to create gyms and add reviews
 */
const ProtectedForm = ({ isLoggedIn = false, userRole = "member", onGymCreated = null, onReviewAdded = null, gyms = [] }) => {
  const [formType, setFormType] = useState(userRole === "employee" ? "gym" : "review"); // "gym" or "review"

  // Both members and employees can add gyms, members can add reviews
  const canAddGyms = true;
  const canAddReviews = userRole === "member";
  const [gymName, setGymName] = useState("");
  const [location, setLocation] = useState("");
  const [gymId, setGymId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!isLoggedIn) {
    return (
      <div className="message message-info">
        Please log in to create gyms or add reviews
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
      if (onReviewAdded) {
        await onReviewAdded();
      }
    } catch (error) {
      setMessage(`Error adding review: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="protected-form">
      <h3>Protected Actions</h3>

      <div className="form-tabs">
        {canAddGyms && (
          <button
            onClick={() => setFormType("gym")}
            className={`tab-btn ${formType === "gym" ? "active" : ""}`}
          >
            Create Gym
          </button>
        )}
        {canAddReviews && (
          <button
            onClick={() => setFormType("review")}
            className={`tab-btn ${formType === "review" ? "active" : ""}`}
          >
            Add Review
          </button>
        )}
      </div>

      {formType === "gym" && (
        <form onSubmit={handleCreateGym}>
          <div className="form-group">
            <label>Gym Name:</label>
            <input
              type="text"
              value={gymName}
              onChange={(e) => setGymName(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Location:</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="form-control"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-success"
          >
            {loading ? "Creating..." : "Create Gym"}
          </button>
        </form>
      )}

      {formType === "review" && (
        <form onSubmit={handleAddReview}>
          <div className="form-group">
            <label>Select Gym:</label>
            <select
              value={gymId}
              onChange={(e) => setGymId(e.target.value)}
              className="form-control"
              required
            >
              <option value="">-- Select a gym --</option>
              {gyms.map((gym) => (
                <option key={gym.id} value={gym.id}>
                  {gym.name} - {gym.location}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Rating (1-5):</label>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="form-control"
            >
              <option value="1">1 - Poor</option>
              <option value="2">2 - Fair</option>
              <option value="3">3 - Good</option>
              <option value="4">4 - Very Good</option>
              <option value="5">5 - Excellent</option>
            </select>
          </div>
          <div className="form-group">
            <label>Comment:</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="form-control"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-success"
          >
            {loading ? "Adding..." : "Add Review"}
          </button>
        </form>
      )}

      {message && (
        <div className={`message ${message.includes("Error") ? "message-error" : "message-success"}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default ProtectedForm;
