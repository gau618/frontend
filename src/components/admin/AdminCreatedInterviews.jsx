import React, { useEffect, useState } from "react";
import { apiFetch } from "../constants/api";
import "./adminCreatedInterviews.scss";

export default function AdminCreatedInterviews({ onView }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchInterviews = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await apiFetch("/api/v1/admin/interviews");
        const body = await res.json().catch(() => ({}));
        if (!res.ok || !body.success) {
          throw new Error(body.message || "Failed to load interviews");
        }
        setItems(body.data || []);
      } catch (e) {
        setError(e.message || "Failed to load interviews");
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const handleViewAnalytics = (interviewId, interviewData) => {
    if (onView) {
      onView(interviewId);
      showNotification(`Viewing analytics for ${interviewData.role} interview`, "success");
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      "technical": (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M16 18L22 12L16 6M8 6L2 12L8 18" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      "behavioral": (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      "mixed": (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    };
    return icons[type] || icons["technical"];
  };

  const getTypeColor = (type) => {
    const colors = {
      "technical": "technical",
      "behavioral": "behavioral", 
      "mixed": "mixed"
    };
    return colors[type] || "technical";
  };

  const filteredAndSortedItems = React.useMemo(() => {
    let filtered = items;

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter(item => item.type === filterType);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.role?.toLowerCase().includes(query) ||
        item.level?.toLowerCase().includes(query) ||
        item.type?.toLowerCase().includes(query) ||
        item.company?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === "createdAt") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (sortBy === "amount") {
        aVal = aVal || (a.questions ? a.questions.length : 0);
        bVal = bVal || (b.questions ? b.questions.length : 0);
      } else if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = (bVal || "").toLowerCase();
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });

    return sorted;
  }, [items, filterType, searchQuery, sortBy, sortOrder]);

  const stats = React.useMemo(() => {
    const total = items.length;
    const technical = items.filter(item => item.type === "technical").length;
    const behavioral = items.filter(item => item.type === "behavioral").length;
    const mixed = items.filter(item => item.type === "mixed").length;
    const avgQuestions = total > 0 
      ? items.reduce((sum, item) => sum + (item.amount || (item.questions?.length || 0)), 0) / total
      : 0;

    return { total, technical, behavioral, mixed, avgQuestions };
  }, [items]);

  if (loading && items.length === 0) {
    return (
      <div className="created-interviews-page">
        <div className="loading-container">
          <div className="loading-animation">
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-ring spinner-ring--delayed"></div>
              <div className="spinner-ring spinner-ring--more-delayed"></div>
            </div>
          </div>
          <h3 className="loading-title">Loading Interviews</h3>
          <p className="loading-description">
            Fetching your created interviews and analytics data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="created-interviews-page">
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

      <div className="created-interviews-container">
        {/* Header */}
        <div className="interviews-header">
          <div className="header-content">
            <div className="header-info">
              <div className="interviews-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1046 21 18 21H17Z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div className="header-text">
                <h3 className="interviews-title">Your Created Interviews</h3>
                <p className="interviews-subtitle">
                  Manage and analyze your interview templates and performance data
                </p>
              </div>
            </div>

            <div className="header-stats">
              <div className="stat-card stat-card--primary">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Total Interviews</div>
              </div>
              <div className="stat-card stat-card--accent">
                <div className="stat-value">{stats.avgQuestions.toFixed(1)}</div>
                <div className="stat-label">Avg Questions</div>
              </div>
            </div>
          </div>

          {/* Type Distribution */}
          <div className="type-distribution">
            <div className="distribution-item">
              <div className="distribution-icon distribution-icon--technical">
                {getTypeIcon("technical")}
              </div>
              <div className="distribution-content">
                <span className="distribution-value">{stats.technical}</span>
                <span className="distribution-label">Technical</span>
              </div>
            </div>
            <div className="distribution-item">
              <div className="distribution-icon distribution-icon--behavioral">
                {getTypeIcon("behavioral")}
              </div>
              <div className="distribution-content">
                <span className="distribution-value">{stats.behavioral}</span>
                <span className="distribution-label">Behavioral</span>
              </div>
            </div>
            <div className="distribution-item">
              <div className="distribution-icon distribution-icon--mixed">
                {getTypeIcon("mixed")}
              </div>
              <div className="distribution-content">
                <span className="distribution-value">{stats.mixed}</span>
                <span className="distribution-label">Mixed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="interviews-controls">
          <div className="controls-section">
            <div className="filter-group">
              <label className="filter-label">Filter by Type:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Types</option>
                <option value="technical">Technical</option>
                <option value="behavioral">Behavioral</option>
                <option value="mixed">Mixed</option>
              </select>
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
                  placeholder="Search interviews by role, level, or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <button
                    className="clear-search"
                    onClick={() => setSearchQuery("")}
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

          {/* Results Info */}
          <div className="results-info">
            <span className="results-text">
              Showing <strong>{filteredAndSortedItems.length}</strong> of <strong>{items.length}</strong> interviews
              {searchQuery && (
                <span> matching "<strong>{searchQuery}</strong>"</span>
              )}
              {filterType !== "all" && (
                <span> • <strong>{filterType}</strong> type</span>
              )}
            </span>
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
        <div className="interviews-content">
          {viewMode === "table" ? (
            <div className="table-container">
              <div className="table-wrapper">
                <table className="interviews-table">
                  <thead>
                    <tr>
                      <th className="sortable" onClick={() => handleSort("role")}>
                        <div className="th-content">
                          <span>Role</span>
                          <div className="sort-indicator">
                            {sortBy === "role" && (
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
                      <th className="sortable" onClick={() => handleSort("level")}>
                        <div className="th-content">
                          <span>Level</span>
                          <div className="sort-indicator">
                            {sortBy === "level" && (
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
                      <th className="sortable" onClick={() => handleSort("type")}>
                        <div className="th-content">
                          <span>Type</span>
                          <div className="sort-indicator">
                            {sortBy === "type" && (
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
                      <th className="sortable" onClick={() => handleSort("amount")}>
                        <div className="th-content">
                          <span>Questions</span>
                          <div className="sort-indicator">
                            {sortBy === "amount" && (
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
                      <th className="sortable" onClick={() => handleSort("createdAt")}>
                        <div className="th-content">
                          <span>Created</span>
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
                      <th>Analytics</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedItems.map((interview) => (
                      <tr key={interview._id} className="interview-row">
                        <td>
                          <div className="role-cell">
                            <div className="role-main">
                              <span className="role-title">{interview.role}</span>
                              {interview.company && (
                                <span className="role-company">@ {interview.company}</span>
                              )}
                            </div>
                            {interview.techstack && interview.techstack.length > 0 && (
                              <div className="role-tech">
                                {interview.techstack.slice(0, 2).map((tech, idx) => (
                                  <span key={idx} className="tech-tag">{tech}</span>
                                ))}
                                {interview.techstack.length > 2 && (
                                  <span className="tech-more">+{interview.techstack.length - 2}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`level-badge level-badge--${interview.level?.toLowerCase()}`}>
                            {interview.level}
                          </span>
                        </td>
                        <td>
                          <div className={`type-badge type-badge--${getTypeColor(interview.type)}`}>
                            <div className="type-icon">
                              {getTypeIcon(interview.type)}
                            </div>
                            <span className="type-text">{interview.type}</span>
                          </div>
                        </td>
                        <td>
                          <div className="questions-count">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                              <path d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1046 21 18 21H17Z" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            <span>{interview.amount || (interview.questions ? interview.questions.length : 0)}</span>
                          </div>
                        </td>
                        <td>
                          <div className="date-cell">
                            <span className="date-primary">
                              {new Date(interview.createdAt).toLocaleDateString()}
                            </span>
                            <span className="date-secondary">
                              {new Date(interview.createdAt).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        </td>
                        <td>
                          <button
                            className="analytics-btn"
                            onClick={() => handleViewAnalytics(interview._id, interview)}
                            title="View detailed analytics"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M9 19V6L20 18V8M9 19H20M9 19L2 12L9 5" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            <span>View Analytics</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!loading && filteredAndSortedItems.length === 0 && (
                      <tr>
                        <td colSpan={6} className="empty-state">
                          <div className="empty-content">
                            <div className="empty-icon">
                              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                <path d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1046 21 18 21H17Z" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                            </div>
                            <h4>No Interviews Found</h4>
                            <p>
                              {searchQuery || filterType !== "all" 
                                ? "No interviews match your current filters" 
                                : "You haven't created any interviews yet"}
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
                {filteredAndSortedItems.map((interview) => (
                  <div key={interview._id} className="interview-card">
                    <div className="card-header">
                      <div className="header-left">
                        <div className={`type-indicator type-indicator--${getTypeColor(interview.type)}`}>
                          {getTypeIcon(interview.type)}
                        </div>
                        <div className="interview-info">
                          <h4 className="interview-role">{interview.role}</h4>
                          {interview.company && (
                            <p className="interview-company">@ {interview.company}</p>
                          )}
                        </div>
                      </div>
                      <span className={`level-badge level-badge--${interview.level?.toLowerCase()}`}>
                        {interview.level}
                      </span>
                    </div>

                    <div className="card-content">
                      <div className="interview-meta">
                        <div className="meta-item">
                          <span className="meta-label">Type:</span>
                          <span className="meta-value">{interview.type}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">Questions:</span>
                          <span className="meta-value">
                            {interview.amount || (interview.questions ? interview.questions.length : 0)}
                          </span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">Created:</span>
                          <span className="meta-value">
                            {new Date(interview.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {interview.techstack && interview.techstack.length > 0 && (
                        <div className="tech-stack">
                          <div className="tech-label">Tech Stack:</div>
                          <div className="tech-tags">
                            {interview.techstack.slice(0, 3).map((tech, idx) => (
                              <span key={idx} className="tech-tag">{tech}</span>
                            ))}
                            {interview.techstack.length > 3 && (
                              <span className="tech-more">+{interview.techstack.length - 3} more</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="card-footer">
                      <button
                        className="analytics-btn analytics-btn--full"
                        onClick={() => handleViewAnalytics(interview._id, interview)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M9 19V6L20 18V8M9 19H20M9 19L2 12L9 5" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        <span>View Analytics</span>
                      </button>
                    </div>
                  </div>
                ))}
                {!loading && filteredAndSortedItems.length === 0 && (
                  <div className="empty-state-cards">
                    <div className="empty-icon">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                        <path d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1046 21 18 21H17Z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <h4>No Interviews Found</h4>
                    <p>
                      {searchQuery || filterType !== "all" 
                        ? "No interviews match your current filters" 
                        : "You haven't created any interviews yet"}
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
    </div>
  );
}
