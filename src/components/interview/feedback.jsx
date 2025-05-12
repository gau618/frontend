import React from 'react'
import { useEffect, useState } from 'react';
import { useParams,Link } from 'react-router-dom';
import dayjs from 'dayjs';
import './feedback.scss';
export default function Feedback() {
    const { id } = useParams();
    const [feedback, setFeedback] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const response = await fetch(`https://backend-fas4.onrender.com/api/v1/vapi/getFeedback/${id}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setFeedback(data.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchFeedback();
    },[id])
  return (
    <section className="section-feedback">
    <div className="header-row">
      <h1>
        Feedback on the Interview -  Interview
      </h1>
    </div>
  
    <div className="meta-row">
      <div className="meta-item">
        <img src="/star.svg" width={22} height={22} alt="star" />
        <p>
          Overall Impression: <span className="highlight">{feedback?.totalScore}</span>/100
        </p>
      </div>
  
      <div className="meta-item">
        <img src="/calendar.svg" width={22} height={22} alt="calendar" />
        <p>
          {feedback?.createdAt
            ? dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")
            : "N/A"}
        </p>
      </div>
    </div>
  
    <hr />
  
    <p className="final-assessment">{feedback?.finalAssessment}</p>
  
    <div className="breakdown">
      <h2>Breakdown of the Interview:</h2>
      {feedback?.categoryScores?.map((category, index) => (
        <div key={index} className="category-score">
          <p className="category-title">
            {index + 1}. {category.name} ({category.score}/100)
          </p>
          <p className="category-comment">{category.comment}</p>
        </div>
      ))}
    </div>
  
    <div className="feedback-list">
      <h3>Strengths</h3>
      <ul>
        {feedback?.strengths?.map((strength, index) => (
          <li key={index}>{strength}</li>
        ))}
      </ul>
    </div>
  
    <div className="feedback-list">
      <h3>Areas for Improvement</h3>
      <ul>
        {feedback?.areasForImprovement?.map((area, index) => (
          <li key={index}>{area}</li>
        ))}
      </ul>
    </div>
  
    <div className="buttons">
      <button className="btn-secondary">
        <Link to="/" className="btn-link">Back to dashboard</Link>
      </button>
      <button className="btn-primary">
        <Link href={`/interview/${id}`} className="btn-link">Retake Interview</Link>
      </button>
    </div>
  </section>
  
  )
}
