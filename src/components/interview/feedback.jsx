import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "./feedback.scss";
import { API_BASE_URL } from "../constants/api";

export default function Feedback() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/api/v1/vapi/getFeedback/${id}`
        );
        if (!response.ok) {
          throw new Error("Failed to load feedback data");
        }
        const data = await response.json();
        setFeedback(data.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, [id]);

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

  if (loading) {
    return (
      <div className="feedback-page">
        <div className="loading-container">
          <div className="loading-animation">
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-ring spinner-ring--delayed"></div>
              <div className="spinner-ring spinner-ring--more-delayed"></div>
            </div>
          </div>
          <h3 className="loading-title">Analyzing Your Performance</h3>
          <p className="loading-description">
            Processing your interview data and generating comprehensive feedback...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="feedback-page">
        <div className="error-container">
          <div className="error-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <h3 className="error-title">Unable to Load Feedback</h3>
          <p className="error-description">{error}</p>
          <div className="error-actions">
            <button className="btn btn--primary" onClick={() => window.location.reload()}>
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

  if (!feedback || Object.keys(feedback).length === 0) {
    return (
      <div className="feedback-page">
        <div className="error-container">
          <div className="error-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1046 21 18 21H17Z" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <h3 className="error-title">Feedback Not Found</h3>
          <p className="error-description">
            The feedback you're looking for doesn't exist or hasn't been generated yet.
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
    <div className="feedback-page">
      <div className="feedback-container">
        {/* Header Section */}
        <div className="feedback-header">
          <div className="header-content">
            <div className="header-info">
              <div className="feedback-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div className="header-text">
                <h1 className="feedback-title">Interview Feedback Report</h1>
                <p className="feedback-subtitle">
                  Comprehensive analysis of your interview performance
                </p>
              </div>
            </div>

            <div className="feedback-meta">
              <div className="meta-item">
                <div className="meta-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="meta-content">
                  <span className="meta-label">Completed</span>
                  <span className="meta-value">
                    {feedback?.createdAt
                      ? dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Overall Score Card */}
          <div className="score-card">
            <div className="score-display">
              <div className={`score-circle score-circle--${getScoreColor(feedback?.totalScore || 0)}`}>
                <div className="score-number">{feedback?.totalScore || 0}</div>
                <div className="score-total">/100</div>
              </div>
              <div className="score-grade">
                <span className="grade-letter">{getScoreGrade(feedback?.totalScore || 0)}</span>
                <span className="grade-label">Overall Grade</span>
              </div>
            </div>
            <div className="score-description">
              <h3>Overall Performance</h3>
              <p>Your comprehensive interview assessment score</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="feedback-tabs">
          <button
            className={`tab-btn ${activeTab === "overview" ? "tab-btn--active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 3V9M3 9L9 3M3 9L9 9M21 21V15M21 21L15 21M21 21L15 15M21 3V9M21 9L15 3M21 9L15 9M3 21V15M3 21L9 21M3 21L9 15" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Overview
          </button>
          <button
            className={`tab-btn ${activeTab === "breakdown" ? "tab-btn--active" : ""}`}
            onClick={() => setActiveTab("breakdown")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1046 21 18 21H17Z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Detailed Analysis
          </button>
          <button
            className={`tab-btn ${activeTab === "improvement" ? "tab-btn--active" : ""}`}
            onClick={() => setActiveTab("improvement")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Growth Plan
          </button>
        </div>

        {/* Tab Content */}
        <div className="feedback-content">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="tab-content">
              {/* Final Assessment */}
              <div className="assessment-card">
                <div className="card-header">
                  <div className="card-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div className="card-title">
                    <h3>Executive Summary</h3>
                    <p>Overall assessment of your interview performance</p>
                  </div>
                </div>
                <div className="assessment-content">
                  <p className="assessment-text">
                    {feedback?.finalAssessment || "No assessment available."}
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon stat-icon--strengths">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div className="stat-content">
                    <span className="stat-number">{feedback?.strengths?.length || 0}</span>
                    <span className="stat-label">Key Strengths</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon stat-icon--improvements">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div className="stat-content">
                    <span className="stat-number">{feedback?.areasForImprovement?.length || 0}</span>
                    <span className="stat-label">Growth Areas</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon stat-icon--categories">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1046 21 18 21H17Z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div className="stat-content">
                    <span className="stat-number">{feedback?.categoryScores?.length || 0}</span>
                    <span className="stat-label">Evaluation Areas</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Breakdown Tab */}
          {activeTab === "breakdown" && (
            <div className="tab-content">
              <div className="breakdown-section">
                <div className="section-header">
                  <h3>Performance Breakdown</h3>
                  <p>Detailed analysis across different interview categories</p>
                </div>

                <div className="categories-grid">
                  {feedback?.categoryScores?.map((category, index) => (
                    <div key={index} className="category-card">
                      <div className="category-header">
                        <div className="category-info">
                          <h4 className="category-name">{category.name}</h4>
                          <div className={`category-score score--${getScoreColor(category.score)}`}>
                            <span className="score-value">{category.score}</span>
                            <span className="score-max">/100</span>
                          </div>
                        </div>
                        <div className="category-grade">
                          {getScoreGrade(category.score)}
                        </div>
                      </div>
                      
                      <div className="category-progress">
                        <div className="progress-bar">
                          <div 
                            className={`progress-fill progress-fill--${getScoreColor(category.score)}`}
                            style={{ width: `${category.score}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="category-feedback">
                        <p>{category.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Improvement Tab */}
          {activeTab === "improvement" && (
            <div className="tab-content">
              {/* Strengths Section */}
              <div className="feedback-section">
                <div className="section-header">
                  <div className="section-icon section-icon--strengths">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div className="section-title">
                    <h3>Your Key Strengths</h3>
                    <p>Areas where you demonstrated excellent performance</p>
                  </div>
                </div>

                <div className="strengths-list">
                  {feedback?.strengths?.map((strength, index) => (
                    <div key={index} className="strength-item">
                      <div className="strength-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                      <p className="strength-text">{strength}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Improvement Areas Section */}
              <div className="feedback-section">
                <div className="section-header">
                  <div className="section-icon section-icon--improvements">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div className="section-title">
                    <h3>Growth Opportunities</h3>
                    <p>Areas to focus on for your next interview</p>
                  </div>
                </div>

                <div className="improvements-list">
                  {feedback?.areasForImprovement?.map((area, index) => (
                    <div key={index} className="improvement-item">
                      <div className="improvement-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                      <p className="improvement-text">{area}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="feedback-actions">
          <div className="actions-content">
            <div className="actions-info">
              <h4>What's Next?</h4>
              <p>Take action based on your feedback to improve your interview skills</p>
            </div>
            <div className="actions-buttons">
              <Link to="/" className="btn btn--outline">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Back to Dashboard
              </Link>
              <Link to={`/interview/${id}`} className="btn btn--primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4H20C20.5523 4 21 4.44772 21 5V19C21 19.5523 20.5523 20 20 20H4C3.44772 20 3 19.5523 3 19V5C3 4.44772 3.44772 4 4 4Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M10 9L8 12L10 15M14 9L16 12L14 15" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Practice Again
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
