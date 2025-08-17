import React, { useEffect, useState } from "react";
import "./InterviewPage.scss";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Agent from "../components/interview/Agent";
import { apiFetch } from "../components/constants/api";
import { useAuth } from "../components/auth/AuthContext";

export default function InterviewPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams(location.search);
        const code = params.get("code");

        // Admins should not take interviews at all
        if (user && user.role === "admin") {
          navigate("/admin");
          return;
        }

        // Require authentication for taking/interacting with interviews
        if (!user) {
          navigate("/auth");
          return;
        }

        let response;
        if (code) {
          // Use by-code full endpoint (public)
          response = await apiFetch(
            `/api/v1/admin/interviews/by-code/${encodeURIComponent(code)}/full`
          );
        } else {
          // Authenticated owner endpoint
          response = await apiFetch(`/api/v1/vapi/interview/${id}`);
        }

        if (response.status === 401) {
          navigate("/auth");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load interview data");
        }

        const data = await response.json();
        setInterview(data.data);
      } catch (error) {
        console.error("Error fetching interview:", error);
        setError(error.message || "Failed to load interview");
      } finally {
        setLoading(false);
      }
    };

    fetchInterview();
  }, [id, location.search, navigate, user]);

  const getBadgeConfig = (type) => {
    const configs = {
      Technical: { color: "technical", icon: "⚡" },
      Behavioral: { color: "behavioral", icon: "🎭" },
      HR: { color: "hr", icon: "👥" },
      "System Design": { color: "system", icon: "🏗️" },
    };
    return configs[type] || { color: "default", icon: "📋" };
  };

  const badgeConfig = getBadgeConfig(interview?.type);

  if (loading) {
    return (
      <div className="interview-page">
        <div className="loading-container">
          <div className="loading-animation">
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-ring spinner-ring--delayed"></div>
              <div className="spinner-ring spinner-ring--more-delayed"></div>
            </div>
          </div>
          <h3 className="loading-title">Preparing Your Interview</h3>
          <p className="loading-description">
            Setting up your personalized interview environment...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="interview-page">
        <div className="error-container">
          <div className="error-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M15 9L9 15M9 9L15 15"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
          <h3 className="error-title">Unable to Load Interview</h3>
          <p className="error-description">{error}</p>
          <div className="error-actions">
            <button
              className="btn btn--primary"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
            <button className="btn btn--outline" onClick={() => navigate("/")}>
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="interview-page">
        <div className="error-container">
          <div className="error-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
          <h3 className="error-title">Interview Not Found</h3>
          <p className="error-description">
            The interview you're looking for doesn't exist or has been removed.
          </p>
          <div className="error-actions">
            <button className="btn btn--primary" onClick={() => navigate("/")}>
              Browse Interviews
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="interview-page">
      <div className="interview-container">
        {/* Interview Header */}
        <div className="interview-header">
          <div className="header-content">
            <div className="interview-meta">
              <div className="company-avatar">
                <div className="avatar-placeholder">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 9L12 2L21 9V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9Z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <polyline
                      points="9,22 9,12 15,12 15,22"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>

              <div className="interview-info">
                <div className="interview-title-section">
                  <h1 className="interview-title">
                    {interview.role}{" "}
                    <span className="title-suffix">Interview</span>
                  </h1>
                  <div
                    className={`interview-badge badge--${badgeConfig.color}`}
                  >
                    <span className="badge-icon">{badgeConfig.icon}</span>
                    <span className="badge-text">{interview.type}</span>
                  </div>
                </div>

                {interview.company && (
                  <p className="company-name">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M3 9L12 2L21 9V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9Z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                    {interview.company}
                  </p>
                )}
              </div>
            </div>

            <div className="interview-stats">
              <div className="stat-item">
                <div className="stat-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <div className="stat-content">
                  <span className="stat-label">Level</span>
                  <span className="stat-value">{interview.level}</span>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1046 21 18 21H17Z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <div className="stat-content">
                  <span className="stat-label">Questions</span>
                  <span className="stat-value">
                    {interview.questions?.length || 0}
                  </span>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M12 6V12L16 14"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <div className="stat-content">
                  <span className="stat-label">Duration</span>
                  <span className="stat-value">
                    {Math.max((interview.questions?.length || 0) * 3, 15)}m
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="progress-section">
            <div className="progress-info">
              <span className="progress-label">Interview Progress</span>
              <span className="progress-status">Ready to Start</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: "0%" }}></div>
            </div>
          </div>
        </div>

        {/* Interview Agent */}
        <div className="interview-agent">
          <Agent
            username={user?.username || "candidate"}
            userId={user?._id || "anonymous"}
            interviewId={id}
            type="interview"
            questions={interview.questions}
            role={interview.role}
            level={interview.level}
            company={interview.company}
            jobDescription={interview.jobDescription}
          />
        </div>
      </div>
    </div>
  );
}
