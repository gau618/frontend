import React, { useEffect, useState } from "react";
import { apiFetch } from "../constants/api";
import ProtectedRoute from "../auth/ProtectedRoute";
import { useAuth } from "../auth/AuthContext";
import AdminCandidates from "./AdminCandidates";
import AdminQuestions from "./AdminQuestions";
import AdminTemplates from "./AdminTemplates";
import AdminCode from "./AdminCode";
import AdminAnalytics from "./AdminAnalytics";
import AdminCreatedInterviews from "./AdminCreatedInterviews";
import "./admin.scss";

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("dashboard");
  const [selectedAnalyticsId, setSelectedAnalyticsId] = useState("");
  const [notification, setNotification] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await apiFetch("/api/v1/admin/stats");
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load statistics");
        }
        setStats(data.data);
      } catch (e) {
        setError(e.message || "Failed to load stats");
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === "admin") {
      fetchStats();
    }
  }, [user]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const tabConfig = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M3 3V9M3 9L9 3M3 9L9 9M21 21V15M21 21L15 21M21 21L15 15M21 3V9M21 9L15 3M21 9L15 9M3 21V15M3 21L9 21M3 21L9 15" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      description: "Overview and statistics"
    },
    {
      id: "candidates",
      name: "Candidates",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      description: "Manage candidates"
    },
    {
      id: "questions",
      name: "Question Bank",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1046 21 18 21H17Z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      description: "Manage interview questions"
    },
    {
      id: "templates",
      name: "Templates",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      description: "Interview templates"
    },
    {
      id: "analytics",
      name: "Analytics",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M9 19V6L20 18V8M9 19H20M9 19L2 12L9 5" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      description: "Performance insights"
    },
    {
      id: "code",
      name: "Code Interviews",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M16 18L22 12L16 6M8 6L2 12L8 18" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      description: "Code-based interviews"
    }
  ];

  const getStatsCards = () => {
    if (!stats) return [];
    
    return [
      {
        title: "Total Users",
        value: stats.users || 0,
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" strokeWidth="2"/>
          </svg>
        ),
        color: "primary",
        trend: "+12%"
      },
      {
        title: "Your Interviews",
        value: stats.myInterviews || 0,
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1046 21 18 21H17Z" stroke="currentColor" strokeWidth="2"/>
          </svg>
        ),
        color: "success",
        trend: "+8%"
      },
      {
        title: "Active Sessions",
        value: stats.activeSessions || 0,
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2"/>
          </svg>
        ),
        color: "warning",
        trend: "Live"
      },
      {
        title: "Completion Rate",
        value: `${stats.completionRate || 0}%`,
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
          </svg>
        ),
        color: "accent",
        trend: "+3%"
      }
    ];
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="admin-page">
        <div className="access-denied">
          <div className="access-denied-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path d="M12 22S8 18 8 13V6L12 4L16 6V13C16 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <h2 className="access-denied-title">Admin Access Required</h2>
          <p className="access-denied-description">
            This area is restricted to administrators only. Please log in with admin credentials to continue.
          </p>
          <div className="access-denied-actions">
            <a href="/admin/auth" className="btn btn--primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 22S8 18 8 13V6L12 4L16 6V13C16 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Admin Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="admin-page">
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

        <div className="admin-container">
          {/* Header */}
          <div className="admin-header">
            <div className="header-content">
              <div className="header-info">
                <div className="admin-badge">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22S8 18 8 13V6L12 4L16 6V13C16 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <span>Admin Portal</span>
                </div>
                <h1 className="admin-title">Administrative Dashboard</h1>
                <p className="admin-subtitle">
                  Manage interviews, candidates, and system analytics
                </p>
              </div>
              
              <div className="admin-user">
                <div className="user-avatar">
                  <div className="avatar-placeholder">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : "A"}
                  </div>
                </div>
                <div className="user-info">
                  <span className="user-name">{user.fullName || user.username}</span>
                  <span className="user-role">Administrator</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="admin-navigation">
            <div className="nav-tabs">
              {tabConfig.map((tabItem) => (
                <button
                  key={tabItem.id}
                  className={`nav-tab ${tab === tabItem.id ? "nav-tab--active" : ""}`}
                  onClick={() => setTab(tabItem.id)}
                >
                  <div className="tab-icon">{tabItem.icon}</div>
                  <div className="tab-content">
                    <span className="tab-name">{tabItem.name}</span>
                    <span className="tab-description">{tabItem.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="admin-content">
            {/* Dashboard Tab */}
            {tab === "dashboard" && (
              <div className="dashboard-content">
                {/* Error State */}
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

                {/* Loading State */}
                {loading && (
                  <div className="loading-section">
                    <div className="loading-spinner">
                      <div className="spinner-ring"></div>
                      <div className="spinner-ring spinner-ring--delayed"></div>
                    </div>
                    <p className="loading-text">Loading dashboard statistics...</p>
                  </div>
                )}

                {/* Stats Cards */}
                {!loading && stats && (
                  <div className="stats-section">
                    <div className="section-header">
                      <h2>System Overview</h2>
                      <p>Key metrics and performance indicators</p>
                    </div>
                    
                    <div className="stats-grid">
                      {getStatsCards().map((stat, index) => (
                        <div key={index} className={`stat-card stat-card--${stat.color}`}>
                          <div className="stat-header">
                            <div className="stat-icon">{stat.icon}</div>
                            <div className="stat-trend">{stat.trend}</div>
                          </div>
                          <div className="stat-content">
                            <div className="stat-value">{stat.value}</div>
                            <div className="stat-title">{stat.title}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Interviews */}
                <div className="recent-interviews-section">
                  <div className="section-header">
                    <h2>Recent Interviews</h2>
                    <p>Latest interview activities and results</p>
                  </div>
                  
                  <AdminCreatedInterviews
                    onView={(id) => {
                      setSelectedAnalyticsId(id);
                      setTab("analytics");
                      showNotification("Switched to analytics view", "success");
                    }}
                  />
                </div>
              </div>
            )}

            {/* Other Tabs */}
            {tab === "candidates" && (
              <div className="tab-section">
                <div className="section-header">
                  <h2>Candidate Management</h2>
                  <p>View and manage registered candidates</p>
                </div>
                <AdminCandidates />
              </div>
            )}

            {tab === "questions" && (
              <div className="tab-section">
                <div className="section-header">
                  <h2>Question Bank</h2>
                  <p>Manage interview questions and categories</p>
                </div>
                <AdminQuestions />
              </div>
            )}

            {tab === "templates" && (
              <div className="tab-section">
                <div className="section-header">
                  <h2>Interview Templates</h2>
                  <p>Create and manage reusable interview templates</p>
                </div>
                <AdminTemplates />
              </div>
            )}

            {tab === "analytics" && (
              <div className="tab-section">
                <div className="section-header">
                  <h2>Analytics & Insights</h2>
                  <p>Detailed performance analytics and reports</p>
                </div>
                <AdminAnalytics selectedId={selectedAnalyticsId} />
              </div>
            )}

            {tab === "code" && (
              <div className="tab-section">
                <div className="section-header">
                  <h2>Code-Based Interviews</h2>
                  <p>Manage coding challenges and technical assessments</p>
                </div>
                <AdminCode />
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
