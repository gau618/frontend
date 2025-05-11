import React from 'react';
import './home.scss';
import { useNavigate } from 'react-router-dom';
import { InterviewList } from '../interview/interviewList';
export default function Home() {
    const navigate = useNavigate();
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero__content">
          <h1>Welcome to MyApp</h1>
          <p>Your all-in-one platform to manage, explore, and grow.</p>
          <button>Get Started</button>
        </div>
      </section>

      {/* Card Section */}
      <section className="cards">
        <h2 className="cards__title">Features</h2>
        <div className="card-grid">
          <div className="card">
            <h3>Dashboard</h3>
            <p>Track everything in one place with real-time updates.</p>
            <button onClick={()=>{navigate('/interview')}}>Call</button>
          </div>
          <div className="card">
            <h3>Analytics</h3>
            <p>Gain insights with rich data visualization tools.</p>
            <button>Call</button>
          </div>
          <div className="card">
            <h3>Team Collaboration</h3>
            <p>Work together efficiently with shared access and tasks.</p>
            <button>Call</button>
          </div>
          <div className="card">
            <h3>Security</h3>
            <p>Built-in security to keep your data safe and private.</p>
            <button>Call</button>
          </div>
        </div>
      </section>
      <InterviewList/>
    </div>
  );
}
