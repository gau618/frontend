import React from "react";
import './interview.scss';
import { useNavigate } from "react-router-dom";
const InterviewCard = ({ interview }) => {
    const navigate = useNavigate();
    return (
      <div className="interview-card">
        <h2 className="role">{interview.role}</h2>
        <p><strong>Type:</strong> {interview.type}</p>
        <p><strong>Level:</strong> {interview.level}</p>
        <p><strong>Tech Stack:</strong> {interview.techstack.join(', ')}</p>
        <p><strong>Total Questions:</strong> {interview.questions.length}</p>
  
        <details>
          <summary>View Sample Questions</summary>
          <ul>
            {interview.questions.slice(0, 3).map((q, idx) => (
              <li key={idx}>{q}</li>
            ))}
          </ul>
        </details>

        <button onClick={()=>(navigate(`/interviewPage/${interview._id}`))} >Start</button>
      </div>
    );
  };
  
  export default InterviewCard;
