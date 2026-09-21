// client/src/pages/Landing.jsx
/**
 * EduX_SYSTEM_OS v3.0 - TERMINAL_ENTRY_GATEWAY
 * Developed for: High-Stakes AI Proctoring & Neural Grading
 * Aesthetic Re-imagined: Enterprise Clean / Light SaaS
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
    const navigate = useNavigate();
    const [mouse, setMouse] = useState({ x: 0, y: 0 });
    const [bootLog, setBootLog] = useState([]);
    const [systemLoad, setSystemLoad] = useState(0);
    const canvasRef = useRef(null);

    // ➲ 1. NEURAL MESH ANIMATION (Preserved, colors adapted for light theme)
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationFrame;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = (Math.random() - 0.5) * 0.5;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x > canvas.width) this.x = 0;
                if (this.x < 0) this.x = canvas.width;
                if (this.y > canvas.height) this.y = 0;
                if (this.y < 0) this.y = canvas.height;
            }
            draw() {
                ctx.fillStyle = 'rgba(91, 79, 255, 0.2)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const init = () => {
            particles = [];
            for (let i = 0; i < 100; i++) particles.push(new Particle());
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            // Connect lines
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    let dx = particles[a].x - particles[b].x;
                    let dy = particles[a].y - particles[b].y;
                    let dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        ctx.strokeStyle = `rgba(91, 79, 255, ${(1 - dist / 150) * 0.15})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
            animationFrame = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resize);
        resize();
        init();
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrame);
        };
    }, []);

    // ➲ 2. SYSTEM TELEMETRY & BOOT LOGIC (Completely preserved)
    useEffect(() => {
        const handleMove = (e) => {
            setMouse({
                x: (e.clientX / window.innerWidth - 0.5) * 40,
                y: (e.clientY / window.innerHeight - 0.5) * 40
            });
        };
        window.addEventListener('mousemove', handleMove);

        const logs = [
            "[OK] MOUNTING_NEURAL_CORE",
            "[OK] SYNCING_YOLO_V8_SENSORS",
            "[OK] ESTABLISHING_GEMINI_UPLINK",
            "[OK] ENCRYPTING_DATA_RAIN",
            "[!] NEURAL_LINK_STABLE",
            "[OK] SYSTEM_READY"
        ];

        let currentLog = 0;
        const logInterval = setInterval(() => {
            if (currentLog < logs.length) {
                setBootLog(prev => [...prev, logs[currentLog]]);
                currentLog++;
                setSystemLoad(prev => prev + 16);
            } else {
                setSystemLoad(100);
                clearInterval(logInterval);
            }
        }, 600);

        return () => {
            window.removeEventListener('mousemove', handleMove);
            clearInterval(logInterval);
        };
    }, []);

    return (
        <div className="EduX-saas-root">
            {/* LAYER 0: NEURAL MESH */}
            <canvas ref={canvasRef} className="neural-canvas" />

            {/* TOP BAR */}
            <header className="EduX-topbar">
                <div className="brand-lockup">
                    <div className="sys-ping mono">
                        <span className="dot"></span> NODE_ACTIVE
                    </div>
                </div>
                <div className="tech-specs mono">
                    <span>MERN_UPLINK</span>
                    <span>GOOGLE_GEMINI</span>
                    <span>YOLO_V8_CORE</span>
                </div>
            </header>

            {/* MAIN CONTENT SPLIT */}
            <main className="hero-split">
                
                {/* LEFT: CONTENT & ACTIONS */}
                <div className="hero-content">
                    <span className="badge mono">V3_ULTRA</span>
                    
                    <h1 className="hero-title">
                        <span className="text-dark">EduX</span><br/>
                        <span className="text-blue italic">Ecosystem.</span>
                    </h1>
                    
                    <p className="hero-desc">
                        High-Stakes AI Proctoring & Neural Grading. Ensure total academic integrity with real-time computer vision and advanced heuristic analysis.
                    </p>
                    
                    <div className="action-group">
                        <button onClick={() => navigate('/login')} className="btn-primary mono">
                            INITIATE_SESSION
                        </button>
                        <button onClick={() => navigate('/register')} className="btn-secondary mono">
                            FORGE_NEW_LINK
                        </button>
                    </div>

                    {/* FEATURE PODS STYLED AS STATS/CARDS */}
                    <div className="feature-grid">
                        {[
                            { id: 'MOD_01', title: 'AI_VISION', detail: 'Real-time Analysis' },
                            { id: 'MOD_02', title: 'SMART_GRADING', detail: 'AI-powered Assessment' },
                            { id: 'MOD_03', title: 'LOCKDOWN', detail: 'Focal & Browser Shield' }
                        ].map((m) => (
                            <div key={m.id} className="feature-card">
                                <div className="fc-id mono">{m.id}</div>
                                <h3>{m.title}</h3>
                                <p>{m.detail}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT: 3D TERMINAL (Preserving your interactive tilt) */}
                <div className="hero-visual" style={{ transform: `rotateY(${mouse.x * 0.15}deg) rotateX(${-mouse.y * 0.15}deg)` }}>
                    <div className="glass-terminal">
                        <div className="term-header">
                            <div className="window-controls">
                                <span></span><span></span><span></span>
                            </div>
                            <div className="term-title mono">SYS_LOG_STREAM</div>
                        </div>
                        
                        <div className="term-body mono">
                            {bootLog.map((log, i) => (
                                <div key={i} className="log-line">{log}</div>
                            ))}
                            <div className="cursor-blink">_</div>
                        </div>
                        
                        <div className="load-bar-wrap">
                            <div className="load-fill" style={{ width: `${systemLoad}%` }}></div>
                        </div>
                    </div>
                </div>
            </main>

            {/* LIVE TELEMETRY FOOTER */}
            <footer className="telemetry-footer mono">
                <div>COORD_X: {mouse.x.toFixed(2)}</div>
                <div>COORD_Y: {mouse.y.toFixed(2)}</div>
                <div>MEM_USAGE: 42.8GB</div>
                <div className="highlight">CORE_TEMP: NOMINAL</div>
            </footer>

            <style>{`
                /* --- EduX V3 LIGHT SAAS CSS --- */
                @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,700;0,900;1,800;1,900&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;700&display=swap');

                .EduX-saas-root {
                    min-height: 100vh; width: 100vw; background-color: #f8fafc;
                    background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
                    background-size: 32px 32px; font-family: 'Inter', sans-serif;
                    position: relative; overflow: hidden; color: #0f172a;
                    display: flex; flex-direction: column; justify-content: center;
                }

                .neural-canvas { position: absolute; top: 0; left: 0; z-index: 0; pointer-events: none; }
                .mono { font-family: 'JetBrains Mono', monospace; }

                /* TOP BAR */
                .EduX-topbar {
                    position: absolute; top: 0; width: 100%; padding: 30px 60px;
                    display: flex; justify-content: space-between; align-items: center; z-index: 10;
                }
                .sys-ping { font-size: 11px; color: #64748b; font-weight: 700; display: flex; align-items: center; gap: 8px;}
                .dot { display: inline-block; width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 8px rgba(16, 185, 129, 0.4); }
                .tech-specs { display: flex; gap: 20px; font-size: 10px; color: #94a3b8; font-weight: 700; }
                .tech-specs span { background: #ffffff; padding: 6px 12px; border-radius: 4px; border: 1px solid #e2e8f0; }

                /* LAYOUT SPLIT */
                .hero-split {
                    position: relative; z-index: 10; display: flex; width: 100%;
                    max-width: 1300px; margin: 0 auto; gap: 60px; align-items: center;
                    padding: 0 40px;
                }
                
                /* LEFT CONTENT */
                .hero-content { flex: 1; max-width: 600px; }
                .badge {
                    display: inline-block; background: #e0e7ff; color: #5B4FFF; font-size: 11px;
                    font-weight: 700; padding: 6px 12px; border-radius: 4px; margin-bottom: 24px;
                }
                .hero-title { font-family: 'Montserrat', sans-serif; font-size: clamp(50px, 5vw, 85px); line-height: 1; margin: 0 0 20px 0; letter-spacing: -2px; }
                .text-dark { color: #0f172a; font-weight: 900; }
                .text-blue { color: #5B4FFF; font-weight: 900; font-style: italic; }
                .hero-desc { font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 40px; }
                
                /* BUTTONS */
                .action-group { display: flex; gap: 16px; margin-bottom: 60px; }
                .btn-primary {
                    background: #5B4FFF; color: #ffffff; border: none; padding: 16px 32px;
                    font-size: 12px; font-weight: 700; border-radius: 8px; cursor: pointer; transition: 0.3s;
                    box-shadow: 0 10px 20px rgba(91, 79, 255, 0.2);
                }
                .btn-primary:hover { background: #4a3ee0; transform: translateY(-2px); }
                .btn-secondary {
                    background: #ffffff; color: #0f172a; border: 1px solid #cbd5e1; padding: 16px 32px;
                    font-size: 12px; font-weight: 700; border-radius: 8px; cursor: pointer; transition: 0.3s;
                }
                .btn-secondary:hover { border-color: #94a3b8; background: #f1f5f9; transform: translateY(-2px); }

                /* FEATURE CARDS (Redesigned Pods) */
                .feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
                .feature-card {
                    background: #ffffff; border: 1px solid #e2e8f0; padding: 24px 20px;
                    border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    transition: 0.3s;
                }
                .feature-card:hover { transform: translateY(-5px); border-color: #5B4FFF; box-shadow: 0 10px 15px -3px rgba(91, 79, 255, 0.1); }
                .fc-id { font-size: 10px; color: #5B4FFF; margin-bottom: 12px; font-weight: 700; }
                .feature-card h3 { font-size: 14px; font-weight: 600; color: #0f172a; margin: 0 0 6px 0; }
                .feature-card p { font-size: 11px; color: #64748b; margin: 0; line-height: 1.4; }

                /* RIGHT VISUAL (3D Terminal) */
                .hero-visual {
                    flex: 1; perspective: 1200px; display: flex; justify-content: flex-end;
                    transition: transform 0.1s ease-out; transform-style: preserve-3d;
                }
                .glass-terminal {
                    background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(20px);
                    border: 1px solid rgba(255,255,255,0.1); border-radius: 16px;
                    width: 100%; max-width: 500px; overflow: hidden;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                }
                .term-header {
                    background: rgba(255,255,255,0.05); padding: 16px 20px; display: flex;
                    align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                .window-controls { display: flex; gap: 6px; margin-right: 20px; }
                .window-controls span { width: 10px; height: 10px; border-radius: 50%; background: #475569; }
                .window-controls span:nth-child(1) { background: #ef4444; }
                .window-controls span:nth-child(2) { background: #f59e0b; }
                .window-controls span:nth-child(3) { background: #10b981; }
                
                .term-title { font-size: 10px; color: #94a3b8; }
                
                .term-body { padding: 30px; min-height: 250px; }
                .log-line { font-size: 12px; color: #10b981; margin-bottom: 10px; opacity: 0.9; }
                .cursor-blink { display: inline-block; width: 8px; height: 14px; background: #5B4FFF; animation: blink 1s infinite; vertical-align: middle; }
                
                .load-bar-wrap { width: 100%; height: 3px; background: rgba(255,255,255,0.1); }
                .load-fill { height: 100%; background: #5B4FFF; transition: width 0.5s ease-out; box-shadow: 0 0 10px rgba(91,79,255,0.5); }

                /* TELEMETRY FOOTER */
                .telemetry-footer {
                    position: absolute; bottom: 30px; width: 100%; display: flex;
                    justify-content: center; gap: 40px; font-size: 10px; color: #94a3b8; z-index: 10;
                }
                .telemetry-footer .highlight { color: #10b981; font-weight: 700; }

                @keyframes blink { 0%, 100% { opacity: 0; } 50% { opacity: 1; } }
            `}</style>
        </div>
    );
};

export default Landing;