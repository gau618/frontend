import React from "react";
import "./interview.scss";
import { useNavigate } from "react-router-dom";

const InterviewCard = ({ interview }) => {
  const navigate = useNavigate();

  // Get badge configuration based on interview type
  const getBadgeConfig = (type) => {
    const configs = {
      "Technical": { color: "technical", icon: "⚡" },
      "Behavioral": { color: "behavioral", icon: "🎭" },
      "HR": { color: "hr", icon: "👥" },
      "System Design": { color: "system", icon: "🏗️" }
    };
    return configs[type] || { color: "default", icon: "📋" };
  };

  const badgeConfig = getBadgeConfig(interview.type);
  
  const questionCount = Number.isFinite(interview.amount)
    ? interview.amount
    : interview.questions
    ? interview.questions.length
    : 0;

  const handleStartInterview = () => {
    navigate(`/interviewPage/${interview._id}`);
  };

  return (
    <article className="interview-card">
      {/* Compact Header */}
      <header className="card-header">
        <div className="header-main">
          <h3 className="card-title">{interview.role}</h3>
          <div className={`interview-badge badge--${badgeConfig.color}`}>
            <span className="badge-text">{interview.type}</span>
          </div>
        </div>
      </header>

      {/* Compact Body */}
      <div className="card-body">
        {/* Key Stats Row */}
        <div className="stats-row">
          <div className="stat">
            <span className="stat-label">Level</span>
            <span className="stat-value">{interview.level}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Questions</span>
            <span className="stat-value">{questionCount}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Duration</span>
            <span className="stat-value">{Math.max(questionCount * 3, 15)}m</span>
          </div>
        </div>

        {/* Tech Stack (Compact) */}
        {interview.techstack && interview.techstack.length > 0 && (
          <div className="tech-section">
            <div className="tech-stack">
              {interview.techstack.slice(0, 3).map((tech, idx) => (
                <span key={idx} className="tech-tag">{tech}</span>
              ))}
              {interview.techstack.length > 3 && (
                <span className="tech-more">+{interview.techstack.length - 3}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Compact Footer */}
      <footer className="card-footer">
        <button className="start-btn" onClick={handleStartInterview}>
          Start Interview
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </button>
      </footer>
    </article>
  );
};

export default InterviewCard;
