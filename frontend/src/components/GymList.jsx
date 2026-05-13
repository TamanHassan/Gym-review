import React, { useState } from "react";
import { fetchGyms } from "../services/api.js";

/**
 * GymList component - displays all available gyms
 */
const GymList = ({ gyms = [], loading = false, error = null }) => {
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
        {gyms.map((gym) => (
          <li key={gym.id} style={{
            border: "1px solid #ddd",
            padding: "12px",
            marginBottom: "10px",
            borderRadius: "4px"
          }}>
            <h3>{gym.name}</h3>
            <p><strong>Location:</strong> {gym.location}</p>
            <p><strong>Reviews:</strong> {gym.reviews?.length || 0}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GymList;
