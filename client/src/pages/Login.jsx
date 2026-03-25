import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Notification from '../components/Notification'; // ➲ HUD Integration

const Login = () => {
    // --- STATE CORE ---
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [notify, setNotify] = useState({ message: '', type: '' });

    const navigate = useNavigate();

    // ➲ UPGRADE: Auto-redirect if already logged in
    useEffect(() => {
        const storedUser = localStorage.getItem('scio_user');
        if (storedUser) {
            navigate('/dashboard');
        }
    }, [navigate]);

    // --- UPLINK HANDLER ---
    const handleLogin = async (e) => {
        e.preventDefault();
        setNotify({ message: '', type: '' });
        setIsLoading(true);

        try {
            // Your exact backend route and payload
            const response = await fetch('http://localhost:5000/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // 🟢 ACCESS GRANTED
                localStorage.setItem('scio_user', JSON.stringify(data));
                setNotify({ message: 'IDENTITY_VERIFIED: Neural link established.', type: 'success' });
                setTimeout(() => navigate('/dashboard'), 1500);
            } else {
                // 🔴 ACCESS DENIED
                setNotify({ message: data.message || 'ACCESS_DENIED: Invalid Credentials', type: 'error' });
            }
        } catch (err) {
            setNotify({ message: 'LINK_FAILURE: Neural core unreachable.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-root">
            <div className="scanline"></div>

            {/* 🌑 TERMINAL MODULE */}
            <div className="terminal-card glass-panel">
                <header style={{ marginBottom: '40px' }}>
                    <h1 className="orbitron title pulse">SCIO<span className="accent">AI</span></h1>
                    <p className="orbitron subtitle">AUTHENTICATION_PROTOCOL_V3</p>
                </header>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>

                    {/* AGENT EMAIL INPUT */}
                    <div className="input-field">
                        <label className="orbitron">IDENTIFIER_EMAIL</label>
                        <input
                            type="email"
                            className="terminal-input mono"
                            placeholder="agent@scio.io"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    {/* ENCRYPTION KEY INPUT */}
                    <div className="input-field">
                        <label className="orbitron">ACCESS_KEY</label>
                        <input
                            type="password"
                            className="terminal-input mono"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    {/* LAUNCH TRIGGER */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`initiate-btn orbitron ${isLoading ? 'loading' : ''}`}
                    >
                        {isLoading ? 'DECRYPTING...' : 'INITIATE_SESSION'}
                    </button>
                </form>

                <div className="footer-links orbitron">
                    <p>Unregistered Entity? <Link to="/register" className="forge-link">Forge New Link</Link></p>
                </div>
            </div>

            {/* ➲ Tactical Notification HUD */}
            <Notification
                message={notify.message}
                type={notify.type}
                onClose={() => setNotify({ message: '', type: '' })}
            />

            {/* --- CYBERPUNK STYLING --- */}
            <style>{`
                .login-root {
                    height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background: #020202;
                    color: #fff;
                    font-family: 'Inter', sans-serif;
                    overflow: hidden;
                    position: relative;
                }

                .scanline {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), 
                                linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03));
                    background-size: 100% 4px, 3px 100%;
                    pointer-events: none;
                    z-index: 100;
                }

                .glass-panel {
                    background: rgba(10, 10, 10, 0.85);
                    border: 1px solid rgba(0, 210, 255, 0.2);
                    border-radius: 20px;
                    backdrop-filter: blur(20px);
                    box-shadow: 0 0 50px rgba(0,210,255,0.05);
                }

                .terminal-card {
                    width: 100%;
                    max-width: 450px;
                    padding: 50px;
                    text-align: center;
                    position: relative;
                    z-index: 20;
                }

                .orbitron { font-family: 'Orbitron', sans-serif; letter-spacing: 2px; }
                .mono { font-family: 'JetBrains Mono', monospace; }
                
                .title { font-size: 48px; margin: 0; letter-spacing: 10px; }
                .accent { color: #00d2ff; text-shadow: 0 0 20px rgba(0,210,255,0.5); }
                .subtitle { font-size: 10px; color: #555; margin-top: 10px; letter-spacing: 4px; }

                .input-field { text-align: left; }
                .input-field label { font-size: 10px; color: #00d2ff; margin-left: 5px; margin-bottom: 10px; display: block; letter-spacing: 2px; }
                
                .terminal-input {
                    width: 100%;
                    box-sizing: border-box;
                    padding: 20px;
                    background: #000;
                    border: 1px solid #222;
                    border-radius: 12px;
                    color: #00ffa3;
                    outline: none;
                    font-size: 16px;
                    transition: 0.3s;
                }

                .terminal-input:focus {
                    border-color: #00d2ff;
                    box-shadow: inset 0 0 15px rgba(0, 210, 255, 0.1);
                }
                .terminal-input:disabled { opacity: 0.5; cursor: not-allowed; }

                .initiate-btn {
                    width: 100%;
                    padding: 22px;
                    margin-top: 15px;
                    background: linear-gradient(45deg, #00d2ff, #9d50bb);
                    color: #fff;
                    border: none;
                    border-radius: 12px;
                    font-weight: 900;
                    font-size: 16px;
                    cursor: pointer;
                    transition: 0.4s;
                    box-shadow: 0 10px 30px rgba(0, 210, 255, 0.3);
                }

                .initiate-btn:hover {
                    transform: translateY(-2px);
                    filter: brightness(1.2);
                    box-shadow: 0 15px 40px rgba(0, 210, 255, 0.4);
                }

                .initiate-btn.loading {
                    background: #111;
                    color: #00d2ff;
                    cursor: wait;
                    box-shadow: none;
                    transform: none;
                    border: 1px solid #00d2ff;
                }

                .footer-links { margin-top: 40px; font-size: 11px; color: #555; }
                .forge-link { color: #00d2ff; text-decoration: none; margin-left: 5px; transition: 0.3s; }
                .forge-link:hover { color: #00ffa3; text-shadow: 0 0 10px #00ffa3; }

                .pulse { animation: pulseLogo 2.5s infinite; }
                @keyframes pulseLogo { 0%, 100% { opacity: 0.8; } 50% { opacity: 1; text-shadow: 0 0 30px rgba(0,210,255,0.6); } }
            `}</style>
        </div>
    );
};

export default Login;