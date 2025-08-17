import React, { useEffect, useState } from "react";
import { apiFetch } from "../constants/api";
import "./adminQuestions.scss";

export default function AdminQuestions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    text: "",
    tags: "",
    category: "general",
    difficulty: "medium",
    rubric: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("/api/v1/admin/questions");
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load questions");
      }
      setItems(data.data || []);
    } catch (e) {
      setError(e.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("/api/v1/admin/questions", {
        method: "POST",
        body: {
          text: form.text.trim(),
          tags: form.tags
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          category: form.category,
          difficulty: form.difficulty,
          rubric: form.rubric.trim(),
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to add question");
      }
      setForm({
        text: "",
        tags: "",
        category: "general",
        difficulty: "medium",
        rubric: "",
      });
      setShowForm(false);
      showNotification("Question added successfully!", "success");
      load();
    } catch (e) {
      setError(e.message || "Failed to add question");
      showNotification(e.message || "Failed to add question", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      "easy": "easy",
      "medium": "medium",
      "hard": "hard"
    };
    return colors[difficulty] || "medium";
  };

  const getCategoryIcon = (category) => {
    const icons = {
      "general": (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1046 21 18 21H17Z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      "frontend": (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M16 18L22 12L16 6M8 6L2 12L8 18" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      "backend": (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
          <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2"/>
          <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      "data": (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 19V6L20 18V8M9 19H20M9 19L2 12L9 5" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    };
    return icons[category] || icons["general"];
  };

  const filteredAndSortedItems = React.useMemo(() => {
    let filtered = items;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.text?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (filterCategory !== "all") {
      filtered = filtered.filter(item => item.category === filterCategory);
    }

    // Apply difficulty filter
    if (filterDifficulty !== "all") {
      filtered = filtered.filter(item => item.difficulty === filterDifficulty);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === "createdAt") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
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
  }, [items, searchQuery, filterCategory, filterDifficulty, sortBy, sortOrder]);

  const stats = React.useMemo(() => {
    const total = items.length;
    const byCategory = items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});
    const byDifficulty = items.reduce((acc, item) => {
      acc[item.difficulty] = (acc[item.difficulty] || 0) + 1;
      return acc;
    }, {});

    return { total, byCategory, byDifficulty };
  }, [items]);

  const getTagsArray = () => {
    return form.tags
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);
  };

  if (loading && items.length === 0) {
    return (
      <div className="questions-page">
        <div className="loading-container">
          <div className="loading-animation">
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-ring spinner-ring--delayed"></div>
              <div className="spinner-ring spinner-ring--more-delayed"></div>
            </div>
          </div>
          <h3 className="loading-title">Loading Question Bank</h3>
          <p className="loading-description">
            Fetching questions and organizing them by categories...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="questions-page">
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

      <div className="questions-container">
        {/* Header */}
        <div className="questions-header">
          <div className="header-content">
            <div className="header-info">
              <div className="questions-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13M12 17H12.01" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div className="header-text">
                <h1 className="questions-title">Question Bank Management</h1>
                <p className="questions-subtitle">
                  Create, organize, and manage interview questions across different categories
                </p>
              </div>
            </div>

            <div className="header-actions">
              <button
                className="btn btn--primary"
                onClick={() => setShowForm(!showForm)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Add New Question
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="stats-overview">
            <div className="stat-card stat-card--primary">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Questions</div>
            </div>

            <div className="categories-stats">
              {Object.entries(stats.byCategory).map(([category, count]) => (
                <div key={category} className="category-stat">
                  <div className="category-icon">
                    {getCategoryIcon(category)}
                  </div>
                  <div className="category-info">
                    <span className="category-count">{count}</span>
                    <span className="category-name">{category}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="difficulty-distribution">
              {Object.entries(stats.byDifficulty).map(([difficulty, count]) => (
                <div key={difficulty} className={`difficulty-stat difficulty-stat--${difficulty}`}>
                  <span className="difficulty-count">{count}</span>
                  <span className="difficulty-name">{difficulty}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Add Question Form */}
        {showForm && (
          <div className="question-form-container">
            <div className="form-header">
              <h3>Add New Question</h3>
              <button
                className="form-close"
                onClick={() => {
                  setShowForm(false);
                  setError("");
                  setForm({
                    text: "",
                    tags: "",
                    category: "general",
                    difficulty: "medium",
                    rubric: "",
                  });
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>

            <form onSubmit={onSubmit} className="question-form">
              <div className="form-grid">
                <div className="form-group form-group--span-2">
                  <label htmlFor="questionText" className="form-label">
                    Question Text <span className="required">*</span>
                  </label>
                  <textarea
                    id="questionText"
                    rows="4"
                    value={form.text}
                    onChange={(e) => handleInputChange("text", e.target.value)}
                    className="form-textarea"
                    placeholder="Enter your interview question here..."
                    required
                  />
                </div>

                <div className="form-group form-group--span-2">
                  <label htmlFor="questionTags" className="form-label">
                    Tags
                  </label>
                  <input
                    id="questionTags"
                    type="text"
                    value={form.tags}
                    onChange={(e) => handleInputChange("tags", e.target.value)}
                    className="form-input"
                    placeholder="e.g. javascript, react, algorithms (comma separated)"
                  />
                  <div className="form-hint">
                    Add relevant tags to help categorize and search for questions
                  </div>
                  {getTagsArray().length > 0 && (
                    <div className="tags-preview">
                      {getTagsArray().map((tag, index) => (
                        <span key={index} className="tag-preview">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="questionCategory" className="form-label">
                    Category
                  </label>
                  <select
                    id="questionCategory"
                    value={form.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    className="form-select"
                  >
                    <option value="general">General</option>
                    <option value="frontend">Frontend</option>
                    <option value="backend">Backend</option>
                    <option value="data">Data & Analytics</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="questionDifficulty" className="form-label">
                    Difficulty Level
                  </label>
                  <select
                    id="questionDifficulty"
                    value={form.difficulty}
                    onChange={(e) => handleInputChange("difficulty", e.target.value)}
                    className="form-select"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="form-group form-group--span-2">
                  <label htmlFor="questionRubric" className="form-label">
                    Scoring Rubric (Optional)
                  </label>
                  <textarea
                    id="questionRubric"
                    rows="3"
                    value={form.rubric}
                    onChange={(e) => handleInputChange("rubric", e.target.value)}
                    className="form-textarea"
                    placeholder="Define how this question should be scored and what makes a good answer..."
                  />
                  <div className="form-hint">
                    Provide guidance on how to evaluate responses to this question
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn--success"
                  disabled={loading || !form.text.trim()}
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner">
                        <div className="spinner-ring"></div>
                      </div>
                      Adding Question...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      Add Question
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters and Search */}
        <div className="questions-controls">
          <div className="controls-section">
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
                  placeholder="Search questions by text, category, or tags..."
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

            <div className="filter-group">
              <label className="filter-label">Category:</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Categories</option>
                <option value="general">General</option>
                <option value="frontend">Frontend</option>
                <option value="backend">Backend</option>
                <option value="data">Data & Analytics</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Difficulty:</label>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Levels</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="results-info">
            <span className="results-text">
              Showing <strong>{filteredAndSortedItems.length}</strong> of <strong>{items.length}</strong> questions
              {searchQuery && (
                <span> matching "<strong>{searchQuery}</strong>"</span>
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

        {/* Questions List */}
        <div className="questions-content">
          <div className="questions-list">
            {filteredAndSortedItems.map((question) => (
              <div key={question._id} className="question-card">
                <div className="question-header">
                  <div className="question-meta">
                    <div className={`category-badge category-badge--${question.category}`}>
                      <div className="category-icon">
                        {getCategoryIcon(question.category)}
                      </div>
                      <span>{question.category}</span>
                    </div>
                    <div className={`difficulty-badge difficulty-badge--${getDifficultyColor(question.difficulty)}`}>
                      {question.difficulty}
                    </div>
                  </div>
                  
                  <div className="question-actions">
                    <button
                      className="action-btn"
                      onClick={() => setSelectedQuestion(question)}
                      title="View details"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>
                    <button
                      className="action-btn"
                      onClick={() => setEditingQuestion(question)}
                      title="Edit question"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V18C2 18.5304 2.21071 19.0391 2.58579 19.4142C2.96086 19.7893 3.46957 20 4 20H16C16.5304 20 17.0391 19.7893 17.4142 19.4142C17.7893 19.0391 18 18.5304 18 18V13" stroke="currentColor" strokeWidth="2"/>
                        <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="question-content">
                  <h4 className="question-text">{question.text}</h4>
                  
                  {question.tags && question.tags.length > 0 && (
                    <div className="question-tags">
                      {question.tags.map((tag, index) => (
                        <span key={index} className="question-tag">{tag}</span>
                      ))}
                    </div>
                  )}

                  {question.rubric && (
                    <div className="question-rubric">
                      <div className="rubric-header">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        <span>Scoring Rubric</span>
                      </div>
                      <p className="rubric-text">{question.rubric}</p>
                    </div>
                  )}
                </div>

                <div className="question-footer">
                  <div className="question-timestamp">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>
                      Added {question.createdAt 
                        ? new Date(question.createdAt).toLocaleDateString()
                        : "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {!loading && filteredAndSortedItems.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13M12 17H12.01" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <h4>No Questions Found</h4>
                <p>
                  {searchQuery || filterCategory !== "all" || filterDifficulty !== "all"
                    ? "No questions match your current filters"
                    : "Start building your question bank by adding your first question"}
                </p>
                {!searchQuery && filterCategory === "all" && filterDifficulty === "all" && (
                  <button
                    className="btn btn--primary"
                    onClick={() => setShowForm(true)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Add Your First Question
                  </button>
                )}
              </div>
            )}
          </div>
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

      {/* Question Detail Modal */}
      {selectedQuestion && (
        <div className="question-modal" onClick={() => setSelectedQuestion(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Question Details</h3>
              <button 
                className="modal-close"
                onClick={() => setSelectedQuestion(null)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="question-detail">
                <div className="detail-header">
                  <div className={`category-badge category-badge--${selectedQuestion.category}`}>
                    <div className="category-icon">
                      {getCategoryIcon(selectedQuestion.category)}
                    </div>
                    <span>{selectedQuestion.category}</span>
                  </div>
                  <div className={`difficulty-badge difficulty-badge--${getDifficultyColor(selectedQuestion.difficulty)}`}>
                    {selectedQuestion.difficulty}
                  </div>
                </div>

                <div className="detail-content">
                  <h4>Question</h4>
                  <p className="question-text-full">{selectedQuestion.text}</p>

                  {selectedQuestion.tags && selectedQuestion.tags.length > 0 && (
                    <div className="detail-section">
                      <h5>Tags</h5>
                      <div className="question-tags">
                        {selectedQuestion.tags.map((tag, index) => (
                          <span key={index} className="question-tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedQuestion.rubric && (
                    <div className="detail-section">
                      <h5>Scoring Rubric</h5>
                      <p className="rubric-text-full">{selectedQuestion.rubric}</p>
                    </div>
                  )}

                  <div className="detail-section">
                    <h5>Created</h5>
                    <p>
                      {selectedQuestion.createdAt 
                        ? new Date(selectedQuestion.createdAt).toLocaleString()
                        : "Unknown"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
