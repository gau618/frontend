import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../constants/api";
import "./adminCandidates.scss";

export default function AdminCandidates() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [interviews, setInterviews] = useState([]);
  const [selectedInterviewId, setSelectedInterviewId] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState("table");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [resCand, resInt] = await Promise.all([
          apiFetch(
            `/api/v1/admin/candidates${
              selectedInterviewId ? `?interviewId=${selectedInterviewId}` : ""
            }`
          ),
          apiFetch("/api/v1/admin/interviews"),
        ]);
        const [dataCand, dataInt] = await Promise.all([
          resCand.json().catch(() => ({})),
          resInt.json().catch(() => ({})),
        ]);
        if (!resCand.ok || !dataCand.success) {
          throw new Error(dataCand.message || "Failed to load candidates");
        }
        if (!resInt.ok || !dataInt.success) {
          throw new Error(dataInt.message || "Failed to load interviews");
        }
        setItems(dataCand.data || []);
        setInterviews(dataInt.data || []);
      } catch (e) {
        setError(e.message || "Failed to load candidates");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedInterviewId]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let result = needle
      ? items.filter((u) =>
          [u.fullName, u.username, u.email]
            .filter(Boolean)
            .some((s) => s.toLowerCase().includes(needle))
        )
      : items;

    // Apply sorting
    result = [...result].sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      // Handle different data types
      if (sortBy === "createdAt" || sortBy === "lastAttemptAt") {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      } else if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = (bVal || "").toLowerCase();
      } else if (typeof aVal === "number") {
        aVal = aVal || 0;
        bVal = bVal || 0;
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });

    return result;
  }, [items, q, sortBy, sortOrder]);

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

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const selectedInterview = interviews.find(int => int._id === selectedInterviewId);

  const stats = useMemo(() => {
    const totalCandidates = filtered.length;
    const totalAttempts = filtered.reduce((sum, candidate) => sum + (candidate.attempts || 0), 0);
    const avgScore = totalCandidates > 0 
      ? filtered.reduce((sum, candidate) => sum + (candidate.avgScore || 0), 0) / totalCandidates
      : 0;
    const activeToday = filtered.filter(
      candidate => candidate.lastAttemptAt && 
      new Date(candidate.lastAttemptAt).toDateString() === new Date().toDateString()
    ).length;

    return { totalCandidates, totalAttempts, avgScore, activeToday };
  }, [filtered]);

  if (loading && items.length === 0) {
    return (
      <div className="candidates-page">
        <div className="loading-container">
          <div className="loading-animation">
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-ring spinner-ring--delayed"></div>
              <div className="spinner-ring spinner-ring--more-delayed"></div>
            </div>
          </div>
          <h3 className="loading-title">Loading Candidates</h3>
          <p className="loading-description">
            Gathering candidate data and interview statistics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="candidates-page">
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

      <div className="candidates-container">
        {/* Header */}
        <div className="candidates-header">
          <div className="header-content">
            <div className="header-info">
              <div className="candidates-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div className="header-text">
                <h1 className="candidates-title">Candidate Management</h1>
                <p className="candidates-subtitle">
                  Monitor and analyze candidates who have attempted your interviews
                </p>
              </div>
            </div>

            <div className="header-stats">
              <div className="stat-item">
                <div className="stat-value">{stats.totalCandidates}</div>
                <div className="stat-label">Total Candidates</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.totalAttempts}</div>
                <div className="stat-label">Total Attempts</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.avgScore.toFixed(1)}</div>
                <div className="stat-label">Avg Score</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.activeToday}</div>
                <div className="stat-label">Active Today</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="candidates-controls">
          <div className="controls-section">
            <div className="filter-group">
              <label className="filter-label">Filter by Interview:</label>
              <div className="select-wrapper">
                <select
                  value={selectedInterviewId}
                  onChange={(e) => {
                    setSelectedInterviewId(e.target.value);
                    showNotification(
                      e.target.value ? "Filtered by specific interview" : "Showing all candidates",
                      "success"
                    );
                  }}
                  className="interview-select"
                >
                  <option value="">All Interviews</option>
                  {interviews.map((interview) => (
                    <option key={interview._id} value={interview._id}>
                      {interview.role} • {interview.level} • {interview.type}
                    </option>
                  ))}
                </select>
                <div className="select-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="search-group">
              <div className="search-wrapper">
                <div className="search-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                    <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by name, username, or email..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="search-input"
                />
                {q && (
                  <button
                    className="clear-search"
                    onClick={() => setQ("")}
                    title="Clear search"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <div className="view-controls">
              <div className="view-toggle">
                <button
                  className={`view-btn ${viewMode === "table" ? "view-btn--active" : ""}`}
                  onClick={() => setViewMode("table")}
                  title="Table view"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1046 21 18 21H17Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
                <button
                  className={`view-btn ${viewMode === "cards" ? "view-btn--active" : ""}`}
                  onClick={() => setViewMode("cards")}
                  title="Card view"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                    <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                    <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                    <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Filter Info */}
          <div className="filter-info">
            <div className="info-text">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>
                Showing <strong>{filtered.length}</strong> candidates who attempted{" "}
                {selectedInterview ? (
                  <strong>{selectedInterview.role} • {selectedInterview.level}</strong>
                ) : (
                  <strong>any of your interviews</strong>
                )}
                {q && (
                  <span> matching "<strong>{q}</strong>"</span>
                )}
              </span>
            </div>
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

        {/* Content */}
        <div className="candidates-content">
          {viewMode === "table" ? (
            <div className="table-container">
              <div className="table-wrapper">
                <table className="candidates-table">
                  <thead>
                    <tr>
                      <th className="sortable" onClick={() => handleSort("fullName")}>
                        <div className="th-content">
                          <span>Name</span>
                          <div className="sort-indicator">
                            {sortBy === "fullName" && (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                <path 
                                  d={sortOrder === "asc" ? "M7 14L12 9L17 14" : "M7 10L12 15L17 10"} 
                                  stroke="currentColor" 
                                  strokeWidth="2"
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                      </th>
                      <th className="sortable" onClick={() => handleSort("username")}>
                        <div className="th-content">
                          <span>Username</span>
                          <div className="sort-indicator">
                            {sortBy === "username" && (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                <path 
                                  d={sortOrder === "asc" ? "M7 14L12 9L17 14" : "M7 10L12 15L17 10"} 
                                  stroke="currentColor" 
                                  strokeWidth="2"
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                      </th>
                      <th>Email</th>
                      <th>Role</th>
                      <th className="sortable" onClick={() => handleSort("createdAt")}>
                        <div className="th-content">
                          <span>Joined</span>
                          <div className="sort-indicator">
                            {sortBy === "createdAt" && (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                <path 
                                  d={sortOrder === "asc" ? "M7 14L12 9L17 14" : "M7 10L12 15L17 10"} 
                                  stroke="currentColor" 
                                  strokeWidth="2"
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                      </th>
                      <th className="sortable" onClick={() => handleSort("attempts")}>
                        <div className="th-content">
                          <span>Attempts</span>
                          <div className="sort-indicator">
                            {sortBy === "attempts" && (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                <path 
                                  d={sortOrder === "asc" ? "M7 14L12 9L17 14" : "M7 10L12 15L17 10"} 
                                  stroke="currentColor" 
                                  strokeWidth="2"
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                      </th>
                      <th className="sortable" onClick={() => handleSort("avgScore")}>
                        <div className="th-content">
                          <span>Avg Score</span>
                          <div className="sort-indicator">
                            {sortBy === "avgScore" && (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                <path 
                                  d={sortOrder === "asc" ? "M7 14L12 9L17 14" : "M7 10L12 15L17 10"} 
                                  stroke="currentColor" 
                                  strokeWidth="2"
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                      </th>
                      <th className="sortable" onClick={() => handleSort("lastAttemptAt")}>
                        <div className="th-content">
                          <span>Last Attempt</span>
                          <div className="sort-indicator">
                            {sortBy === "lastAttemptAt" && (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                <path 
                                  d={sortOrder === "asc" ? "M7 14L12 9L17 14" : "M7 10L12 15L17 10"} 
                                  stroke="currentColor" 
                                  strokeWidth="2"
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((candidate) => (
                      <tr 
                        key={candidate._id}
                        className="candidate-row"
                        onClick={() => setSelectedCandidate(candidate)}
                      >
                        <td>
                          <div className="candidate-name">
                            <div className="candidate-avatar">
                              <div className="avatar-placeholder">
                                {(candidate.fullName || candidate.username || "U").charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <span className="name-text">{candidate.fullName || candidate.username}</span>
                          </div>
                        </td>
                        <td>
                          <span className="username-text">@{candidate.username}</span>
                        </td>
                        <td>
                          <span className="email-text">{candidate.email}</span>
                        </td>
                        <td>
                          <span className="role-badge">{candidate.role || "Candidate"}</span>
                        </td>
                        <td>
                          <span className="date-text">
                            {new Date(candidate.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td>
                          <div className="attempts-badge">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                              <path d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1046 21 18 21H17Z" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            <span>{candidate.attempts || 0}</span>
                          </div>
                        </td>
                        <td>
                          <div className={`score-display score--${getScoreColor(candidate.avgScore || 0)}`}>
                            <span className="score-value">
                              {typeof candidate.avgScore === "number" ? candidate.avgScore.toFixed(1) : "0.0"}
                            </span>
                            <span className="score-grade">
                              {getScoreGrade(candidate.avgScore || 0)}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="date-text">
                            {candidate.lastAttemptAt
                              ? new Date(candidate.lastAttemptAt).toLocaleDateString()
                              : "-"}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {!loading && filtered.length === 0 && (
                      <tr>
                        <td colSpan={8} className="empty-state">
                          <div className="empty-content">
                            <div className="empty-icon">
                              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2"/>
                                <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                            </div>
                            <h4>No Candidates Found</h4>
                            <p>
                              {q 
                                ? `No candidates match your search "${q}"`
                                : "No candidates have attempted your interviews yet"
                              }
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="cards-container">
              <div className="cards-grid">
                {filtered.map((candidate) => (
                  <div 
                    key={candidate._id} 
                    className="candidate-card"
                    onClick={() => setSelectedCandidate(candidate)}
                  >
                    <div className="card-header">
                      <div className="candidate-avatar">
                        <div className="avatar-placeholder">
                          {(candidate.fullName || candidate.username || "U").charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="candidate-info">
                        <h4 className="candidate-name">
                          {candidate.fullName || candidate.username}
                        </h4>
                        <p className="candidate-email">{candidate.email}</p>
                        <span className="candidate-username">@{candidate.username}</span>
                      </div>
                    </div>

                    <div className="card-stats">
                      <div className="stat-item">
                        <div className="stat-label">Attempts</div>
                        <div className="stat-value">{candidate.attempts || 0}</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-label">Avg Score</div>
                        <div className={`stat-value score--${getScoreColor(candidate.avgScore || 0)}`}>
                          {typeof candidate.avgScore === "number" ? candidate.avgScore.toFixed(1) : "0.0"}
                        </div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-label">Grade</div>
                        <div className="stat-value grade-display">
                          {getScoreGrade(candidate.avgScore || 0)}
                        </div>
                      </div>
                    </div>

                    <div className="card-footer">
                      <div className="footer-item">
                        <span className="footer-label">Joined:</span>
                        <span className="footer-value">
                          {new Date(candidate.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="footer-item">
                        <span className="footer-label">Last Attempt:</span>
                        <span className="footer-value">
                          {candidate.lastAttemptAt
                            ? new Date(candidate.lastAttemptAt).toLocaleDateString()
                            : "Never"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {!loading && filtered.length === 0 && (
                  <div className="empty-state-cards">
                    <div className="empty-icon">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                        <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2"/>
                        <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <h4>No Candidates Found</h4>
                    <p>
                      {q 
                        ? `No candidates match your search "${q}"`
                        : "No candidates have attempted your interviews yet"
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Loading Overlay */}
        {loading && items.length > 0 && (
          <div className="loading-overlay">
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
            </div>
          </div>
        )}
      </div>

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <div className="candidate-modal" onClick={() => setSelectedCandidate(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Candidate Details</h3>
              <button 
                className="modal-close"
                onClick={() => setSelectedCandidate(null)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="candidate-profile">
                <div className="profile-avatar">
                  <div className="avatar-placeholder">
                    {(selectedCandidate.fullName || selectedCandidate.username || "U").charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="profile-info">
                  <h4>{selectedCandidate.fullName || selectedCandidate.username}</h4>
                  <p>{selectedCandidate.email}</p>
                  <span>@{selectedCandidate.username}</span>
                </div>
              </div>

              <div className="candidate-metrics">
                <div className="metric-card">
                  <div className="metric-value">{selectedCandidate.attempts || 0}</div>
                  <div className="metric-label">Total Attempts</div>
                </div>
                <div className="metric-card">
                  <div className={`metric-value score--${getScoreColor(selectedCandidate.avgScore || 0)}`}>
                    {typeof selectedCandidate.avgScore === "number" ? selectedCandidate.avgScore.toFixed(1) : "0.0"}
                  </div>
                  <div className="metric-label">Average Score</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">{getScoreGrade(selectedCandidate.avgScore || 0)}</div>
                  <div className="metric-label">Grade</div>
                </div>
              </div>

              <div className="candidate-timeline">
                <div className="timeline-item">
                  <span className="timeline-label">Joined:</span>
                  <span className="timeline-value">
                    {new Date(selectedCandidate.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="timeline-item">
                  <span className="timeline-label">Last Attempt:</span>
                  <span className="timeline-value">
                    {selectedCandidate.lastAttemptAt
                      ? new Date(selectedCandidate.lastAttemptAt).toLocaleString()
                      : "No attempts yet"}
                  </span>
                </div>
                <div className="timeline-item">
                  <span className="timeline-label">Role:</span>
                  <span className="timeline-value">{selectedCandidate.role || "Candidate"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
