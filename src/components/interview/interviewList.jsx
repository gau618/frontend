import { useEffect } from 'react';
import InterviewCard from './interViewCards';
import React,{useState} from 'react';
export const InterviewList = () => {
      const [interview, setInerview] = useState([]);
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState(null);
   useEffect(() => {
    callApi();
   }, []);
      const callApi = async () => {
        setLoading(true);
        setError(null);
    
        try {
          const response = await fetch('https://backend-fas4.onrender.com/api/v1/vapi/interview-list')
          const result = await response.json();
    
          if (response.ok) {
            setInerview(result.data);
          } else {
            setError(result.message || 'Failed to fetch data');
          }
        } catch (error) {
          setError('Failed to fetch data');
        } finally {
          setLoading(false);
        }
      };
  return (
    <div className="interview-list">
      {interview?.map(interview => (
        <InterviewCard key={interview._id} interview={interview} />
      ))}
    </div>
  );
};
