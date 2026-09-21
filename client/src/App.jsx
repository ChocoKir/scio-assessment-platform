// client/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

// --- Tactical Page Imports ---
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateQuiz from './pages/CreateQuiz';
import TakeQuiz from './pages/TakeQuiz';
import Analytics from './pages/Analytics';

function App() {
    const [isBooting, setIsBooting] = useState(true);
    const [bootLog, setBootLog] = useState('INITIALIZING_BOOT_SEQUENCE...');

    useEffect(() => {
        // --- System BIOS Emulation ---
        const logs = [
            'Initializing system...',
            'Connecting to database...',
            'Loading AI components...',
            'Preparing assessment engine...',
            'SYSTEM_CHECK_NOMINAL_100%'
        ];

        let logIndex = 0;
        const logInterval = setInterval(() => {
            if (logIndex < logs.length) {
                setBootLog(logs[logIndex]);
                logIndex++;
            }
        }, 400);

        const timer = setTimeout(() => {
            setIsBooting(false);
            clearInterval(logInterval);
        }, 2600);

        return () => {
            clearTimeout(timer);
            clearInterval(logInterval);
        };
    }, []);

    if (isBooting) {
        return (
            <div className="bios-screen">
                <div className="bios-content">
                    <div className="bios-header orbitron">SCIO_SYSTEM_OS v3.0</div>
                    <div className="bios-main">
                        <div className="bios-logo orbitron">SCIO<span className="blink">_</span></div>
                        <div className="bios-loader">
                            <div className="bios-bar"></div>
                        </div>
                        <div className="bios-log orbitron">{bootLog}</div>
                    </div>
                    <div className="bios-footer orbitron">© 2026_SINGULARITY_RESOURCES</div>
                </div>
                <style>{`
                    .bios-screen {
                        height: 100vh; background: #000; display: flex; 
                        justify-content: center; align-items: center; 
                        color: #00d2ff; font-family: 'Orbitron', sans-serif;
                    }
                    .bios-content { width: 400px; text-align: center; }
                    .bios-header { font-size: 10px; color: #111; letter-spacing: 5px; margin-bottom: 50px; }
                    .bios-logo { font-size: 50px; letter-spacing: 20px; margin-bottom: 20px; font-weight: 900; text-shadow: 0 0 20px #00d2ff44; }
                    .bios-loader { width: 100%; height: 2px; background: #080808; position: relative; overflow: hidden; border-radius: 10px; }
                    .bios-bar { width: 80px; height: 100%; background: #00d2ff; position: absolute; animation: load 2.6s linear forwards; box-shadow: 0 0 15px #00d2ff; }
                    .bios-log { margin-top: 20px; font-size: 10px; color: #444; letter-spacing: 2px; height: 12px; }
                    .bios-footer { margin-top: 60px; font-size: 8px; color: #080808; letter-spacing: 2px; }
                    .blink { animation: blink 0.8s infinite; }
                    @keyframes load { 0% { left: -80px; width: 10%; } 50% { width: 40%; } 100% { left: 400px; width: 100%; } }
                    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
                `}</style>
            </div>
        );
    }

    return (
        <div className="singularity-kernel">
            <Router>
                <Routes>
                    {/* --- SYSTEM_ROOT --- */}
                    <Route path="/" element={<Landing />} />

                    {/* --- AUTH_MODULES --- */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* --- CORE_COMMAND --- */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/create-quiz" element={<CreateQuiz />} />

                    {/* --- MISSION_UPLINK --- */}
                    <Route path="/take-quiz/:quizId" element={<TakeQuiz />} />

                    {/* --- INTEL_HUB --- */}
                    <Route path="/analytics/:quizId" element={<Analytics />} />

                    {/* --- REDIRECT_PROTOCOL --- */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Router>

            <style>{`
                .singularity-kernel {
                    animation: sysEnter 1.2s cubic-bezier(0.16, 1, 0.3, 1);
                    position: relative;
                    font-family: 'Inter', sans-serif;
                    background: #fafafa;
                }
                
                @keyframes sysEnter {
                    from { opacity: 0; filter: blur(20px) contrast(1.5); transform: scale(1.05); }
                    to { opacity: 1; filter: blur(0) contrast(1); transform: scale(1); }
                }

                .orbitron { font-family: 'Orbitron', sans-serif; }
                
                /* Global Input Refinement with Design System */
                input, textarea, select {
                    transition: border-color 0.4s, box-shadow 0.4s, transform 0.2s;
                    background: #ffffff;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    padding: 14px 16px;
                    font-family: 'Inter', sans-serif;
                    font-weight: 500;
                    color: #1a1a2e;
                }
                input:focus, textarea:focus, select:focus {
                    border-color: #5B4FFF;
                    box-shadow: 0 0 0 3px rgba(91, 79, 255, 0.1);
                    transform: translateY(-1px);
                    outline: none;
                }
                
                /* Global Button Styles */
                button {
                    font-family: 'Inter', sans-serif;
                    font-weight: 600;
                    letter-spacing: 1px;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                /* Global Typography */
                h1, h2, h3, h4, h5, h6 {
                    font-family: 'Inter', sans-serif;
                    font-weight: 700;
                    color: #1a1a2e;
                }
                
                p, span, div {
                    font-family: 'Inter', sans-serif;
                }
            `}</style>
        </div>
    );
}

export default App;