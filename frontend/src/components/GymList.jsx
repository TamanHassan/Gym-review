import React, { useState } from "react";
import { fetchGyms, deleteGym, deleteReview } from "../services/api.js";

/**
 * GymList component - displays all available gyms
 */
const GymList = ({ gyms = [], loading = false, error = null, user = null, onGymDeleted = null, onReviewDeleted = null }) => {
  const [expandedGymIds, setExpandedGymIds] = useState([]);

  const toggleReviews = (gymId) => {
    setExpandedGymIds((current) =>
      current.includes(gymId)
        ? current.filter((id) => id !== gymId)
        : [...current, gymId]
    );
  };

  const handleDeleteGym = async (gymId) => {
    if (!window.confirm("Are you sure you want to delete this gym?")) {
      return;
    }

    try {
      await deleteGym(gymId);
      if (onGymDeleted) {
        onGymDeleted(gymId);
      }
    } catch (error) {
      alert("Failed to delete gym: " + error.message);
    }
  };

  const handleDeleteReview = async (gymId, reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      await deleteReview(gymId, reviewId);
      if (onReviewDeleted) {
        onReviewDeleted(gymId, reviewId);
      }
    } catch (error) {
      alert("Failed to delete review: " + error.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading gyms...</div>;
  }

  if (error) {
    return <div className="error">Error loading gyms: {error}</div>;
  }

  if (!gyms || gyms.length === 0) {
    return <div className="empty">No gyms available</div>;
  }

  return (
    <div className="gym-list">
      <h2>Available Gyms</h2>
      <ul>
        {gyms.map((gym) => {
          const hasReviews = gym.reviews && gym.reviews.length > 0;
          const isExpanded = expandedGymIds.includes(gym.id);

          return (
            <li key={gym.id} className="gym-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div style={{ flex: 1 }}>
                  <h3>{gym.name}</h3>
                  <p><strong>Location:</strong> {gym.location}</p>
                  <p><strong>Reviews:</strong> {gym.reviews?.length || 0}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteGym(gym.id)}
                  className="btn btn-danger"
                  style={{
                    backgroundColor: "#d1d5db",
                    color: "#374151",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    fontWeight: "500"
                  }}
                >
                  Delete Gym
                </button>
              </div>

              {hasReviews ? (
                <>
                  <button
                    type="button"
                    onClick={() => toggleReviews(gym.id)}
                    className="btn btn-outline"
                  >
                    {isExpanded ? "Hide reviews" : "Show reviews"}
                  </button>

                  {isExpanded && (
                    <div className="reviews-section">
                      <h4>Recent Reviews</h4>
                      <ul className="review-list">
                        {gym.reviews.map((review) => (
                          <li key={review.id} className="review-item">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <div style={{ flex: 1 }}>
                                <p><strong>Rating:</strong> {review.rating}/5</p>
                                <p><strong>Comment:</strong> {review.comment || "No comment provided."}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDeleteReview(gym.id, review.id)}
                                className="btn btn-danger"
                                style={{
                                  backgroundColor: "#d1d5db",
                                  color: "#374151",
                                  border: "none",
                                  borderRadius: "6px",
                                  padding: "6px 12px",
                                  cursor: "pointer",
                                  fontSize: "0.85rem",
                                  fontWeight: "500",
                                  marginLeft: "12px"
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <p className="empty">No reviews yet.</p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default GymList;
