import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { apiFetch } from "../constants/api";
import "./adminAuth.scss";

export default function AdminAuth() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Sync mode with URL parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlMode = params.get("mode");
    if (urlMode === "register") {
      setMode("register");
    } else {
      setMode("login");
    }
  }, [location.search]);

  // Redirect if already admin
  useEffect(() => {
    if (user?.role === "admin") {
      navigate("/admin");
    }
  }, [user, navigate]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (mode === "register") {
      if (!form.fullName.trim()) {
        newErrors.fullName = "Full name is required";
      }
    }
    
    if (!form.email && !form.username) {
      newErrors.credentials = "Please provide either email or username";
    }
    
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (mode === "register" && form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setForm({
      fullName: "",
      username: "",
      email: "",
      password: "",
    });
    setErrors({});
    
    // Update URL
    const params = new URLSearchParams(location.search);
    if (newMode === "register") {
      params.set("mode", "register");
    } else {
      params.delete("mode");
    }
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
    if (errors.credentials && (field === "email" || field === "username")) {
      setErrors(prev => ({ ...prev, credentials: "" }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setErrors({});

    try {
      const path = mode === "register" ? "/api/v1/admin/register" : "/api/v1/admin/login";
      const body = mode === "register"
        ? {
            fullName: form.fullName.trim(),
            username: form.username.trim(),
            email: form.email.trim(),
            password: form.password,
          }
        : {
            email: form.email.trim() || undefined,
            username: form.username.trim() || undefined,
            password: form.password,
          };
      
      const res = await apiFetch(path, { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Authentication failed");
      }
      
      showNotification(
        mode === "register" 
          ? "Admin account created successfully! You are now logged in." 
          : "Welcome back! Login successful.",
        "success"
      );
      
      setTimeout(() => navigate("/admin"), 2000);
    } catch (e) {
      setErrors({ submit: e.message || "Authentication failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-page">
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

      <div className="admin-auth-container">
        {/* Left Side - Admin Branding */}
        <div className="admin-branding">
          <div className="branding-content">
            <div className="admin-badge">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 22S8 18 8 13V6L12 4L16 6V13C16 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>Admin Portal</span>
            </div>
            
            <h1 className="admin-title">
              {mode === "register" ? "Create Admin Account" : "Admin Dashboard Access"}
            </h1>
            
            <p className="admin-description">
              {mode === "register" 
                ? "Set up administrative access to manage interviews, templates, and system configurations."
                : "Access the administrative dashboard to manage the interview platform and monitor system performance."
              }
            </p>

            {/* Admin Features */}
            <div className="admin-features">
              <div className="feature-item">
                <div className="feature-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1046 21 18 21H17Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <span>Interview Template Management</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <span>User & Session Monitoring</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M3 3V9M3 9L9 3M3 9L9 9M21 21V15M21 21L15 21M21 21L15 15M21 3V9M21 9L15 3M21 9L15 9M3 21V15M3 21L9 21M3 21L9 15" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <span>System Analytics & Reports</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="admin-form-container">
          <div className="admin-form">
            {/* Form Header */}
            <div className="form-header">
              <h2 className="form-title">
                {mode === "register" ? "Create Admin Account" : "Admin Login"}
              </h2>
              <p className="form-subtitle">
                {mode === "register" 
                  ? "Set up administrative access for the interview platform"
                  : "Access the administrative dashboard and management tools"
                }
              </p>
            </div>

            {/* Mode Toggle */}
            <div className="mode-toggle">
              <button
                type="button"
                className={`toggle-btn ${mode === "login" ? "toggle-btn--active" : ""}`}
                onClick={() => handleModeChange("login")}
              >
                Admin Login
              </button>
              <button
                type="button"
                className={`toggle-btn ${mode === "register" ? "toggle-btn--active" : ""}`}
                onClick={() => handleModeChange("register")}
              >
                Create Admin
              </button>
            </div>

            {/* Auth Form */}
            <form onSubmit={onSubmit} className="auth-form">
              {/* Full Name - Register Only */}
              {mode === "register" && (
                <div className="form-group">
                  <label htmlFor="fullName" className="form-label">
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={form.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    className={`form-input ${errors.fullName ? 'form-input--error' : ''}`}
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && <span className="form-error">{errors.fullName}</span>}
                </div>
              )}

              {/* Email */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                  {!mode === "register" && <span className="form-hint">(or use username below)</span>}
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`form-input ${errors.email ? 'form-input--error' : ''}`}
                  placeholder="Enter your email address"
                />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>

              {/* Username */}
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  Username
                  {!mode === "register" && <span className="form-hint">(or use email above)</span>}
                </label>
                <input
                  id="username"
                  type="text"
                  value={form.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  className="form-input"
                  placeholder="Enter your username"
                />
              </div>

              {/* Credentials Error */}
              {errors.credentials && (
                <div className="form-error form-error--block">{errors.credentials}</div>
              )}

              {/* Password */}
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password <span className="required">*</span>
                </label>
                <div className="password-input">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={`form-input ${errors.password ? 'form-input--error' : ''}`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {errors.password && <span className="form-error">{errors.password}</span>}
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="form-error form-error--block">{errors.submit}</div>
              )}

              {/* Submit Button */}
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <div className="btn-spinner">
                      <div className="spinner-ring"></div>
                    </div>
                    <span>{mode === "register" ? "Creating Account..." : "Signing In..."}</span>
                  </>
                ) : (
                  <>
                    <div className="btn-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 22S8 18 8 13V6L12 4L16 6V13C16 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                        <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <span>{mode === "register" ? "Create Admin Account" : "Access Dashboard"}</span>
                  </>
                )}
              </button>
            </form>

            {/* Navigation Links */}
            <div className="form-footer">
              <div className="nav-section">
                <h4>Looking for something else?</h4>
                <div className="nav-links">
                  <Link to="/auth" className="nav-link">
                    <div className="nav-icon">👤</div>
                    <div className="nav-content">
                      <span>Candidate Login</span>
                      <small>Access interview platform</small>
                    </div>
                  </Link>
                  <Link to="/auth?mode=signup" className="nav-link">
                    <div className="nav-icon">📝</div>
                    <div className="nav-content">
                      <span>Create Account</span>
                      <small>Register as new candidate</small>
                    </div>
                  </Link>
                  <Link to="/code" className="nav-link">
                    <div className="nav-icon">🔑</div>
                    <div className="nav-content">
                      <span>Interview Code</span>
                      <small>Enter access code</small>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Admin Tip */}
              <div className="admin-tip">
                <div className="tip-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="tip-content">
                  <strong>Pro Tip:</strong> Use the Templates feature to create standardized 
                  interviews and efficiently manage candidate assessments across different roles.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
