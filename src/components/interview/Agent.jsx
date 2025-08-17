import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { vapi, VAPI_WEB_TOKEN } from "../vapi/vapi.sdk.js";
import "./Agent.scss";
import { interviewer } from "../constants/interviewConstants.js";
import { apiFetch } from "../constants/api";

export default function Agent({
  username,
  userId,
  type,
  questions,
  interviewId,
  role,
  level,
  company,
  jobDescription,
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callStatus, setCallStatus] = useState("INACTIVE");
  const [messages, setMessages] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewStartTime, setInterviewStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState("excellent");
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

  const WORKFLOW_ID = import.meta.env.VITE_VAPI_WORKFLOW_ID;
  const navigate = useNavigate();

  // Timer effect for elapsed time
  useEffect(() => {
    let interval;
    if (callStatus === "ACTIVE" && interviewStartTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - interviewStartTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus, interviewStartTime]);

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus("ACTIVE");
      setInterviewStartTime(Date.now());
    };

    const onCallEnd = () => {
      console.log("Call ended");
      setCallStatus("FINISHED");
    };

    const onMessage = (message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { 
          role: message.role, 
          content: message.transcript,
          timestamp: Date.now()
        };
        setMessages((prev) => [...prev, newMessage]);
        
        // Update question progress for interviewer messages
        if (message.role === "assistant") {
          setCurrentQuestionIndex(prev => Math.min(prev + 1, questions?.length || 0));
        }
      }
    };

    const onSpeechStart = () => {
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      setIsSpeaking(false);
    };

    const onError = (error) => {
      console.error("Error:", error);
      setConnectionQuality("poor");
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, [questions]);

  const handleGenerateFeedback = async (transcriptMessages) => {
    console.log("Generate feedback:");
    setIsGeneratingFeedback(true);
    
    try {
      const res = await apiFetch("/api/v1/vapi/createFeedback", {
        method: "POST",
        body: { interviewId, userId, transcript: transcriptMessages },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        console.log("Feedback generated successfully:", data.id);
        setCallStatus("FINISHED");
        navigate(`/interview/${data.id}/feedback`);
      } else {
        console.error("Error generating feedback:", data.message || "Unknown error");
        navigate("/");
      }
    } catch (error) {
      console.error("Error generating feedback:", error);
      navigate("/");
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  useEffect(() => {
    if (callStatus === "FINISHED") {
      if (type === "generation") {
        navigate("/");
      } else if (messages.length > 0 && !isGeneratingFeedback) {
        console.log("Call finished");
        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, type, userId, isGeneratingFeedback]);

  const handleCall = async () => {
    if (callStatus === "CONNECTING" || callStatus === "ACTIVE") return;

    setCallStatus("CONNECTING");
    setConnectionQuality("good");

    try {
      if (!VAPI_WEB_TOKEN) {
        setCallStatus("INACTIVE");
        console.error("Vapi Web Token missing. Set VITE_VAPI_WEB_TOKEN in frontend/.env");
        return;
      }

      if (type === "generation") {
        if (!WORKFLOW_ID) {
          console.warn("VITE_VAPI_WORKFLOW_ID is not set.");
        }
        const response = await vapi.start(WORKFLOW_ID || "", {
          variableValues: {
            userId: userId,
            username: username,
          },
        });
        console.log("Call started:", response);
      } else {
        const formattedQuestions = questions
          ?.map((question) => `-- ${question}`)
          .join("\n");
        await vapi.start(interviewer, {
          variableValues: {
            questions: formattedQuestions,
            role: role || "",
            level: level || "",
            company: company || "",
            jobDescription: jobDescription || "",
          },
        });
        console.log("formattedQuestions", formattedQuestions);
      }
    } catch (error) {
      setCallStatus("INACTIVE");
      setConnectionQuality("poor");
      console.error("Error starting call:", error);
    }
  };

  const handleDisconnect = async () => {
    try {
      const response = await vapi.stop();
      setCallStatus("FINISHED");
      console.log("Call disconnected:", response);
    } catch (error) {
      console.error("Error disconnecting call:", error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getConnectionIcon = () => {
    switch (connectionQuality) {
      case "excellent": return "📶";
      case "good": return "📶";
      case "poor": return "📵";
      default: return "📶";
    }
  };

  const lastMessage = messages[messages.length - 1];

  return (
    <div className="interview-agent">
      {/* Interview Status Bar */}
      <div className="status-bar">
        <div className="status-info">
          <div className="status-indicator">
            <div className={`status-dot status-dot--${callStatus.toLowerCase()}`}></div>
            <span className="status-text">
              {callStatus === "INACTIVE" && "Ready to Start"}
              {callStatus === "CONNECTING" && "Connecting..."}
              {callStatus === "ACTIVE" && "Interview Active"}
              {callStatus === "FINISHED" && "Interview Complete"}
            </span>
          </div>
          
          {callStatus === "ACTIVE" && (
            <div className="timer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>{formatTime(elapsedTime)}</span>
            </div>
          )}
        </div>

        <div className="connection-info">
          <span className="connection-quality">{getConnectionIcon()}</span>
          {questions && questions.length > 0 && (
            <div className="progress-info">
              <span className="progress-text">
                {currentQuestionIndex}/{questions.length}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Interview Interface */}
      <div className="interview-interface">
        {/* Participants */}
        <div className="participants">
          {/* AI Interviewer */}
          <div className="participant participant--interviewer">
            <div className={`participant-avatar ${isSpeaking ? 'participant-avatar--speaking' : ''}`}>
              <div className="avatar-image">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M12 22S8 18 8 13V6L12 4L16 6V13C16 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              {isSpeaking && (
                <div className="speaking-indicator">
                  <div className="wave"></div>
                  <div className="wave wave--delay-1"></div>
                  <div className="wave wave--delay-2"></div>
                </div>
              )}
            </div>
            <div className="participant-info">
              <h4 className="participant-name">AI Interviewer</h4>
              <p className="participant-role">Professional Interview Assistant</p>
            </div>
            <div className={`mic-status ${isSpeaking ? 'mic-status--active' : ''}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 1C10.3431 1 9 2.34315 9 4V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V4C15 2.34315 13.6569 1 12 1Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M19 10V12C19 16.4183 15.4183 20 11 20M5 10V12C5 16.4183 8.58172 20 13 20M12 20V23M8 23H16" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>

          {/* User */}
          <div className="participant participant--user">
            <div className={`participant-avatar ${callStatus === "ACTIVE" && !isSpeaking ? 'participant-avatar--listening' : ''}`}>
              <div className="avatar-image">
                <div className="avatar-placeholder">
                  {username ? username.charAt(0).toUpperCase() : "U"}
                </div>
              </div>
              {callStatus === "ACTIVE" && !isSpeaking && (
                <div className="listening-indicator">
                  <div className="pulse"></div>
                </div>
              )}
            </div>
            <div className="participant-info">
              <h4 className="participant-name">{username}</h4>
              <p className="participant-role">Interview Candidate</p>
            </div>
            <div className={`mic-status ${callStatus === "ACTIVE" && !isSpeaking ? 'mic-status--active' : ''}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 1C10.3431 1 9 2.34315 9 4V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V4C15 2.34315 13.6569 1 12 1Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M19 10V12C19 16.4183 15.4183 20 11 20M5 10V12C5 16.4183 8.58172 20 13 20M12 20V23M8 23H16" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Transcript Area */}
        {messages.length > 0 && (
          <div className="transcript-section">
            <div className="transcript-header">
              <h4>Live Transcript</h4>
              <div className="transcript-controls">
                <button className="transcript-btn" title="Clear transcript">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M3 6H5H21M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6H19Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="transcript-content">
              {messages.slice(-3).map((message, index) => (
                <div 
                  key={index} 
                  className={`transcript-message transcript-message--${message.role}`}
                >
                  <div className="message-header">
                    <span className="message-sender">
                      {message.role === "assistant" ? "AI Interviewer" : username}
                    </span>
                    <span className="message-time">
                      {new Date(message.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <p className="message-content">{message.content}</p>
                </div>
              ))}
              {lastMessage && (
                <div className="latest-message">
                  <p>{lastMessage.content}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Progress Indicator */}
        {questions && questions.length > 0 && callStatus === "ACTIVE" && (
          <div className="interview-progress">
            <div className="progress-header">
              <span className="progress-label">Interview Progress</span>
              <span className="progress-count">
                Question {currentQuestionIndex} of {questions.length}
              </span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(currentQuestionIndex / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Feedback Generation */}
        {isGeneratingFeedback && (
          <div className="feedback-generation">
            <div className="feedback-content">
              <div className="feedback-spinner">
                <div className="spinner-ring"></div>
              </div>
              <h4>Generating Your Feedback</h4>
              <p>Analyzing your interview performance and preparing detailed insights...</p>
            </div>
          </div>
        )}
      </div>

      {/* Call Controls */}
      <div className="call-controls">
        {callStatus !== "ACTIVE" ? (
          <button
            className={`control-btn control-btn--start ${callStatus === "CONNECTING" ? 'control-btn--connecting' : ''}`}
            onClick={handleCall}
            disabled={!VAPI_WEB_TOKEN || callStatus === "CONNECTING"}
            title={!VAPI_WEB_TOKEN ? "Missing Vapi Web Token. Set VITE_VAPI_WEB_TOKEN in .env" : undefined}
          >
            {callStatus === "CONNECTING" && (
              <div className="connecting-animation">
                <div className="connecting-dot"></div>
                <div className="connecting-dot"></div>
                <div className="connecting-dot"></div>
              </div>
            )}
            <div className="control-icon">
              {callStatus === "INACTIVE" || callStatus === "FINISHED" ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                </svg>
              )}
            </div>
            <span className="control-text">
              {callStatus === "INACTIVE" || callStatus === "FINISHED"
                ? "Start Interview"
                : callStatus === "CONNECTING"
                ? "Connecting..."
                : "..."}
            </span>
          </button>
        ) : (
          <button className="control-btn control-btn--end" onClick={handleDisconnect}>
            <div className="control-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>
              </svg>
            </div>
            <span className="control-text">End Interview</span>
          </button>
        )}

        {/* Additional Controls */}
        {callStatus === "ACTIVE" && (
          <div className="secondary-controls">
            <button className="secondary-btn" title="Mute microphone">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 1C10.3431 1 9 2.34315 9 4V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V4C15 2.34315 13.6569 1 12 1Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
            <button className="secondary-btn" title="Interview settings">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                <path d="M19.4 15A1.65 1.65 0 0 0 21 13.09V10.91A1.65 1.65 0 0 0 19.4 9A1.65 1.65 0 0 1 17.73 6.58L18.77 5.54A1.65 1.65 0 0 0 18.77 3.23L16.77 1.23A1.65 1.65 0 0 0 14.46 1.23L13.42 2.27A1.65 1.65 0 0 1 11 0.6H9A1.65 1.65 0 0 0 6.58 2.27L5.54 1.23A1.65 1.65 0 0 0 3.23 1.23L1.23 3.23A1.65 1.65 0 0 0 1.23 5.54L2.27 6.58A1.65 1.65 0 0 1 0.6 9V11A1.65 1.65 0 0 0 2.27 13.42L1.23 14.46A1.65 1.65 0 0 0 1.23 16.77L3.23 18.77A1.65 1.65 0 0 0 5.54 18.77L6.58 17.73A1.65 1.65 0 0 1 9 19.4H11A1.65 1.65 0 0 0 13.42 17.73L14.46 18.77A1.65 1.65 0 0 0 16.77 18.77L18.77 16.77A1.65 1.65 0 0 0 18.77 14.46L17.73 13.42A1.65 1.65 0 0 1 19.4 11V9A1.65 1.65 0 0 0 17.73 6.58Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
