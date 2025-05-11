import React from 'react'
import styles from './InterviewPage.module.scss'
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import Agent  from '../components/interview/Agent';
export default function InterviewPage() {
    const { id } = useParams();
    const [interview, setInterview] = React.useState([]);
    useEffect(() => {

        const fetchInterview = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/v1/vapi/interview-list`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                // Find the interview with the matching ID
                const interviewData = data.data.find(interview => interview._id === id);
                setInterview( interviewData);
                console.log('interviewData', interviewData)
            } catch (error) {
                console.error('Error fetching interview:', error);
            }
        };
        fetchInterview();
    }, [id]);
    console.log(interview)
    return (
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.left}>
              <div className={styles.roleSection}>
                <img
                  src='https://th.bing.com/th/id/OIP.ocYAoSkSJTUOpEK3QgoDagHaJn?w=145&h=188&c=7&r=0&o=7&cb=iwp2&dpr=1.3&pid=1.7&rm=3'
                  alt="cover-image"
                  width={40}
                  height={40}
                  className={styles.avatar}
                />
                <h3 className={styles.title}>{interview.role} Interview</h3>
              </div>

            </div>
    
            <p className={styles.tag}>{interview.type}</p>
          </div>
          {interview && (
      <Agent
        userName="gaurav"
        userId="677c0e76dfb3a9a0f34cca7f"
        interviewId={id}
        type="interview"
        questions={interview?.questions}
      />
    )}
  
        </div>
      );
}
