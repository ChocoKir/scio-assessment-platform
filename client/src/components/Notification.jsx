// client/src/components/Notification.jsx
import React, { useEffect, useState } from 'react';

const Notification = ({ message, type = 'info', onClose }) => {
    const [progress, setProgress] = useState(100);

    // 1. Lifecycle: Auto-dismiss & Progress Countdown
    useEffect(() => {
        if (!message) return;

        // Reset progress on new message
        setProgress(100);

        const duration = 5000; // 5 seconds
        const intervalTime = 50;
        const step = (intervalTime / duration) * 100;

        const timer = setTimeout(() => {
            onClose();
        }, duration);

        const progressInterval = setInterval(() => {
            setProgress((prev) => Math.max(prev - step, 0));
        }, intervalTime);

        return () => {
            clearTimeout(timer);
            clearInterval(progressInterval);
        };
    }, [message, onClose]);

    if (!message) return null;

    // 2. EduX Light Theme System
    const themes = {
        info:    { color: '#5B4FFF', label: 'SYSTEM MESSAGE' },
        success: { color: '#10b981', label: 'SUCCESS' },
        warning: { color: '#f59e0b', label: 'WARNING' },
        error:   { color: '#ef4444', label: 'ERROR' }
    };

    const active = themes[type] || themes.info;

    return (
        <div className="EduX-notification">
            {/* Bold Left Accent Line */}
            <div className="notif-accent" style={{ backgroundColor: active.color }}></div>

            <div className="notif-content">
                <div className="notif-header">
                    <span className="notif-label" style={{ color: active.color }}>
                        {active.label}
                    </span>
                    <button className="notif-close" onClick={onClose}>✕</button>
                </div>
                <div className="notif-message">{message}</div>
            </div>

            {/* Subtle Progress Bar */}
            <div className="notif-progress-track">
                <div
                    className="notif-progress-fill"
                    style={{ width: `${progress}%`, backgroundColor: active.color }}
                ></div>
            </div>

            {/* NOTE: If you prefer keeping CSS in a separate file (like we did with TakeQuiz.css), 
              you can cut this <style> block and move it to a Notification.css file! 
            */}
            <style>{`
                .EduX-notification {
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    width: 380px;
                    background: #ffffff;
                    border: 1px solid #e5e7eb;
                    border-radius: 4px;
                    z-index: 10000;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
                    display: flex;
                    flex-direction: column;
                    animation: slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    overflow: hidden;
                    font-family: 'Inter', -apple-system, sans-serif;
                }

                .notif-accent {
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 4px;
                }

                .notif-content {
                    padding: 20px 20px 20px 24px; /* Extra left padding to offset the accent line */
                }

                .notif-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }

                .notif-label {
                    font-size: 10px;
                    font-weight: 800;
                    letter-spacing: 1.5px;
                    text-transform: uppercase;
                }

                .notif-message {
                    font-size: 14px;
                    color: #6b7280;
                    line-height: 1.5;
                    font-weight: 500;
                }

                .notif-close {
                    background: transparent;
                    border: none;
                    color: #9ca3af;
                    cursor: pointer;
                    font-size: 14px;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: color 0.2s;
                }

                .notif-close:hover {
                    color: #1a1a2e;
                }

                .notif-progress-track {
                    width: 100%;
                    height: 3px;
                    background: #f3f4f6;
                    margin-top: auto;
                }

                .notif-progress-fill {
                    height: 100%;
                    transition: width 0.05s linear;
                }

                @keyframes slideUpFade {
                    from { 
                        transform: translateY(20px); 
                        opacity: 0; 
                    }
                    to { 
                        transform: translateY(0); 
                        opacity: 1; 
                    }
                }

                /* Mobile Responsiveness */
                @media (max-width: 600px) {
                    .EduX-notification {
                        bottom: 20px;
                        right: 20px;
                        left: 20px;
                        width: auto; /* Stretches to fill mobile screen */
                    }
                }
            `}</style>
        </div>
    );
};

export default Notification;