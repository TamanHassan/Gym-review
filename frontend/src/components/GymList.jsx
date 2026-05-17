import React, { useState } from "react";
import { fetchGyms } from "../services/api.js";

/**
 * GymList component - displays all available gyms
 */
const GymList = ({ gyms = [], loading = false, error = null }) => {
  const [expandedGymIds, setExpandedGymIds] = useState([]);

  const toggleReviews = (gymId) => {
    setExpandedGymIds((current) =>
      current.includes(gymId)
        ? current.filter((id) => id !== gymId)
        : [...current, gymId]
    );
  };

  if (loading) {
    return <div>Loading gyms...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>Error loading gyms: {error}</div>;
  }

  if (!gyms || gyms.length === 0) {
    return <div style={{ color: "#666" }}>No gyms available</div>;
  }

  return (
    <div>
      <h2>Available Gyms</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {gyms.map((gym) => {
          const hasReviews = gym.reviews && gym.reviews.length > 0;
          const isExpanded = expandedGymIds.includes(gym.id);

          return (
            <li key={gym.id} style={{
              border: "1px solid #ddd",
              padding: "12px",
              marginBottom: "10px",
              borderRadius: "4px"
            }}>
              <h3>{gym.name}</h3>
              <p><strong>Location:</strong> {gym.location}</p>
              <p><strong>Reviews:</strong> {gym.reviews?.length || 0}</p>

              {hasReviews ? (
                <>
                  <button
                    type="button"
                    onClick={() => toggleReviews(gym.id)}
                    style={{
                      padding: "8px 12px",
                      marginTop: "10px",
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    {isExpanded ? "Hide reviews" : "Show reviews"}
                  </button>

                  {isExpanded && (
                    <div style={{ marginTop: "10px" }}>
                      <h4 style={{ margin: "0 0 8px 0" }}>Recent Reviews</h4>
                      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {gym.reviews.map((review) => (
                          <li key={review.id} style={{
                            padding: "10px",
                            marginBottom: "8px",
                            border: "1px solid #eee",
                            borderRadius: "4px",
                            backgroundColor: "#fafafa"
                          }}>
                            <p style={{ margin: 0 }}><strong>Rating:</strong> {review.rating}/5</p>
                            <p style={{ margin: "4px 0 0 0" }}><strong>Comment:</strong> {review.comment || "No comment provided."}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <p style={{ color: "#666", marginTop: "10px" }}>No reviews yet.</p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default GymList;
