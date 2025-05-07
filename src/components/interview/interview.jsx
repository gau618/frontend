import React from 'react';
import './interview.scss';

export default function Interview() {
    const generateQuestions = async() => {
     try{
        const response = await fetch('https://backend-fas4.onrender.com/api/v1/vapi/gemini', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ level: 'junior', role: 'frontend developer', techstack: 'React, Node.js', type: 'technical', amount: 5 }),
        });
        const data = await response.json();
        console.log(data);
     }catch(e){
        console.log(e);
     }
    };
  return (
    <div className="interview-container">
      {/* Header */}
      <div className="interview-header">
        <div className="logo">PrepWise</div>
        <div className="user-avatar">
          <img src="https://i.pravatar.cc/100" alt="User" />
        </div>
      </div>

      {/* Title */}
      <div className="interview-title">
        <h3>🎯 Frontend Developer Interview</h3>
        <span className="badge">Technical Interview</span>
      </div>

      {/* Interview Panels */}
      <div className="interview-panels">
        <div className="panel ai">
          <div className="avatar-circle">
            <span>🤖</span>
          </div>
          <h4>AI Interviewer</h4>
        </div>
        <div className="panel user">
          <div className="avatar-circle">
            <img src="https://i.pravatar.cc/150?img=3" alt="User" />
          </div>
          <h4>Adrian (You)</h4>
        </div>
      </div>

      {/* Input + Buttons */}
      <div className="input-section">
        <p>
          What job <span className="highlight">experience level</span> are you targeting?
        </p>
        <div className="button-group">
          <button className="repeat">🔁 Repeat</button>
          <button className="leave" onClick={generateQuestions}>❌ Leave Interview</button>
        </div>
      </div>
    </div>
  );
}
