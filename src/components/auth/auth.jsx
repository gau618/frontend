import React, { useEffect, useState } from "react";
import "./auth.scss";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../constants/api";
import { useAuth } from "./AuthContext";

export default function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
    avatar: null,
    coverImage: null,
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  // Sync isSignUp with query param: /auth?mode=signup
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get("mode");
    setIsSignUp(mode === "signup");
  }, [location.search]);

  // Password strength calculator
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (isSignUp) {
      if (!formData.fullname.trim()) newErrors.fullname = "Full name is required";
      if (!formData.username.trim()) newErrors.username = "Username is required";
      if (formData.username.length < 3) newErrors.username = "Username must be at least 3 characters";
      if (!formData.avatar) newErrors.avatar = "Profile picture is required";
    }
    
    if (!formData.email && !formData.username) {
      newErrors.login = "Please provide either email or username";
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (isSignUp && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleToggle = () => {
    setIsSignUp(!isSignUp);
    setFormData({
      fullname: "",
      username: "",
      email: "",
      password: "",
      avatar: null,
      coverImage: null,
    });
    setErrors({});
    setPasswordStrength(0);
    
    // Update URL
    const params = new URLSearchParams(location.search);
    if (!isSignUp) {
      params.set("mode", "signup");
    } else {
      params.delete("mode");
    }
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (files && files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      
      // Calculate password strength for signup
      if (name === "password" && isSignUp) {
        setPasswordStrength(calculatePasswordStrength(value));
      }
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setErrors({});

    try {
      if (isSignUp) {
        const { fullname, username, email, password, avatar, coverImage } = formData;
        
        const form = new FormData();
        form.append("fullname", fullname.trim());
        form.append("username", username.trim().toLowerCase());
        form.append("email", email.trim().toLowerCase());
        form.append("password", password);
        form.append("avatar", avatar);
        if (coverImage) {
          form.append("coverImage", coverImage);
        }

        await register(form);
        showNotification("Account created successfully! Welcome to InterviewPro.");
        
        // Reset form
        setFormData({
          fullname: "",
          username: "",
          email: "",
          password: "",
          avatar: null,
          coverImage: null,
        });
        
        setTimeout(() => navigate("/"), 2000);
      } else {
        let { email, password, username } = formData;
        username = username?.trim();
        email = email?.trim();

        const payload = { password };
        if (email) payload.email = email.toLowerCase();
        if (username) payload.username = username.toLowerCase();

        await login(payload);
        showNotification("Welcome back! Login successful.");
        setTimeout(() => navigate("/"), 1500);
      }
    } catch (error) {
      console.error(error);
      setErrors({ 
        submit: error?.message || `Something went wrong during ${isSignUp ? 'registration' : 'login'}.` 
      });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return "#ef4444";
    if (passwordStrength < 50) return "#f59e0b";
    if (passwordStrength < 75) return "#3b82f6";
    return "#10b981";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return "Weak";
    if (passwordStrength < 50) return "Fair";
    if (passwordStrength < 75) return "Good";
    return "Strong";
  };

  return (
    <div className="auth-page">
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

      <div className="auth-container">
        {/* Left Side - Branding */}
        <div className="auth-branding">
          <div className="branding-content">
            <div className="brand-logo">
              <div className="logo-icon">🎯</div>
              <span className="logo-text">InterviewPro</span>
            </div>
            <h1 className="brand-title">
              {isSignUp ? "Join thousands of professionals" : "Welcome back to your"}
              <span className="brand-highlight"> interview success journey</span>
            </h1>
            <p className="brand-description">
              {isSignUp 
                ? "Create your account and start practicing with our AI-powered interview platform designed for career advancement."
                : "Continue your interview preparation journey with personalized practice sessions and detailed feedback."
              }
            </p>
            
            {/* Features List */}
            <div className="feature-list">
              <div className="feature-item">
                <div className="feature-icon">✨</div>
                <span>AI-Powered Interview Practice</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📊</div>
                <span>Detailed Performance Analytics</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🎯</div>
                <span>Industry-Specific Questions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="auth-form-container">
          <div className="auth-form">
            <div className="form-header">
              <h2 className="form-title">
                {isSignUp ? "Create Your Account" : "Sign In to Your Account"}
              </h2>
              <p className="form-subtitle">
                {isSignUp 
                  ? "Start your professional interview preparation journey"
                  : "Continue where you left off"
                }
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form-content">
              {/* Sign Up Fields */}
              {isSignUp && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="fullname" className="form-label">
                        Full Name <span className="required">*</span>
                      </label>
                      <input
                        id="fullname"
                        type="text"
                        name="fullname"
                        value={formData.fullname}
                        onChange={handleChange}
                        className={`form-input ${errors.fullname ? 'form-input--error' : ''}`}
                        placeholder="Enter your full name"
                      />
                      {errors.fullname && <span className="form-error">{errors.fullname}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="username" className="form-label">
                        Username <span className="required">*</span>
                      </label>
                      <input
                        id="username"
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className={`form-input ${errors.username ? 'form-input--error' : ''}`}
                        placeholder="Choose a username"
                      />
                      {errors.username && <span className="form-error">{errors.username}</span>}
                    </div>
                  </div>

                  {/* File Upload Fields */}
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">
                        Profile Picture <span className="required">*</span>
                      </label>
                      <div className="file-upload">
                        <input
                          type="file"
                          name="avatar"
                          accept="image/*"
                          onChange={handleChange}
                          className="file-input"
                          id="avatar-upload"
                        />
                        <label htmlFor="avatar-upload" className="file-label">
                          <div className="file-icon">📷</div>
                          <div className="file-text">
                            <span>{formData.avatar ? formData.avatar.name : "Choose profile picture"}</span>
                            <small>PNG, JPG up to 5MB</small>
                          </div>
                        </label>
                      </div>
                      {errors.avatar && <span className="form-error">{errors.avatar}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Cover Image (Optional)</label>
                      <div className="file-upload">
                        <input
                          type="file"
                          name="coverImage"
                          accept="image/*"
                          onChange={handleChange}
                          className="file-input"
                          id="cover-upload"
                        />
                        <label htmlFor="cover-upload" className="file-label">
                          <div className="file-icon">🖼️</div>
                          <div className="file-text">
                            <span>{formData.coverImage ? formData.coverImage.name : "Choose cover image"}</span>
                            <small>PNG, JPG up to 10MB</small>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Login Username Field */}
              {!isSignUp && (
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="username-login" className="form-label">
                      Username <span className="form-hint">(or use email below)</span>
                    </label>
                    <input
                      id="username-login"
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter your username"
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email Address
                    {isSignUp && <span className="required">*</span>}
                    {!isSignUp && <span className="form-hint">(or use username above)</span>}
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`form-input ${errors.email ? 'form-input--error' : ''}`}
                    placeholder="Enter your email address"
                  />
                  {errors.email && <span className="form-error">{errors.email}</span>}
                </div>
              </div>

              {/* Password Field */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    Password <span className="required">*</span>
                  </label>
                  <div className="password-input">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
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
                  
                  {/* Password Strength Indicator */}
                  {isSignUp && formData.password && (
                    <div className="password-strength">
                      <div className="strength-bar">
                        <div 
                          className="strength-fill" 
                          style={{ 
                            width: `${passwordStrength}%`,
                            backgroundColor: getPasswordStrengthColor()
                          }}
                        ></div>
                      </div>
                      <span 
                        className="strength-text"
                        style={{ color: getPasswordStrengthColor() }}
                      >
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Login Error */}
              {errors.login && (
                <div className="form-error form-error--block">{errors.login}</div>
              )}

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
                    <span>{isSignUp ? "Creating Account..." : "Signing In..."}</span>
                  </>
                ) : (
                  <>
                    <span>{isSignUp ? "Create Account" : "Sign In"}</span>
                    <div className="btn-arrow">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                  </>
                )}
              </button>
            </form>

            {/* Form Footer */}
            <div className="form-footer">
              <p className="toggle-text">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}
                <button type="button" className="toggle-btn" onClick={handleToggle}>
                  {isSignUp ? "Sign In" : "Create Account"}
                </button>
              </p>
              
              <div className="admin-cta">
                <span>Are you an admin?</span>
                <Link to="/admin/auth" className="admin-link">
                  Access Admin Panel
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
