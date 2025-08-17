import React, { useEffect, useMemo, useRef, useState } from "react";
import "./profile.scss";
import { useAuth } from "../auth/AuthContext";
import { apiFetch } from "../constants/api";

export default function Profile() {
  const { user, loading, refreshUser } = useAuth();
  const [me, setMe] = useState(null);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [notification, setNotification] = useState(null);
  const coverInput = useRef(null);
  const avatarInput = useRef(null);
  const resumeInput = useRef(null);
  const [activeSlot, setActiveSlot] = useState(null);

  useEffect(() => {
    if (!loading && user) {
      setMe({
        fullName: user.fullName || "",
        username: user.username || "",
        email: user.email || "",
      });
      fetchResumes();
    }
  }, [loading, user]);

  const fetchResumes = async () => {
    try {
      const res = await apiFetch("/api/v1/resume/mine");
      if (res.ok) {
        const data = await res.json();
        setResumes(data?.data || []);
      }
    } catch (error) {
      showNotification("Failed to fetch resumes", "error");
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const disabled = useMemo(() => !me || saving, [me, saving]);

  const onDetailsSave = async (e) => {
    e.preventDefault();
    if (!me) return;
    setSaving(true);
    try {
      const res = await apiFetch("/api/v1/user/updateUserDetails", {
        method: "POST",
        body: me,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.message || "Update failed");
      await refreshUser();
      showNotification("Profile updated successfully");
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (type, file) => {
    const form = new FormData();
    form.append(type, file);
    const endpoint =
      type === "avatar"
        ? "/api/v1/user/updateAvatar"
        : "/api/v1/user/updateCoverImage";
    const res = await apiFetch(endpoint, { method: "POST", body: form });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body?.message || "Upload failed");
    await refreshUser();
  };

  const onAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      await uploadImage("avatar", file);
      showNotification("Avatar updated successfully");
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  const onCoverChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      await uploadImage("coverImage", file);
      showNotification("Cover image updated successfully");
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  const onResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setUploadProgress(10);
    
    try {
      const form = new FormData();
      form.append("resume", file);
      const endpoint = Number.isInteger(activeSlot)
        ? `/api/v1/resume/slot/${activeSlot}`
        : "/api/v1/resume/upload";
      
      setUploadProgress(50);
      const res = await apiFetch(endpoint, { method: "POST", body: form });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.message || "Upload failed");
      
      setUploadProgress(80);
      await fetchResumes();
      setUploadProgress(100);
      showNotification("Resume uploaded successfully");
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      setBusy(false);
      setUploadProgress(0);
      e.target.value = "";
      setActiveSlot(null);
    }
  };

  const onDeleteResume = async (id) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;
    setBusy(true);
    try {
      const res = await apiFetch(`/api/v1/resume/${id}`, { method: "DELETE" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.message || "Delete failed");
      await fetchResumes();
      showNotification("Resume deleted successfully");
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring spinner-ring--delayed"></div>
          </div>
          <p className="loading-text">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="error-container">
          <div className="error-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <h3>Authentication Required</h3>
          <p>Please log in to access your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
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

      {/* Profile Header */}
      <section className="profile-header">
        <div className="cover-container">
          <div className="cover">
            {user.coverImage ? (
              <img src={user.coverImage} alt="Profile cover" />
            ) : (
              <div className="cover-placeholder">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                  <path d="M4 16L8.586 11.414C9.367 10.633 10.633 10.633 11.414 11.414L16 16M14 14L15.586 12.414C16.367 11.633 17.633 11.633 18.414 12.414L20 14M14 8H14.01M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>Add cover image</span>
              </div>
            )}
            <button
              className="change-cover-btn"
              onClick={() => coverInput.current?.click()}
              disabled={busy}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 4V20M20 12H4" stroke="currentColor" strokeWidth="2"/>
              </svg>
              {user.coverImage ? "Change" : "Add"}
            </button>
          </div>
          
          <div className="avatar-container">
            <div className="avatar">
              {user.avatar ? (
                <img src={user.avatar} alt="Profile avatar" />
              ) : (
                <div className="avatar-placeholder">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                </div>
              )}
            </div>
            <button
              className="change-avatar-btn"
              onClick={() => avatarInput.current?.click()}
              disabled={busy}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 4V20M20 12H4" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="profile-info">
          <h1 className="profile-name">{user.fullName || "Update your profile"}</h1>
          <p className="profile-username">@{user.username}</p>
          <p className="profile-email">{user.email}</p>
        </div>

        {/* Hidden inputs */}
        <input
          ref={coverInput}
          type="file"
          accept="image/*"
          hidden
          onChange={onCoverChange}
        />
        <input
          ref={avatarInput}
          type="file"
          accept="image/*"
          hidden
          onChange={onAvatarChange}
        />
      </section>

      {/* Profile Content */}
      <div className="profile-content">
        {/* Account Settings Card */}
        <div className="profile-card">
          <div className="card-header">
            <div className="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="card-title">
              <h3>Account Information</h3>
              <p>Update your personal details and contact information</p>
            </div>
          </div>

          <form onSubmit={onDetailsSave} className="card-form">
            <div className="form-row form-row--double">
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={me?.fullName || ""}
                  onChange={(e) =>
                    setMe((m) => ({ ...m, fullName: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  value={me?.username || ""}
                  onChange={(e) =>
                    setMe((m) => ({ ...m, username: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={me?.email || ""}
                onChange={(e) => setMe((m) => ({ ...m, email: e.target.value }))}
                required
              />
            </div>

            <div className="form-actions">
              <button className="btn btn--primary" type="submit" disabled={disabled}>
                {saving && (
                  <div className="btn-spinner">
                    <div className="spinner-mini"></div>
                  </div>
                )}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* Resume Management Card */}
        <div className="profile-card">
          <div className="card-header">
            <div className="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1046 21 18 21H17Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="card-title">
              <h3>Resume Management</h3>
              <p>Upload and organize your resumes for targeted interviews</p>
            </div>
          </div>

          {/* Upload Actions */}
          <div className="upload-section">
            <div className="slot-buttons">
              {[0, 1, 2, 3, 4].map((slot) => (
                <button
                  key={slot}
                  className={`slot-btn ${activeSlot === slot ? "slot-btn--active" : ""}`}
                  onClick={() => {
                    setActiveSlot(slot);
                    resumeInput.current?.click();
                  }}
                  disabled={busy}
                >
                  <span className="slot-number">{slot}</span>
                  <span className="slot-label">
                    {resumes.find(r => r.slot === slot) ? "Replace" : "Upload to"}
                  </span>
                </button>
              ))}
            </div>

            <div className="quick-upload">
              <button
                className="btn btn--outline"
                onClick={() => {
                  setActiveSlot(null);
                  resumeInput.current?.click();
                }}
                disabled={busy}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15M17 8L12 3M12 3L7 8M12 3V15" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Quick Upload
              </button>
            </div>

            {/* Upload Progress */}
            {uploadProgress > 0 && (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <span className="progress-text">{uploadProgress}%</span>
              </div>
            )}

            <input
              ref={resumeInput}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              hidden
              onChange={onResumeUpload}
            />
          </div>

          {/* Resume List */}
          <div className="resume-section">
            {resumes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1046 21 18 21H17Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <h4>No resumes uploaded</h4>
                <p>Upload your first resume to get started with personalized interviews</p>
              </div>
            ) : (
              <div className="resume-grid">
                {resumes.map((resume) => (
                  <div className="resume-card" key={resume._id}>
                    <div className="resume-header">
                      <div className="resume-info">
                        <h4 className="resume-name">{resume.originalName}</h4>
                        <div className="resume-meta">
                          <span>{(resume.size / 1024).toFixed(1)} KB</span>
                          <span>•</span>
                          <span>{new Date(resume.createdAt).toLocaleDateString()}</span>
                          {Number.isInteger(resume.slot) && (
                            <>
                              <span>•</span>
                              <span className="resume-slot">Slot {resume.slot}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="resume-actions">
                        {Number.isInteger(resume.slot) && (
                          <button
                            className="action-btn action-btn--replace"
                            onClick={() => {
                              setActiveSlot(resume.slot);
                              resumeInput.current?.click();
                            }}
                            disabled={busy}
                            title="Replace resume"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15M17 8L12 3M12 3L7 8M12 3V15" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </button>
                        )}
                        <button
                          className="action-btn action-btn--delete"
                          onClick={() => onDeleteResume(resume._id)}
                          disabled={busy}
                          title="Delete resume"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Resume Details */}
                    {(resume.skills?.length > 0 || resume.education?.length > 0 || resume.experience?.length > 0) && (
                      <div className="resume-details">
                        {resume.skills?.length > 0 && (
                          <div className="detail-section">
                            <h5>Skills</h5>
                            <div className="skill-tags">
                              {resume.skills.slice(0, 10).map((skill, i) => (
                                <span key={i} className="skill-tag">{skill}</span>
                              ))}
                              {resume.skills.length > 10 && (
                                <span className="skill-tag skill-tag--more">+{resume.skills.length - 10}</span>
                              )}
                            </div>
                          </div>
                        )}

                        {resume.education?.length > 0 && (
                          <div className="detail-section">
                            <h5>Education</h5>
                            <ul className="detail-list">
                              {resume.education.slice(0, 2).map((edu, i) => (
                                <li key={i}>{edu}</li>
                              ))}
                              {resume.education.length > 2 && (
                                <li className="detail-more">+{resume.education.length - 2} more</li>
                              )}
                            </ul>
                          </div>
                        )}

                        {resume.experience?.length > 0 && (
                          <div className="detail-section">
                            <h5>Experience</h5>
                            <ul className="detail-list">
                              {resume.experience.slice(0, 3).map((exp, i) => (
                                <li key={i}>{exp}</li>
                              ))}
                              {resume.experience.length > 3 && (
                                <li className="detail-more">+{resume.experience.length - 3} more</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
