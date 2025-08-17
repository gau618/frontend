import React from "react";
import "./home.scss";
import { useNavigate } from "react-router-dom";
import { InterviewList } from "../interview/interviewList";
import { useAuth } from "../auth/AuthContext";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      title: "Intelligent Practice Sessions",
      description: "Experience realistic interview scenarios with adaptive questioning that matches your industry and role requirements.",
      action: "Begin Practice",
      path: "/code"
    },
    {
      title: "Resume Analysis & Optimization",
      description: "Upload your resume for personalized question generation and receive insights to strengthen your professional profile.",
      action: "Manage Profile",
      path: "/profile"
    },
    {
      title: "Performance Analytics",
      description: "Access detailed performance metrics with actionable feedback to identify strengths and areas for improvement.",
      action: "View Reports",
      path: "/interview"
    }
  ];

  const testimonials = [
    {
      quote: "The personalized feedback helped me land my dream job at a Fortune 500 company.",
      author: "Sarah Chen",
      role: "Software Engineer"
    },
    {
      quote: "Interview preparation became systematic and effective. Highly recommended for career advancement.",
      author: "Michael Rodriguez",
      role: "Product Manager"
    },
    {
      quote: "The platform's insights were instrumental in improving my communication skills.",
      author: "Priya Sharma",
      role: "Data Scientist"
    }
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero__container">
          <div className="hero__content">
            <div className="hero__badge">
              <span className="badge__indicator"></span>
              Trusted by 50,000+ Professionals
            </div>
            
            <h1 className="hero__title">
              Transform Your Interview Performance
            </h1>
            
            <p className="hero__description">
              Elevate your career with comprehensive interview preparation. 
              Our platform combines intelligent analysis with personalized coaching 
              to maximize your success in competitive job markets.
            </p>

            <div className="hero__metrics">
              <div className="metric">
                <span className="metric__value">95%</span>
                <span className="metric__label">Success Rate</span>
              </div>
              <div className="metric">
                <span className="metric__value">24hrs</span>
                <span className="metric__label">Avg. Prep Time</span>
              </div>
              <div className="metric">
                <span className="metric__value">150+</span>
                <span className="metric__label">Industries</span>
              </div>
            </div>

            <div className="hero__actions">
              <button 
                className="btn btn--primary"
                onClick={() => navigate("/code")}
              >
                Start Your Preparation
              </button>
              
              {user?.role === "admin" ? (
                <button
                  className="btn btn--outline"
                  onClick={() => navigate("/admin")}
                >
                  Access Dashboard
                </button>
              ) : (
                <button
                  className="btn btn--outline"
                  onClick={() => navigate("/profile")}
                >
                  Upload Resume
                </button>
              )}
            </div>
          </div>

          <div className="hero__visual">
            <div className="visual__card visual__card--primary">
              <div className="card__header">
                <div className="card__status"></div>
                <span>Live Session</span>
              </div>
              <div className="card__content">
                <div className="progress__bar">
                  <div className="progress__fill"></div>
                </div>
                <p>Technical Interview in Progress</p>
              </div>
            </div>

            <div className="visual__card visual__card--secondary">
              <div className="card__chart">
                <div className="chart__bar" style={{height: '60%'}}></div>
                <div className="chart__bar" style={{height: '80%'}}></div>
                <div className="chart__bar" style={{height: '45%'}}></div>
                <div className="chart__bar" style={{height: '95%'}}></div>
              </div>
              <p>Performance Analytics</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features__container">
          <div className="section__header">
            <h2 className="section__title">
              Professional Interview Preparation
            </h2>
            <p className="section__subtitle">
              Comprehensive tools designed for career-focused professionals 
              seeking competitive advantages in today's job market.
            </p>
          </div>

          <div className="features__grid">
            {features.map((feature, index) => (
              <div key={index} className="feature__card">
                <div className="feature__number">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <h3 className="feature__title">{feature.title}</h3>
                <p className="feature__description">{feature.description}</p>
                <button 
                  className="feature__action"
                  onClick={() => navigate(feature.path)}
                >
                  {feature.action}
                  <span className="action__arrow">→</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="testimonials__container">
          <h2 className="section__title">Trusted by Industry Leaders</h2>
          
          <div className="testimonials__grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial__card">
                <div className="testimonial__quote">
                  "{testimonial.quote}"
                </div>
                <div className="testimonial__author">
                  <div className="author__avatar">
                    {testimonial.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="author__info">
                    <div className="author__name">{testimonial.author}</div>
                    <div className="author__role">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interview List Component */}
      <InterviewList />
    </div>
  );
}
