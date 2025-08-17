import React, { useEffect, useState } from "react";
import { apiFetch } from "../constants/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "./codeAccess.scss";

export default function CodeAccess() {
  const [code, setCode] = useState("");
  const [info, setInfo] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Admins should not take interviews
    if (user && user.role === "admin") {
      navigate("/admin");
    }
  }, [user, navigate]);

  const onCheck = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setError("");
    setInfo(null);
    setLoading(true);

    try {
      const cleanCode = code.trim().toUpperCase();
      const res = await apiFetch(
        `/api/v1/admin/interviews/by-code/${encodeURIComponent(cleanCode)}`
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Invalid access code");
      }

      setInfo(data.data);
    } catch (e) {
      setError(e.message || "Failed to verify code");
    } finally {
      setLoading(false);
    }
  };

  const onStart = async () => {
    // Require user login before starting so feedback can be created server-side
    if (!user) {
      navigate("/auth");
      return;
    }
    setStarting(true);
    setError("");

    try {
      const cleanCode = code.trim().toUpperCase();
      const res = await apiFetch(
        `/api/v1/admin/interviews/by-code/${encodeURIComponent(
          cleanCode
        )}/start`,
        { method: "POST" }
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to start interview");
      }

      navigate(
        `/interviewPage/${data.data._id}?code=${encodeURIComponent(cleanCode)}`
      );
    } catch (e) {
      setError(e.message || "Error starting interview");
      setStarting(false);
    }
  };

  const getBadgeConfig = (type) => {
    const configs = {
      Technical: { color: "technical", icon: "⚡" },
      Behavioral: { color: "behavioral", icon: "🎭" },
      HR: { color: "hr", icon: "👥" },
      "System Design": { color: "system", icon: "🏗️" },
    };
    return configs[type] || { color: "default", icon: "📋" };
  };

  const isDisabled = !!(user && user.role === "admin");

  return (
    <div className="code-access-page">
      <div className="code-access-container">
        {/* Header */}
        <div className="access-header">
          <div className="header-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
          <h1 className="header-title">Enter Access Code</h1>
          <p className="header-subtitle">
            Enter the interview access code provided by your interviewer to
            begin your session
          </p>
        </div>

        {/* Code Input Form */}
        <div className="code-form-section">
          <form onSubmit={onCheck} className="code-form">
            <div className="form-group">
              <label htmlFor="accessCode" className="form-label">
                Access Code
              </label>
              <div className="input-group">
                <div className="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 22S8 18 8 13V6L12 4L16 6V13C16 18 12 22 12 22Z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M9 12L11 14L15 10"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <input
                  id="accessCode"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Enter code (e.g., ABC123)"
                  maxLength={12}
                  required
                  disabled={isDisabled}
                  className="code-input"
                />
                <button
                  type="submit"
                  disabled={isDisabled || loading || !code.trim()}
                  className="verify-btn"
                >
                  {loading ? (
                    <div className="btn-spinner">
                      <div className="spinner-ring"></div>
                    </div>
                  ) : (
                    <>
                      <span>Verify</span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M5 12H19M19 12L12 5M19 12L12 19"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    </>
                  )}
                </button>
              </div>
              {isDisabled && (
                <p className="form-help disabled-notice">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                  Admin users cannot take interviews
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-message">
            <div className="error-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
            <span>{error}</span>
          </div>
        )}

        {/* Interview Information */}
        {info && (
          <div className="interview-info">
            <div className="info-header">
              <div className="info-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <div className="info-title">
                <h3>Interview Details Verified</h3>
                <p>Review the details below and start when ready</p>
              </div>
            </div>

            <div className="interview-details">
              {/* Role and Type */}
              <div className="detail-row">
                <div className="detail-item">
                  <div className="detail-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Role</span>
                    <span className="detail-value">{info.role}</span>
                  </div>
                </div>

                <div className="detail-item">
                  <div
                    className={`interview-badge badge--${
                      getBadgeConfig(info.type).color
                    }`}
                  >
                    <span className="badge-icon">
                      {getBadgeConfig(info.type).icon}
                    </span>
                    <span className="badge-text">{info.type}</span>
                  </div>
                </div>
              </div>

              {/* Level and Questions */}
              <div className="detail-row">
                <div className="detail-item">
                  <div className="detail-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Experience Level</span>
                    <span className="detail-value">{info.level}</span>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1046 21 18 21H17Z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Questions</span>
                    <span className="detail-value">{info.amount}</span>
                  </div>
                </div>
              </div>

              {/* Tech Stack */}
              {info.techstack && info.techstack.length > 0 && (
                <div className="tech-section">
                  <div className="tech-header">
                    <div className="detail-icon">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                    <span className="tech-label">Technology Stack</span>
                  </div>
                  <div className="tech-tags">
                    {info.techstack.map((tech, idx) => (
                      <span key={idx} className="tech-tag">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Duration Estimate */}
              <div className="duration-info">
                <div className="duration-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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
                <span className="duration-text">
                  Estimated duration: {Math.max(info.amount * 3, 15)}-
                  {info.amount * 5} minutes
                </span>
              </div>
            </div>

            {/* Start Button */}
            <div className="start-section">
              <button
                onClick={onStart}
                disabled={isDisabled || starting}
                className="start-interview-btn"
              >
                {starting ? (
                  <>
                    <div className="btn-spinner">
                      <div className="spinner-ring"></div>
                    </div>
                    <span>Starting Interview...</span>
                  </>
                ) : (
                  <>
                    <div className="btn-icon">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
                      </svg>
                    </div>
                    <span>Start Interview</span>
                    <div className="btn-arrow">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M5 12H19M19 12L12 5M19 12L12 19"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="help-section">
          <div className="help-content">
            <h4>Need Help?</h4>
            <ul>
              <li>Access codes are typically 6-12 characters long</li>
              <li>
                Codes are case-insensitive and will be automatically formatted
              </li>
              <li>
                Contact your interviewer if you're having trouble with the code
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
