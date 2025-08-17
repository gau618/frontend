import React, { useEffect, useState } from "react";
import { apiFetch } from "../constants/api";
import "./adminAnalytics.scss";

export default function AdminAnalytics({ selectedId = "" }) {
  const [myInterviews, setMyInterviews] = useState([]);
  const [pickId, setPickId] = useState("");
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hashHandled, setHashHandled] = useState(false);
  const [activeView, setActiveView] = useState("overview");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [notification, setNotification] = useState(null);

  // Load only my interviews
  useEffect(() => {
    const fetchInterviews = async () => {
      setLoading(true);
      setError("");
      try {
        const resList = await apiFetch("/api/v1/admin/interviews");
        const bodyList = await resList.json().catch(() => ({}));
        if (!resList.ok || !bodyList.success) {
          throw new Error(bodyList.message || "Failed to load interviews");
        }
        setMyInterviews(bodyList.data || []);
      } catch (e) {
        setError(e.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  // Load per-interview analytics when pickId changes
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!pickId) return setDetail(null);
      setLoading(true);
      setError("");
      try {
        const res = await apiFetch(`/api/v1/admin/analytics/interview/${pickId}`);
        const body = await res.json().catch(() => ({}));
        if (!res.ok || !body.success) {
          throw new Error(body.message || "Failed to load analytics");
        }
        setDetail(body.data);
      } catch (e) {
        setError(e.message || "Failed to load interview analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [pickId]);

  // Support hash deep-link like #analytics-<id>
  useEffect(() => {
    if (hashHandled) return;
    const h = window.location.hash || "";
    const m = h.match(/^#analytics-(.*)$/);
    if (m && m[1]) {
      setPickId(m[1]);
      setHashHandled(true);
    }
  }, [hashHandled]);

  // If a selectedId is passed from parent, use it
  useEffect(() => {
    if (selectedId) setPickId(selectedId);
  }, [selectedId]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "excellent";
    if (score >= 70) return "good";
    if (score >= 60) return "average";
    return "needs-improvement";
  };

  const getScoreGrade = (score) => {
    if (score >= 90) return "A+";
    if (score >= 80) return "A";
    if (score >= 70) return "B";
    if (score >= 60) return "C";
    return "D";
  };

  const getBadgeConfig = (type) => {
    const configs = {
      "Technical": { color: "technical", icon: "⚡" },
      "Behavioral": { color: "behavioral", icon: "🎭" },
      "HR": { color: "hr", icon: "👥" },
      "System Design": { color: "system", icon: "🏗️" }
    };
    return configs[type] || { color: "default", icon: "📋" };
  };

  const sortedAttempts = detail?.attempts ? [...detail.attempts].sort((a, b) => {
    const aVal = a[sortBy] || 0;
    const bVal = b[sortBy] || 0;
    return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
  }) : [];

  const selectedInterview = myInterviews.find(interview => interview._id === pickId);

  if (loading && !detail) {
    return (
      <div className="analytics-page">
        <div className="loading-container">
          <div className="loading-animation">
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-ring spinner-ring--delayed"></div>
              <div className="spinner-ring spinner-ring--more-delayed"></div>
            </div>
          </div>
          <h3 className="loading-title">Loading Analytics</h3>
          <p className="loading-description">
            Gathering interview performance data and insights...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      {/* Notification */}
      {notification && (
        <div className={`notification notification--${notification.type}`}>
          <div className="notification-content">
            <span className="notification-icon">
              {notification.type === "success" ? "✓" : "⚠"}
            </span>
            <span className="notification-message">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="analytics-container">
        {/* Header */}
        <div className="analytics-header">
          <div className="header-content">
            <div className="header-info">
              <div className="analytics-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M9 19V6L20 18V8M9 19H20M9 19L2 12L9 5" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div className="header-text">
                <h1 className="analytics-title">Interview Analytics</h1>
                <p className="analytics-subtitle">
                  Comprehensive performance insights and detailed reporting
                </p>
              </div>
            </div>

            <div className="header-stats">
              <div className="stat-item">
                <div className="stat-value">{myInterviews.length}</div>
                <div className="stat-label">Total Interviews</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{detail?.summary?.attempts || 0}</div>
                <div className="stat-label">Selected Attempts</div>
              </div>
            </div>
          </div>
        </div>

        {/* Interview Selector */}
        <div className="interview-selector">
          <div className="selector-header">
            <h3>Select Interview for Analysis</h3>
            <p>Choose an interview to view detailed performance analytics</p>
          </div>

          <div className="selector-content">
            <div className="select-wrapper">
              <select
                value={pickId}
                onChange={(e) => {
                  setPickId(e.target.value);
                  setActiveView("overview");
                }}
                className="interview-select"
              >
                <option value="">Choose an interview to analyze</option>
                {myInterviews.map((interview) => (
                  <option key={interview._id} value={interview._id}>
                    {interview.role} • {interview.level} • {interview.type}
                    {interview.techstack && interview.techstack.length > 0 && 
                      ` • ${interview.techstack.join(", ")}`
                    }
                  </option>
                ))}
              </select>
              <div className="select-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
            </div>

            {myInterviews.length === 0 && !loading && (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1046 21 18 21H17Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <h4>No Interviews Available</h4>
                <p>Create some interviews first to view analytics data</p>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-alert">
            <div className="error-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <span>{error}</span>
          </div>
        )}

        {/* Analytics Content */}
        {detail && selectedInterview && (
          <div className="analytics-content">
            {/* Interview Overview Card */}
            <div className="interview-overview">
              <div className="overview-header">
                <div className="interview-meta">
                  <h3 className="interview-title">{selectedInterview.role} Position</h3>
                  <div className="interview-badges">
                    <span className="level-badge">{selectedInterview.level}</span>
                    <div className={`type-badge badge--${getBadgeConfig(selectedInterview.type).color}`}>
                      <span className="badge-icon">{getBadgeConfig(selectedInterview.type).icon}</span>
                      <span>{selectedInterview.type}</span>
                    </div>
                  </div>
                </div>
                
                <div className="overview-stats">
                  <div className="stat-card stat-card--primary">
                    <div className="stat-number">{detail.summary?.attempts || 0}</div>
                    <div className="stat-label">Total Attempts</div>
                  </div>
                  <div className="stat-card stat-card--success">
                    <div className="stat-number">
                      {Number(detail.summary?.avgTotal || 0).toFixed(1)}
                    </div>
                    <div className="stat-label">Avg Score</div>
                  </div>
                  <div className="stat-card stat-card--accent">
                    <div className="stat-number">
                      {((detail.summary?.passRate || 0) * 100).toFixed(1)}%
                    </div>
                    <div className="stat-label">Pass Rate</div>
                  </div>
                </div>
              </div>

              <div className="overview-details">
                <div className="detail-item">
                  <span className="detail-label">Questions:</span>
                  <span className="detail-value">{selectedInterview.amount}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Created:</span>
                  <span className="detail-value">
                    {selectedInterview.createdAt
                      ? new Date(selectedInterview.createdAt).toLocaleDateString()
                      : "-"}
                  </span>
                </div>
                {selectedInterview.techstack && selectedInterview.techstack.length > 0 && (
                  <div className="detail-item detail-item--tech">
                    <span className="detail-label">Tech Stack:</span>
                    <div className="tech-tags">
                      {selectedInterview.techstack.map((tech, idx) => (
                        <span key={idx} className="tech-tag">{tech}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="analytics-tabs">
              <button
                className={`tab-btn ${activeView === "overview" ? "tab-btn--active" : ""}`}
                onClick={() => setActiveView("overview")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M3 3V9M3 9L9 3M3 9L9 9M21 21V15M21 21L15 21M21 21L15 15M21 3V9M21 9L15 3M21 9L15 9M3 21V15M3 21L9 21M3 21L9 15" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Overview
              </button>
              <button
                className={`tab-btn ${activeView === "categories" ? "tab-btn--active" : ""}`}
                onClick={() => setActiveView("categories")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 19V6L20 18V8M9 19H20M9 19L2 12L9 5" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Categories
              </button>
              <button
                className={`tab-btn ${activeView === "attempts" ? "tab-btn--active" : ""}`}
                onClick={() => setActiveView("attempts")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1046 21 18 21H17Z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Detailed Results
              </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {/* Overview Tab */}
              {activeView === "overview" && (
                <div className="overview-content">
                  {/* Performance Summary */}
                  <div className="performance-summary">
                    <div className="summary-header">
                      <h4>Performance Summary</h4>
                      <p>Overall interview performance metrics</p>
                    </div>
                    
                    <div className="summary-grid">
                      <div className="summary-card">
                        <div className="summary-icon summary-icon--attempts">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2"/>
                            <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        </div>
                        <div className="summary-content">
                          <div className="summary-value">{detail.summary?.attempts || 0}</div>
                          <div className="summary-label">Total Attempts</div>
                          <div className="summary-description">
                            Number of candidates who attempted this interview
                          </div>
                        </div>
                      </div>

                      <div className="summary-card">
                        <div className="summary-icon summary-icon--score">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        </div>
                        <div className="summary-content">
                          <div className="summary-value">
                            {Number(detail.summary?.avgTotal || 0).toFixed(1)}
                          </div>
                          <div className="summary-label">Average Score</div>
                          <div className="summary-description">
                            Mean performance across all attempts
                          </div>
                        </div>
                      </div>

                      <div className="summary-card">
                        <div className="summary-icon summary-icon--pass">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        </div>
                        <div className="summary-content">
                          <div className="summary-value">
                            {((detail.summary?.passRate || 0) * 100).toFixed(1)}%
                          </div>
                          <div className="summary-label">Pass Rate</div>
                          <div className="summary-description">
                            Percentage of candidates meeting standards
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Categories Tab */}
              {activeView === "categories" && (
                <div className="categories-content">
                  <div className="categories-header">
                    <h4>Category Performance</h4>
                    <p>Average scores across different evaluation categories</p>
                  </div>

                  <div className="categories-grid">
                    {Object.entries(detail.summary?.byCategory || {}).map(([category, avgScore]) => (
                      <div key={category} className="category-card">
                        <div className="category-header">
                          <div className="category-name">{category}</div>
                          <div className={`category-score score--${getScoreColor(avgScore)}`}>
                            <span className="score-value">{Number(avgScore).toFixed(1)}</span>
                            <span className="score-max">/100</span>
                          </div>
                        </div>
                        
                        <div className="category-progress">
                          <div className="progress-bar">
                            <div 
                              className={`progress-fill progress-fill--${getScoreColor(avgScore)}`}
                              style={{ width: `${Math.min(avgScore, 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="category-grade">
                          Grade: {getScoreGrade(avgScore)}
                        </div>
                      </div>
                    ))}

                    {Object.keys(detail.summary?.byCategory || {}).length === 0 && (
                      <div className="empty-categories">
                        <div className="empty-icon">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                            <path d="M9 19V6L20 18V8M9 19H20M9 19L2 12L9 5" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        </div>
                        <h4>No Category Data</h4>
                        <p>Category breakdown will appear when candidates complete interviews</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Attempts Tab */}
              {activeView === "attempts" && (
                <div className="attempts-content">
                  <div className="attempts-header">
                    <div className="header-title">
                      <h4>Detailed Results</h4>
                      <p>Individual candidate performance and feedback</p>
                    </div>
                    
                    {sortedAttempts.length > 0 && (
                      <div className="sort-controls">
                        <label className="sort-label">Sort by:</label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="sort-select"
                        >
                          <option value="totalScore">Score</option>
                          <option value="createdAt">Date</option>
                        </select>
                        <button
                          className="sort-order-btn"
                          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                        >
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="attempts-list">
                    {sortedAttempts.length > 0 ? (
                      sortedAttempts.map((attempt, index) => (
                        <div key={attempt.feedbackId} className="attempt-card">
                          <div className="attempt-header">
                            <div className="candidate-info">
                              <div className="candidate-avatar">
                                <div className="avatar-placeholder">
                                  {(attempt.user?.fullName || attempt.user?.username || "U").charAt(0).toUpperCase()}
                                </div>
                              </div>
                              <div className="candidate-details">
                                <h5 className="candidate-name">
                                  {attempt.user?.fullName || attempt.user?.username || `Candidate ${index + 1}`}
                                </h5>
                                <p className="candidate-email">{attempt.user?.email || "-"}</p>
                              </div>
                            </div>

                            <div className="attempt-score">
                              <div className={`score-circle score-circle--${getScoreColor(attempt.totalScore)}`}>
                                <div className="score-number">{attempt.totalScore}</div>
                                <div className="score-total">/100</div>
                              </div>
                              <div className="score-grade">
                                {getScoreGrade(attempt.totalScore)}
                              </div>
                            </div>
                          </div>

                          <div className="attempt-content">
                            {/* Category Scores */}
                            {attempt.categoryScores && attempt.categoryScores.length > 0 && (
                              <div className="category-scores">
                                <h6>Category Breakdown</h6>
                                <div className="scores-grid">
                                  {attempt.categoryScores.map((cs, idx) => (
                                    <div key={idx} className="score-item">
                                      <div className="score-header">
                                        <span className="score-name">{cs.name}</span>
                                        <span className={`score-value score--${getScoreColor(cs.score)}`}>
                                          {cs.score}
                                        </span>
                                      </div>
                                      <p className="score-comment">{cs.comment}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Strengths and Areas */}
                            <div className="feedback-sections">
                              {attempt.strengths && attempt.strengths.length > 0 && (
                                <div className="feedback-section feedback-section--strengths">
                                  <h6>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                      <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2"/>
                                    </svg>
                                    Strengths
                                  </h6>
                                  <ul className="feedback-list">
                                    {attempt.strengths.map((strength, i) => (
                                      <li key={i}>{strength}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {attempt.areasForImprovement && attempt.areasForImprovement.length > 0 && (
                                <div className="feedback-section feedback-section--improvements">
                                  <h6>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2"/>
                                    </svg>
                                    Areas for Improvement
                                  </h6>
                                  <ul className="feedback-list">
                                    {attempt.areasForImprovement.map((area, i) => (
                                      <li key={i}>{area}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>

                            {/* Final Assessment */}
                            {attempt.finalAssessment && (
                              <div className="final-assessment">
                                <h6>Final Assessment</h6>
                                <p>{attempt.finalAssessment}</p>
                              </div>
                            )}

                            <div className="attempt-footer">
                              <div className="attempt-date">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                  <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                                Submitted: {attempt.createdAt
                                  ? new Date(attempt.createdAt).toLocaleString()
                                  : "-"}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-attempts">
                        <div className="empty-icon">
                          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                            <path d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1046 21 18 21H17Z" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        </div>
                        <h4>No Attempts Yet</h4>
                        <p>Detailed results will appear when candidates complete this interview</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State - No Interview Selected */}
        {!pickId && !loading && (
          <div className="no-selection">
            <div className="no-selection-icon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                <path d="M9 19V6L20 18V8M9 19H20M9 19L2 12L9 5" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3>Select an Interview</h3>
            <p>Choose an interview from the dropdown above to view detailed analytics and performance insights.</p>
          </div>
        )}
      </div>
    </div>
  );
}
