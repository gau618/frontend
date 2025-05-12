import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vapi } from '../vapi/vapi.sdk.js';
import './interview.scss';
import { interviewer } from '../constants/interviewConstants.js';

const apiKey = import.meta.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID;

export default function Agent({ username, userId, type, questions, interviewId }) {
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [callStatus, setCallStatus] = React.useState('INACTIVE');
  const [messages, setMessages] = React.useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus('ACTIVE');
    };

    const onCallEnd = () => {
      console.log('Call ended');
      setCallStatus('FINISHED');
    };

    const onMessage = (message) => {
      if (message.type === 'transcript' && message.transcriptType === 'final') {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => {
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      setIsSpeaking(false);
    };

    const onError = (error) => {
      console.error('Error:', error);

    };

    vapi.on('call-start', onCallStart);
    vapi.on('call-end', onCallEnd);
    vapi.on('message', onMessage);
    vapi.on('speech-start', onSpeechStart);
    vapi.on('speech-end', onSpeechEnd);
    vapi.on('error', onError);

    return () => {
      vapi.off('call-start', onCallStart);
      vapi.off('call-end', onCallEnd);
      vapi.off('message', onMessage);
      vapi.off('speech-start', onSpeechStart);
      vapi.off('speech-end', onSpeechEnd);
      vapi.off('error', onError);
    };
  }, []);

  const handleGenerateFeedback = async (message) => {
    console.log('Generate feedback:');
    const { success, id } = {
      success: true,
      id: 'feedback-id',
    };
    if (success) {
      console.log('Feedback generated successfully:', id);
      setCallStatus('FINISHED');
    } else {
      console.error('Error generating feedback');
      navigate('/');
    }
  };

  useEffect(() => {
    
    if (callStatus === 'FINISHED') {
   
      if (type === 'generation') {
        navigate('/');
      }else if (messages.length > 0) {
        console.log('Call finished');
      handleGenerateFeedback(messages);
    }
    } 
  }, [messages, callStatus, type, userId]);

  const lastMessage = messages[messages.length - 1]?.content;

  const handleCall = async () => {
    if (callStatus === 'CONNECTING' || callStatus === 'ACTIVE') return;

    setCallStatus('CONNECTING');

    try {
      if (type === 'generation') {
        const response = await vapi.start('2e71aa59-c12d-46c4-b4ab-2090b78c882d', {
          variableValues: {
            userId: userId,
            username: username,
          },
        });
        console.log('Call started:', response);
      } else {
        const formattedQuestions = questions
          ?.map((question) => `-- ${question}`)
          .join('\n');
        await vapi.start(interviewer, {
          variableValues: {
            questions: formattedQuestions,
          },
        });
        console.log('formattedQuestions', formattedQuestions);
      }
    } catch (error) {
      setCallStatus('INACTIVE');
      console.error('Error starting call:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      const response = await vapi.stop();
      setCallStatus('FINISHED');
      console.log('Call disconnected:', response);
    } catch (error) {
      console.error('Error disconnecting call:', error);
    }
  };
  return (
    <>
      <div className="call-view">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <img
              src="https://th.bing.com/th/id/OIP.SRYsQ_uZMPeNMcSV_-CXxgHaE8?w=242&h=180&c=7&r=0&o=7&cb=iwp1&dpr=1.3&pid=1.7&rm=3"
              alt="AI profile"
              width={65}
              height={54}
              className="img-avatar"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <img
              src="https://th.bing.com/th/id/R.9890b977a48f4261f49a8c4f128669ef?rik=6TTnHV2skZ0klA&riu=http%3a%2f%2ftbrnewsmedia.com%2fwp-content%2fuploads%2f2018%2f08%2fBureau-Collective-Diversity-of-the-Human-Face-Thumbnail-2.jpg&ehk=Kij1PivJVRSjQq5wCZBtu7nUK%2fQcoXDtkqCK5LTFPFg%3d&risl=&pid=ImgRaw&r=0"
              alt="User profile"
              width={120}
              height={120}
              className="img-user"
            />
            <h3>{username}</h3>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p className="fade-in">{lastMessage}</p>
        
          </div>
          <p style={{color:"white"}}>{callStatus}</p>
        </div>
      )}

      <div className="call-controls">
        {callStatus !== 'ACTIVE' ? (
          <button className="btn-call" onClick={handleCall}>
            {callStatus === 'CONNECTING' && <span className="ping-indicator" />}
            <span className="btn-text">
              {callStatus === 'INACTIVE' || callStatus === 'FINISHED'
                ? 'Call'
                : callStatus === 'CONNECTING'
                ? 'Connecting...'
                : '. . .'}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={handleDisconnect}>
            End
          </button>
        )}
      </div>
    </>
  );
}
