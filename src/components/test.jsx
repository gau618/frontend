import React, { useState } from "react";
import { apiFetch } from "./constants/api";

const ApiButton = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Hard-coded form data
  const formData = {
    type: "Behavioral",
    role: "Software Engineer",
    level: "Senior",
    techstack: "JavaScript, Node.js, React",
    amount: 5,
    userid: "user123",
  };

  const callApi = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch(`/api/v1/vapi/interview-list`);
      const result = await response.json();

      if (response.ok) {
        setData(result);
      } else {
        setError(result.message || "Failed to fetch data");
      }
    } catch (error) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={callApi} disabled={loading}>
        {loading ? "Loading..." : "Generate Interview Questions"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading && <p>Loading...</p>}
      {data && (
        <div>
          <h3>Generated Interview Questions:</h3>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ApiButton;
