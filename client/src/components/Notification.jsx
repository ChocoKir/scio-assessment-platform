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

        // Optional: Trigger a subtle "ping" sound here if you have an asset
        // new Audio('/assets/notif_ping.mp3').play().catch(() => {});

        return () => {
            clearTimeout(timer);
            clearInterval(progressInterval);
        };
    }, [message, onClose]);

    if (!message) return null;

    // 2. Theme System
    const themes = {
        info:    { color: '#5B4FFF', label: 'SYSTEM', icon: '📡' },
        success: { color: '#10b981', label: 'SUCCESS', icon: '✅' },
        warning: { color: '#f59e0b', label: 'WARNING', icon: '⚠️' },
        error:   { color: '#ef4444', label: 'ERROR', icon: '🚨' }
    };

    const active = themes[type] || themes.info;

    return (
        <div className={`notif-wrapper ${type}`}>
            <div className="notif-glow" style={{ background: active.color }}></div>

            <div className="notif-content">
                <div className="notif-header">
                    <span className="notif-label orbitron" style={{ color: active.color }}>
                        {active.icon} {active.label}
                    </span>
                    <button className="notif-close" onClick={onClose}>✕</button>
                </div>
                <div className="notif-message">{message}</div>
            </div>

            {/* Tactical Progress Bar */}
            <div className="notif-progress-track">
                <div
                    className="notif-progress-fill"
                    style={{ width: `${progress}%`, background: active.color }}
                ></div>
            </div>

            <style>{`
                .notif-wrapper {
                    position: fixed;
                    bottom: 40px;
                    left: 40px;
                    width: 380px;
                    background: linear-gradient(135deg, #16213e, #1a1a2e);
                    backdrop-filter: blur(20px) saturate(180%);
                    -webkit-backdrop-filter: blur(20px) saturate(180%);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 16px;
                    z-index: 10000;
                    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
                    padding: 20px;
                    animation: hudSlideIn 0.5s cubic-bezier(0.23, 1, 0.32, 1);
                    overflow: hidden;
                }

                .notif-glow {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 4px;
                    height: 100%;
                    box-shadow: 0 0 20px currentColor;
                }

                .notif-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }

                .notif-label {
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                }

                .notif-message {
                    font-size: 14px;
                    color: #a0a0b0;
                    line-height: 1.5;
                    font-weight: 400;
                }

                .notif-close {
                    background: transparent;
                    border: none;
                    color: #a0a0b0;
                    cursor: pointer;
                    font-size: 14px;
                    transition: 0.2s;
                }
                .notif-close:hover { color: #ffffff; transform: scale(1.2); }

                .notif-progress-track {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 2px;
                    background: rgba(255, 255, 255, 0.03);
                }

                .notif-progress-fill {
                    height: 100%;
                    transition: width 0.05s linear;
                }

                .orbitron { font-family: 'Orbitron', sans-serif; }

                @keyframes hudSlideIn {
                    from { transform: translateX(-100%) skewX(-5deg); opacity: 0; }
                    to { transform: translateX(0) skewX(0); opacity: 1; }
                }

                /* Variant specific glows */
                .error { border-color: rgba(239, 68, 68, 0.2); }
                .success { border-color: rgba(16, 185, 129, 0.2); }
            `}</style>
        </div>
    );
};

export default Notification;