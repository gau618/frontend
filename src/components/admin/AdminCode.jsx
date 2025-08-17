import React, { useState } from "react";
import { apiFetch } from "../constants/api";
import "./adminCode.scss";

export default function AdminCode() {
  const [form, setForm] = useState({
    role: "",
    level: "Junior",
    type: "technical",
    techstack: "",
    questions: "",
    amount: 5,
    company: "",
    jobDescription: "",
  });
  const [created, setCreated] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeStep, setActiveStep] = useState(1);
  const [previewMode, setPreviewMode] = useState(false);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setCreated(null);
    
    try {
      const body = {
        role: form.role.trim(),
        level: form.level,
        type: form.type,
        techstack: form.techstack
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        questions: form.questions
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        amount: Number(form.amount) || 5,
        company: form.company.trim(),
        jobDescription: form.jobDescription.trim(),
      };
      
      const res = await apiFetch("/api/v1/admin/interviews/code", {
        method: "POST",
        body,
      });
      const data = await res.json().catch(() => ({}));
      
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create code interview");
      }
      
      setCreated(data.data);
      showNotification("Code interview created successfully!", "success");
      
      // Reset form
      setForm({
        role: "",
        level: "Junior",
        type: "technical",
        techstack: "",
        questions: "",
        amount: 5,
        company: "",
        jobDescription: "",
      });
      setActiveStep(1);
      
    } catch (e) {
      setError(e.message || "Failed to create code interview");
      showNotification(e.message || "Failed to create interview", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  const getStepStatus = (stepNumber) => {
    if (stepNumber < activeStep) return "completed";
    if (stepNumber === activeStep) return "active";
    return "pending";
  };

  const getTechStackArray = () => {
    return form.techstack
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);
  };

  const getQuestionsArray = () => {
    return form.questions
      .split("\n")
      .map(s => s.trim())
      .filter(Boolean);
  };

  const isFormValid = () => {
    return form.role.trim() && form.amount > 0;
  };

  const stepConfig = [
    {
      number: 1,
      title: "Interview Details",
      description: "Basic information about the interview",
      fields: ["role", "level", "type", "company"]
    },
    {
      number: 2,
      title: "Technical Setup",
      description: "Technology stack and requirements",
      fields: ["techstack", "amount", "questions"]
    },
    {
      number: 3,
      title: "Job Context",
      description: "Job description and additional context",
      fields: ["jobDescription"]
    }
  ];

  return (
    <div className="admin-code-page">
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

      <div className="admin-code-container">
        {/* Header */}
        <div className="code-header">
          <div className="header-content">
            <div className="header-info">
              <div className="code-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M16 18L22 12L16 6M8 6L2 12L8 18" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div className="header-text">
                <h1 className="code-title">Code Interview Builder</h1>
                <p className="code-subtitle">
                  Create technical coding interviews with custom challenges and assessments
                </p>
              </div>
            </div>

            <div className="header-features">
              <div className="feature-item">
                <div className="feature-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M16 18L22 12L16 6M8 6L2 12L8 18" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <span>Custom Coding Challenges</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <span>Automated Assessment</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <span>Real-time Evaluation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="progress-steps">
          <div className="steps-container">
            {stepConfig.map((step, index) => (
              <div key={step.number} className="step-item">
                <button
                  className={`step-button step-button--${getStepStatus(step.number)}`}
                  onClick={() => setActiveStep(step.number)}
                  disabled={loading}
                >
                  <div className="step-number">
                    {getStepStatus(step.number) === "completed" ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="step-content">
                    <div className="step-title">{step.title}</div>
                    <div className="step-description">{step.description}</div>
                  </div>
                </button>
                {index < stepConfig.length - 1 && (
                  <div className={`step-connector step-connector--${getStepStatus(step.number + 1) !== "pending" ? "active" : "inactive"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="code-content">
          <div className="content-grid">
            {/* Form Section */}
            <div className="form-section">
              <form onSubmit={onSubmit} className="code-form">
                {/* Step 1: Interview Details */}
                {activeStep === 1 && (
                  <div className="form-step">
                    <div className="step-header">
                      <h3>Interview Details</h3>
                      <p>Specify the basic information for your coding interview</p>
                    </div>

                    <div className="form-grid">
                      <div className="form-group form-group--span-2">
                        <label htmlFor="role" className="form-label">
                          Role/Position <span className="required">*</span>
                        </label>
                        <input
                          id="role"
                          type="text"
                          value={form.role}
                          onChange={(e) => handleInputChange("role", e.target.value)}
                          className="form-input"
                          placeholder="e.g. Senior Frontend Developer, Full Stack Engineer"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="level" className="form-label">Experience Level</label>
                        <select
                          id="level"
                          value={form.level}
                          onChange={(e) => handleInputChange("level", e.target.value)}
                          className="form-select"
                        >
                          <option value="Junior">Junior (0-2 years)</option>
                          <option value="Mid">Mid (2-5 years)</option>
                          <option value="Senior">Senior (5+ years)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="type" className="form-label">Interview Type</label>
                        <select
                          id="type"
                          value={form.type}
                          onChange={(e) => handleInputChange("type", e.target.value)}
                          className="form-select"
                        >
                          <option value="technical">Technical Only</option>
                          <option value="behavioral">Behavioral Focus</option>
                          <option value="mixed">Mixed Assessment</option>
                        </select>
                      </div>

                      <div className="form-group form-group--span-2">
                        <label htmlFor="company" className="form-label">Company Name</label>
                        <input
                          id="company"
                          type="text"
                          value={form.company}
                          onChange={(e) => handleInputChange("company", e.target.value)}
                          className="form-input"
                          placeholder="e.g. TechCorp, Startup Inc."
                        />
                      </div>
                    </div>

                    <div className="step-actions">
                      <button
                        type="button"
                        className="btn btn--primary"
                        onClick={() => setActiveStep(2)}
                        disabled={!form.role.trim()}
                      >
                        Next: Technical Setup
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12H19M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Technical Setup */}
                {activeStep === 2 && (
                  <div className="form-step">
                    <div className="step-header">
                      <h3>Technical Configuration</h3>
                      <p>Define the technical requirements and coding challenges</p>
                    </div>

                    <div className="form-grid">
                      <div className="form-group form-group--span-2">
                        <label htmlFor="techstack" className="form-label">
                          Technology Stack
                        </label>
                        <input
                          id="techstack"
                          type="text"
                          value={form.techstack}
                          onChange={(e) => handleInputChange("techstack", e.target.value)}
                          className="form-input"
                          placeholder="e.g. React, Node.js, TypeScript, Python, Java"
                        />
                        <div className="form-hint">
                          Separate multiple technologies with commas
                        </div>
                        {getTechStackArray().length > 0 && (
                          <div className="tech-preview">
                            {getTechStackArray().map((tech, index) => (
                              <span key={index} className="tech-tag">{tech}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="amount" className="form-label">
                          Number of Questions <span className="required">*</span>
                        </label>
                        <input
                          id="amount"
                          type="number"
                          min="1"
                          max="50"
                          value={form.amount}
                          onChange={(e) => handleInputChange("amount", e.target.value)}
                          className="form-input"
                          required
                        />
                        <div className="form-hint">
                          Recommended: 5-10 questions for a comprehensive assessment
                        </div>
                      </div>

                      <div className="form-group form-group--span-2">
                        <label htmlFor="questions" className="form-label">
                          Custom Questions (Optional)
                        </label>
                        <textarea
                          id="questions"
                          rows="6"
                          value={form.questions}
                          onChange={(e) => handleInputChange("questions", e.target.value)}
                          className="form-textarea"
                          placeholder="Enter one question per line:
Implement a function to reverse a linked list
Design a rate limiter for an API
Create a binary search algorithm
Optimize database queries for large datasets"
                        />
                        <div className="form-hint">
                          Leave empty to auto-generate questions based on role and tech stack
                        </div>
                        {getQuestionsArray().length > 0 && (
                          <div className="questions-preview">
                            <div className="preview-header">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1046 21 18 21H17Z" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                              <span>{getQuestionsArray().length} Custom Questions</span>
                            </div>
                            <ul className="questions-list">
                              {getQuestionsArray().slice(0, 3).map((question, index) => (
                                <li key={index}>{question}</li>
                              ))}
                              {getQuestionsArray().length > 3 && (
                                <li className="more-indicator">
                                  +{getQuestionsArray().length - 3} more questions...
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="step-actions">
                      <button
                        type="button"
                        className="btn btn--outline"
                        onClick={() => setActiveStep(1)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        Back
                      </button>
                      <button
                        type="button"
                        className="btn btn--primary"
                        onClick={() => setActiveStep(3)}
                      >
                        Next: Job Context
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12H19M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Job Context */}
                {activeStep === 3 && (
                  <div className="form-step">
                    <div className="step-header">
                      <h3>Job Context & Description</h3>
                      <p>Provide additional context to help generate relevant questions</p>
                    </div>

                    <div className="form-grid">
                      <div className="form-group form-group--span-2">
                        <label htmlFor="jobDescription" className="form-label">
                          Job Description
                        </label>
                        <textarea
                          id="jobDescription"
                          rows="8"
                          value={form.jobDescription}
                          onChange={(e) => handleInputChange("jobDescription", e.target.value)}
                          className="form-textarea"
                          placeholder="Describe the role, responsibilities, and technical requirements:

We are looking for a Senior Frontend Developer to join our team and work on our React-based application. The ideal candidate will have experience with:
- Modern React development (Hooks, Context API)
- State management with Redux or Zustand
- TypeScript for type safety
- Performance optimization techniques
- Testing with Jest and React Testing Library

Responsibilities include building responsive user interfaces, optimizing application performance, and collaborating with backend developers on API integration."
                        />
                        <div className="form-hint">
                          A detailed job description helps generate more relevant and targeted coding questions
                        </div>
                      </div>
                    </div>

                    <div className="step-actions">
                      <button
                        type="button"
                        className="btn btn--outline"
                        onClick={() => setActiveStep(2)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        Back
                      </button>
                      <button
                        type="button"
                        className="btn btn--secondary"
                        onClick={() => setPreviewMode(true)}
                        disabled={!isFormValid()}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        Preview Interview
                      </button>
                      <button
                        type="submit"
                        className="btn btn--success"
                        disabled={loading || !isFormValid()}
                      >
                        {loading ? (
                          <>
                            <div className="loading-spinner">
                              <div className="spinner-ring"></div>
                            </div>
                            Creating Interview...
                          </>
                        ) : (
                          <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M16 18L22 12L16 6M8 6L2 12L8 18" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            Create Code Interview
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Preview Section */}
            <div className="preview-section">
              <div className="preview-header">
                <h3>Interview Preview</h3>
                <div className="preview-controls">
                  <button
                    className={`preview-btn ${!previewMode ? "preview-btn--active" : ""}`}
                    onClick={() => setPreviewMode(false)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V18C2 18.5304 2.21071 19.0391 2.58579 19.4142C2.96086 19.7893 3.46957 20 4 20H16C16.5304 20 17.0391 19.7893 17.4142 19.4142C17.7893 19.0391 18 18.5304 18 18V13" stroke="currentColor" strokeWidth="2"/>
                      <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Edit
                  </button>
                  <button
                    className={`preview-btn ${previewMode ? "preview-btn--active" : ""}`}
                    onClick={() => setPreviewMode(true)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Preview
                  </button>
                </div>
              </div>

              <div className="preview-content">
                {previewMode && isFormValid() ? (
                  <div className="interview-preview">
                    <div className="preview-card">
                      <div className="card-header">
                        <div className="role-info">
                          <h4>{form.role || "Role Name"}</h4>
                          <div className="role-meta">
                            <span className="level-badge">{form.level}</span>
                            <span className="type-badge">{form.type}</span>
                            {form.company && <span className="company-name">{form.company}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="card-stats">
                        <div className="stat-item">
                          <div className="stat-value">{form.amount}</div>
                          <div className="stat-label">Questions</div>
                        </div>
                        <div className="stat-item">
                          <div className="stat-value">{getTechStackArray().length}</div>
                          <div className="stat-label">Technologies</div>
                        </div>
                        <div className="stat-item">
                          <div className="stat-value">{Math.max(form.amount * 5, 30)}</div>
                          <div className="stat-label">Est. Minutes</div>
                        </div>
                      </div>

                      {getTechStackArray().length > 0 && (
                        <div className="card-section">
                          <h5>Technology Stack</h5>
                          <div className="tech-list">
                            {getTechStackArray().map((tech, index) => (
                              <span key={index} className="tech-tag">{tech}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {getQuestionsArray().length > 0 && (
                        <div className="card-section">
                          <h5>Custom Questions ({getQuestionsArray().length})</h5>
                          <ul className="questions-list">
                            {getQuestionsArray().slice(0, 3).map((question, index) => (
                              <li key={index}>{question}</li>
                            ))}
                            {getQuestionsArray().length > 3 && (
                              <li className="more-indicator">
                                +{getQuestionsArray().length - 3} more...
                              </li>
                            )}
                          </ul>
                        </div>
                      )}

                      {form.jobDescription && (
                        <div className="card-section">
                          <h5>Job Description</h5>
                          <p className="job-description">
                            {form.jobDescription.slice(0, 200)}
                            {form.jobDescription.length > 200 && "..."}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="preview-placeholder">
                    <div className="placeholder-icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                        <path d="M16 18L22 12L16 6M8 6L2 12L8 18" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <h4>Interview Preview</h4>
                    <p>Fill out the form to see a preview of your coding interview</p>
                  </div>
                )}
              </div>
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

        {/* Success Result */}
        {created && (
          <div className="success-result">
            <div className="result-header">
              <div className="success-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div className="result-text">
                <h3>Interview Created Successfully!</h3>
                <p>Your coding interview is ready. Share the access code with candidates.</p>
              </div>
            </div>

            <div className="result-content">
              <div className="access-code-section">
                <div className="access-code-header">
                  <h4>Interview Access Code</h4>
                  <button
                    className="copy-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(created.accessCode);
                      showNotification("Access code copied to clipboard!", "success");
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M5 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H13C13.5304 2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4V5" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Copy
                  </button>
                </div>
                <div className="access-code-display">
                  <code className="access-code">{created.accessCode}</code>
                </div>
              </div>

              <div className="result-details">
                <div className="detail-item">
                  <span className="detail-label">Interview ID:</span>
                  <span className="detail-value">{created._id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Created:</span>
                  <span className="detail-value">
                    {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <div className="result-actions">
                <button
                  className="btn btn--outline"
                  onClick={() => {
                    setCreated(null);
                    setActiveStep(1);
                  }}
                >
                  Create Another Interview
                </button>
                <button className="btn btn--primary">
                  View in Analytics
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M18 13V6C18 5.46957 17.7893 4.96086 17.4142 4.58579C17.0391 4.21071 16.5304 4 16 4H8C7.46957 4 6.96086 4.21071 6.58579 4.58579C6.21071 4.96086 6 5.46957 6 6V13" stroke="currentColor" strokeWidth="2"/>
                    <path d="M18 13H6L4 21H20L18 13Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
