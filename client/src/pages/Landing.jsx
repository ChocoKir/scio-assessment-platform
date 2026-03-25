// client/src/pages/Landing.jsx
/**
 * SCIO_SYSTEM_OS v3.0 - TERMINAL_ENTRY_GATEWAY
 * Developed for: High-Stakes AI Proctoring & Neural Grading
 * Stability: MAXIMUM | Aesthetic: GOD_TIER
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
    const navigate = useNavigate();
    const [mouse, setMouse] = useState({ x: 0, y: 0 });
    const [bootLog, setBootLog] = useState([]);
    const [systemLoad, setSystemLoad] = useState(0);
    const canvasRef = useRef(null);

    // ➲ 1. NEURAL MESH ANIMATION (Canvas-based for performance)
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
                ctx.fillStyle = 'rgba(0, 210, 255, 0.3)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, 1, 0, Math.PI * 2);
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
                        ctx.strokeStyle = `rgba(0, 210, 255, ${1 - dist / 150})`;
                        ctx.lineWidth = 0.5;
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

    // ➲ 2. SYSTEM TELEMETRY & BOOT LOGIC
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
            "[OK] MISSION_READY"
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
        <div className="scio-god-root">
            {/* 🎥 LAYER 0: THE NEURAL MESH (Canvas) */}
            <canvas ref={canvasRef} className="neural-canvas" />

            {/* 🎞️ LAYER 1: DATA-STORM OVERLAY */}
            <div className="data-rain-container">
                {[...Array(12)].map((_, i) => (
                    <div key={i} className="rain-col" style={{ left: `${i * 8}%`, animationDuration: `${2 + i % 3}s` }}>
                        {Array(20).fill('10').join('')}
                    </div>
                ))}
            </div>

            {/* 📟 LAYER 2: SYSTEM ASIDE (Terminal Feed) */}
            <aside className="terminal-feed mono">
                <div className="feed-header orbitron">SYS_LOG_STREAM</div>
                <div className="feed-content">
                    {bootLog.map((log, i) => (
                        <div key={i} className="log-line">{log}</div>
                    ))}
                    <div className="cursor-blink">_</div>
                </div>
                <div className="load-bar-wrap">
                    <div className="load-fill" style={{ width: `${systemLoad}%` }}></div>
                </div>
            </aside>

            {/* 🎯 LAYER 3: INTERACTIVE HUD VIEWPORT */}
            <div className="hud-viewport" style={{ transform: `rotateY(${mouse.x * 0.15}deg) rotateX(${-mouse.y * 0.15}deg)` }}>

                {/* HUD Corners */}
                <div className="hud-corner tl"></div>
                <div className="hud-corner tr"></div>
                <div className="hud-corner bl"></div>
                <div className="hud-corner br"></div>

                <header className="main-header">
                    <div className="sys-ping orbitron">
                        <span className="dot"></span> NODE_ACTIVE // LATENCY: 14MS
                    </div>
                    <div className="logo-glitch-wrap">
                        <h1 className="main-logo orbitron" data-text="SCIO">SCIO</h1>
                        <div className="logo-shadow-glow"></div>
                    </div>
                    <p className="hero-tagline orbitron">AI_PROCTORING_ECOSYSTEM // V3_ULTRA</p>
                </header>

                {/* TACTICAL MISSION PODS */}
                <section className="mission-deck">
                    {[
                        { id: 'MOD_01', title: 'VISION_AI', detail: 'YOLOv8 Real-time Analysis', icon: '👁️' },
                        { id: 'MOD_02', title: 'NEURAL_GRADES', detail: 'Gemini Semantic Logic', icon: '🧠' },
                        { id: 'MOD_03', title: 'LOCKDOWN', detail: 'Focal & Browser Shield', icon: '🔒' }
                    ].map((m) => (
                        <div key={m.id} className="tactical-pod glass-panel">
                            <div className="pod-id mono">{m.id}</div>
                            <div className="pod-icon">{m.icon}</div>
                            <h3 className="orbitron">{m.title}</h3>
                            <p className="mono">{m.detail}</p>
                            <div className="scan-line-v"></div>
                        </div>
                    ))}
                </section>

                {/* COMMAND LAUNCHERS */}
                <div className="command-actions">
                    <button onClick={() => navigate('/login')} className="prime-btn primary orbitron">
                        <div className="btn-glitch-overlay"></div>
                        INITIATE_SESSION
                    </button>
                    <button onClick={() => navigate('/register')} className="prime-btn secondary orbitron">
                        FORGE_NEW_LINK
                    </button>
                </div>

                {/* TECH SPEC OVERLAY */}
                <div className="tech-specs mono">
                    <div className="spec">STK: MERN_UPLINK</div>
                    <div className="spec">INT: GOOGLE_GEMINI</div>
                    <div className="spec">VIS: YOLO_V8_CORE</div>
                </div>
            </div>

            {/* 📟 LIVE TELEMETRY FOOTER */}
            <footer className="god-footer mono">
                <div className="f-item">COORD_X: {mouse.x.toFixed(2)}</div>
                <div className="f-item">COORD_Y: {mouse.y.toFixed(2)}</div>
                <div className="f-item">MEM_USAGE: 42.8GB</div>
                <div className="f-item highlight">CORE_TEMP: NOMINAL</div>
            </footer>

            <style>{`
                /* --- SINGULARITY ABSOLUTE-ZERO CSS CORE --- */
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@300;400;700&family=JetBrains+Mono:wght@100;400&display=swap');

                .scio-god-root {
                    height: 100vh; width: 100vw; background: #000; color: #fff;
                    display: flex; justify-content: center; align-items: center;
                    position: relative; overflow: hidden; perspective: 1500px;
                    font-family: 'Inter', sans-serif;
                }

                .neural-canvas { position: absolute; top: 0; left: 0; z-index: 0; }
                .orbitron { font-family: 'Orbitron', sans-serif; letter-spacing: 2px; }
                .mono { font-family: 'JetBrains Mono', monospace; letter-spacing: 1px; }

                /* DATA RAIN */
                .data-rain-container { position: absolute; inset: 0; pointer-events: none; z-index: 1; opacity: 0.1; }
                .rain-col { position: absolute; top: -200px; color: #00d2ff; writing-mode: vertical-rl; text-orientation: upright; animation: rain linear infinite; }
                @keyframes rain { to { transform: translateY(120vh); } }

                /* TERMINAL FEED */
                .terminal-feed {
                    position: absolute; top: 40px; left: 40px; width: 280px; 
                    background: rgba(0,0,0,0.8); padding: 20px; border-radius: 12px;
                    border: 1px solid rgba(255,255,255,0.05); z-index: 50;
                }
                .feed-header { font-size: 10px; color: #333; margin-bottom: 15px; }
                .log-line { font-size: 11px; color: #00ffa3; margin-bottom: 5px; opacity: 0.8; }
                .cursor-blink { display: inline-block; width: 8px; height: 12px; background: #00d2ff; animation: blink 1s infinite; }
                .load-bar-wrap { width: 100%; height: 2px; background: #111; margin-top: 15px; border-radius: 10px; overflow: hidden; }
                .load-fill { height: 100%; background: #00ffa3; transition: 0.5s; box-shadow: 0 0 10px #00ffa3; }

                /* HUD VIEWPORT */
                .hud-viewport {
                    z-index: 20; width: 95%; maxWidth: 1400px; padding: 100px 50px;
                    text-align: center; transform-style: preserve-3d; transition: transform 0.1s ease-out;
                    position: relative;
                }
                .hud-corner { position: absolute; width: 40px; height: 40px; border: 2px solid #00d2ff; opacity: 0.3; }
                .tl { top: 0; left: 0; border-right: 0; border-bottom: 0; }
                .tr { top: 0; right: 0; border-left: 0; border-bottom: 0; }
                .bl { bottom: 0; left: 0; border-right: 0; border-top: 0; }
                .br { bottom: 0; right: 0; border-left: 0; border-top: 0; }

                /* LOGO & HEADER */
                .sys-ping { font-size: 10px; color: #444; margin-bottom: 20px; }
                .dot { display: inline-block; width: 6px; height: 6px; background: #00ffa3; border-radius: 50%; box-shadow: 0 0 10px #00ffa3; margin-right: 10px; }
                .main-logo { 
                    font-size: clamp(80px, 15vw, 180px); font-weight: 900; letter-spacing: 40px; margin: 0;
                    text-shadow: 0 0 60px rgba(0, 210, 255, 0.4); position: relative;
                }
                .main-logo::before {
                    content: attr(data-text); position: absolute; inset: 0; color: #9d50bb;
                    clip-path: polygon(0 40%, 100% 40%, 100% 60%, 0 60%); animation: glitch 4s infinite; opacity: 0.5;
                }
                .hero-tagline { font-size: 11px; color: #666; letter-spacing: 12px; margin-bottom: 80px; }

                /* MISSION DECK */
                .mission-deck { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; margin-bottom: 100px; }
                .tactical-pod {
                    padding: 50px 30px; border-radius: 0; position: relative; overflow: hidden;
                    transition: 0.5s cubic-bezier(0.19, 1, 0.22, 1); background: rgba(255,255,255,0.01);
                }
                .tactical-pod:hover {
                    background: rgba(0, 210, 255, 0.05); border-color: #00d2ff;
                    transform: translateZ(100px) rotateY(10deg);
                }
                .pod-id { font-size: 10px; color: #222; margin-bottom: 20px; text-align: left; }
                .pod-icon { font-size: 40px; margin-bottom: 15px; }
                .tactical-pod h3 { font-size: 14px; color: #00d2ff; margin-bottom: 8px; }
                .tactical-pod p { font-size: 9px; color: #444; text-transform: uppercase; }
                .scan-line-v { position: absolute; top: -100%; left: 0; width: 100%; height: 50%; background: linear-gradient(transparent, rgba(0,210,255,0.1), transparent); transition: 0s; }
                .tactical-pod:hover .scan-line-v { top: 100%; transition: 1.5s linear infinite; }

                /* BUTTONS */
                .command-actions { display: flex; gap: 40px; justify-content: center; }
                .prime-btn {
                    padding: 25px 80px; font-weight: 900; letter-spacing: 6px; font-size: 14px;
                    border: 1px solid #111; background: transparent; color: #fff; cursor: pointer;
                    position: relative; overflow: hidden; transition: 0.5s;
                }
                .prime-btn.primary { border-color: #00d2ff; }
                .prime-btn:hover { background: #fff; color: #000; transform: translateY(-5px); box-shadow: 0 0 50px rgba(0,210,255,0.3); }

                /* TECH SPECS */
                .tech-specs { position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); display: flex; gap: 30px; font-size: 9px; color: #111; }

                /* FOOTER */
                .god-footer {
                    position: absolute; bottom: 40px; width: 100%; display: flex;
                    justify-content: center; gap: 60px; opacity: 0.3; font-size: 10px;
                }
                .highlight { color: #00ffa3; }

                @keyframes blink { 0%, 100% { opacity: 0; } 50% { opacity: 1; } }
                @keyframes glitch { 0%, 100% { transform: translate(0); } 20% { transform: translate(-5px, 5px); } 40% { transform: translate(5px, -5px); } }
            `}</style>
        </div>
    );
};

export default Landing;