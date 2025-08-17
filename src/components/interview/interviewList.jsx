import { useEffect } from "react";
import InterviewCard from "./interViewCards";
import React, { useState } from "react";
import { apiFetch } from "../constants/api";
import { useNavigate } from "react-router-dom";
import "./interviewList.scss";

export const InterviewList = () => {
  const [interview, setInerview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    callApi();
  }, []);

  const callApi = async (isRetry = false) => {
    setLoading(true);
    setError(null);
    
    if (isRetry) {
      setRetryCount(prev => prev + 1);
    }

    try {
      const response = await apiFetch("/api/v1/vapi/interview-list");
      const result = await response.json();
      
      if (response.ok) {
        setInerview(result.data);
        setRetryCount(0);
      } else {
        if (response.status === 401) {
          navigate("/auth");
          return;
        }
        setError(result.message || "Failed to fetch interview templates");
      }
    } catch (error) {
      setError("Unable to connect to the server. Please check your connection.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    callApi(true);
  };

  return (
    <section className="interview-list-section">
      <div className="interview-list-container">
        <div className="section-header">
          <div className="header-content">
            <h2 className="section-title">Interview Templates</h2>
            <p className="section-subtitle">
              Choose from our curated collection of industry-specific interview scenarios
            </p>
          </div>
          
          {!loading && !error && interview?.length > 0 && (
            <div className="section-stats">
              <div className="stat-item">
                <span className="stat-value">{interview.length}</span>
                <span className="stat-label">Templates Available</span>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="state-container loading-state">
            <div className="state-content">
              <div className="loading-animation">
                <div className="loading-spinner">
                  <div className="spinner-ring"></div>
                  <div className="spinner-ring spinner-ring--delayed"></div>
                  <div className="spinner-ring spinner-ring--more-delayed"></div>
                </div>
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              <h3 className="state-title">Loading Interview Templates</h3>
              <p className="state-description">
                We're fetching the latest available interview scenarios for you...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="state-container error-state">
            <div className="state-content">
              <div className="error-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="m15 9-6 6" stroke="currentColor" strokeWidth="2"/>
                  <path d="m9 9 6 6" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className="state-title">Unable to Load Templates</h3>
              <p className="state-description">{error}</p>
              <div className="error-actions">
                <button 
                  className="btn btn--primary"
                  onClick={handleRetry}
                  disabled={loading}
                >
                  {loading ? 'Retrying...' : 'Try Again'}
                </button>
                {retryCount > 2 && (
                  <button 
                    className="btn btn--outline"
                    onClick={() => window.location.reload()}
                  >
                    Refresh Page
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && interview?.length === 0 && (
          <div className="state-container empty-state">
            <div className="state-content">
              <div className="empty-icon">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                  <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="m9 16 2 2 4-4" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className="state-title">No Templates Available</h3>
              <p className="state-description">
                We're currently updating our interview templates. 
                Please check back in a few minutes.
              </p>
              <div className="empty-actions">
                <button 
                  className="btn btn--outline"
                  onClick={handleRetry}
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Interview Grid */}
        {!loading && !error && interview?.length > 0 && (
          <div className="interview-grid">
            <div className="grid-header">
              <div className="grid-filter">
                <span className="filter-label">Showing all templates</span>
                <div className="filter-indicator">
                  <span className="indicator-dot"></span>
                  {interview.length} available
                </div>
              </div>
            </div>
            
            <div className="interview-cards">
              {interview.map((interviewItem, index) => (
                <div 
                  key={interviewItem._id} 
                  className="card-wrapper"
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <InterviewCard interview={interviewItem} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
